// Proxy server handles auth — dashboard uses relative /api/* URLs (no CORS)
const HA_CONFIG = {
  url: '',   // empty = same origin, proxied by server.py
  token: '', // token lives server-side in server.py
};
