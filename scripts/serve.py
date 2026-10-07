#!/usr/bin/env python3
"""Read-only classroom server: no uploads or student-data logging."""
import argparse
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from functools import partial

class Handler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache')
        self.send_header('X-Content-Type-Options', 'nosniff')
        super().end_headers()
    def do_GET(self):
        if any(part.startswith('.') for part in self.path.split('/')):
            self.send_error(404)
            return
        super().do_GET()
    def list_directory(self, path):
        self.send_error(404)
        return None

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--host', default='0.0.0.0')
    parser.add_argument('--port', type=int, default=8080)
    parser.add_argument('--directory', type=Path, help='Serve a built static editor directory')
    args = parser.parse_args()
    release = Path(__file__).resolve().parent.parent
    root = args.directory.resolve() if args.directory else (release / 'site' if (release / 'site').is_dir() else release)
    if not (root / 'index.html').is_file():
        parser.error(f'No editor index.html in {root}')
    server = ThreadingHTTPServer((args.host, args.port), partial(Handler, directory=str(root)))
    print(f'Pixel Workshop listening on {args.host}:{args.port}', flush=True)
    server.serve_forever()
