#!/usr/bin/env python3
"""
HA Dashboard dev server — serves static files AND proxies /api/* to Home Assistant.
/ma-playlists fetches playlists from Music Assistant via WebSocket.
Run: python3 server.py
Open: http://localhost:8765
"""
import os, json, socket, struct, base64, random, threading
from http.server import HTTPServer, SimpleHTTPRequestHandler
import urllib.request, urllib.error

HA_URL  = 'http://192.168.178.23:8123'
MA_HOST = '192.168.178.23'
MA_PORT = 8095
TOKEN   = open(os.path.join(os.path.dirname(__file__), '.env')).read()
TOKEN   = next(l.split('=', 1)[1].strip() for l in TOKEN.splitlines() if l.startswith('HA_TOKEN'))
PORT    = 8765

# ── Minimal WebSocket client (no external deps) ───────────────────────────────

def _ws_connect(host, port, path='/ws', timeout=8):
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.settimeout(timeout)
    s.connect((host, port))
    key = base64.b64encode(bytes(random.getrandbits(8) for _ in range(16))).decode()
    handshake = (
        f'GET {path} HTTP/1.1\r\n'
        f'Host: {host}:{port}\r\n'
        'Upgrade: websocket\r\nConnection: Upgrade\r\n'
        f'Sec-WebSocket-Key: {key}\r\n'
        'Sec-WebSocket-Version: 13\r\n\r\n'
    )
    s.sendall(handshake.encode())
    buf = b''
    while b'\r\n\r\n' not in buf:
        buf += s.recv(4096)
    if b'101' not in buf:
        raise RuntimeError(f'WS handshake failed: {buf[:200]}')
    return s

def _ws_send(s, data):
    payload = json.dumps(data).encode()
    mask    = bytes(random.getrandbits(8) for _ in range(4))
    masked  = bytes(b ^ mask[i % 4] for i, b in enumerate(payload))
    n = len(payload)
    if n < 126:
        header = bytes([0x81, 0x80 | n]) + mask
    else:
        header = bytes([0x81, 0xFE]) + struct.pack('>H', n) + mask
    s.sendall(header + masked)

def _ws_recv(s):
    def read_exact(n):
        buf = b''
        while len(buf) < n:
            chunk = s.recv(n - len(buf))
            if not chunk:
                raise RuntimeError('WS connection closed')
            buf += chunk
        return buf
    h = read_exact(2)
    opcode = h[0] & 0x0F
    length = h[1] & 0x7F
    if length == 126:
        length = struct.unpack('>H', read_exact(2))[0]
    elif length == 127:
        length = struct.unpack('>Q', read_exact(8))[0]
    payload = read_exact(length)
    if opcode == 8:
        return None  # close frame
    return json.loads(payload.decode())

def get_ma_config_entry():
    import urllib.request
    req = urllib.request.Request(f"{HA_URL}/api/config/config_entries/entry", headers={'Authorization': f'Bearer {TOKEN}'})
    try:
        with urllib.request.urlopen(req) as response:
            entries = json.loads(response.read().decode())
            for e in entries:
                if e.get('domain') == 'music_assistant':
                    return e['entry_id']
    except Exception as e:
        print(f"Error fetching config entries: {e}")
    return None

def fetch_ma_playlists():
    """Fetch playlists via HA REST API"""
    try:
        import urllib.request
        entry_id = get_ma_config_entry()
        if not entry_id:
            return []
            
        payload = json.dumps({
            "config_entry_id": entry_id,
            "media_type": "playlist",
        }).encode('utf-8')
        
        req = urllib.request.Request(f"{HA_URL}/api/services/music_assistant/get_library?return_response=true", 
            data=payload,
            headers={
                'Authorization': f'Bearer {TOKEN}',
                'Content-Type': 'application/json'
            })
        res = urllib.request.urlopen(req).read().decode()
        items = json.loads(res).get('service_response', {}).get('items', [])
        return items
    except Exception as e:
        print(f"Error fetching playlists: {e}")
        return []

def search_ma(query, limit=5):
    """Search MA via HA REST API with library_only=False"""
    try:
        import urllib.request
        entry_id = get_ma_config_entry()
        if not entry_id:
            return {}

        payload = json.dumps({
            "config_entry_id": entry_id,
            "name": query,
            "library_only": False,
            "limit": limit
        }).encode('utf-8')

        req = urllib.request.Request(f"{HA_URL}/api/services/music_assistant/search?return_response=true", 
            data=payload,
            headers={
                'Authorization': f'Bearer {TOKEN}',
                'Content-Type': 'application/json'
            })
        res = urllib.request.urlopen(req).read().decode()
        return json.loads(res).get('service_response', {})
    except Exception as e:
        print(f"Error searching MA: {e}")
        return {}

def fetch_queue(entity_id):
    """Fetch MA queue for a player via HA REST service call."""
    url  = HA_URL + '/api/services/music_assistant/get_queue?return_response'
    body = json.dumps({'entity_id': entity_id}).encode()
    headers = {'Authorization': f'Bearer {TOKEN}', 'Content-Type': 'application/json'}
    req = urllib.request.Request(url, data=body, headers=headers, method='POST')
    with urllib.request.urlopen(req, timeout=8) as r:
        data = json.loads(r.read())
    return data.get('service_response', {}).get(entity_id, {})

# ── HTTP handler ──────────────────────────────────────────────────────────────

class Handler(SimpleHTTPRequestHandler):
    def log_message(self, fmt, *args):
        path = str(args[0]) if args else ''
        if any(x in path for x in ('/api/', '/ma-')):
            print(f'  →  {path}  {args[1] if len(args) > 1 else ""}')

    def _proxy(self, base_url):
        length  = int(self.headers.get('Content-Length', 0))
        body    = self.rfile.read(length) if length else None
        headers = {'Authorization': f'Bearer {TOKEN}', 'Content-Type': 'application/json'}
        req = urllib.request.Request(base_url + self.path, data=body, headers=headers, method=self.command)
        try:
            with urllib.request.urlopen(req, timeout=8) as r:
                data = r.read()
                self.send_response(r.status)
                self.send_header('Content-Type', r.headers.get('Content-Type', 'application/json'))
                self.send_header('Content-Length', len(data))
                self.send_header('Cache-Control', 'no-store')
                self.end_headers()
                self.wfile.write(data)
        except urllib.error.HTTPError as e:
            self.send_response(e.code); self.end_headers()
        except Exception as e:
            print(f'  proxy error: {e}')
            self.send_response(502); self.end_headers()

    def _serve_json(self, obj):
        data = json.dumps(obj).encode()
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', len(data))
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        if self.path.startswith('/api/'):
            self._proxy(HA_URL)
        elif self.path.startswith('/ma-queue'):
            from urllib.parse import urlparse, parse_qs
            eid = parse_qs(urlparse(self.path).query).get('entity_id', [''])[0]
            try:
                self._serve_json(fetch_queue(eid) if eid else {})
            except Exception as e:
                print(f'  [queue] error: {e}')
                self._serve_json({})
        elif self.path == '/ma-playlists':
            try:
                items = fetch_ma_playlists()
                self._serve_json(items)
            except Exception as e:
                print(f'  [MA] fetch error: {e}')
                self._serve_json({'error': str(e)})
        elif self.path.startswith('/ma-search'):
            from urllib.parse import urlparse, parse_qs
            q = parse_qs(urlparse(self.path).query).get('q', [''])[0]
            try:
                self._serve_json(search_ma(q) if q else {})
            except Exception as e:
                print(f'  [search] error: {e}')
                self._serve_json({'error': str(e)})
        else:
            super().do_GET()

    def do_POST(self):
        if self.path.startswith('/api/'):
            self._proxy(HA_URL)

if __name__ == '__main__':
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    print(f'Dashboard  →  http://localhost:{PORT}')
    print(f'Proxying   →  {HA_URL}')
    HTTPServer(('', PORT), Handler).serve_forever()
