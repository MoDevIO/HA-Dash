import sys
import os
import json
from server import _ws_connect, _ws_recv, _ws_send, MA_HOST, MA_PORT

s = _ws_connect(MA_HOST, MA_PORT)
_ws_recv(s)

print("--- With Library False ---")
_ws_send(s, {
    'message_id': 1,
    'command': 'music/search',
    'search_query': 'taylor',
    'limit': 5,
    'media_types': ['track', 'artist', 'album', 'playlist'],
    'library': False
})
print(_ws_recv(s))

s.close()
