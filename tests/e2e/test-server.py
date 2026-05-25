#!/usr/bin/env python3
"""SPA server for E2E tests with API proxy to backend."""
import http.client
import http.server
import json
import os
import socketserver
import sys
import urllib.parse

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
DIST_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../apps/web/dist"))
BASE_PATH = "/OrthoPlus-Enterprise"
API_BASE = "http://localhost:3005"

class ReusableTCPServer(socketserver.TCPServer):
    allow_reuse_address = True

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIST_DIR, **kwargs)

    def do_GET(self):
        if self.path.startswith("/api/"):
            self._proxy_to_backend("GET")
        else:
            self._handle_request()

    def do_POST(self):
        self._proxy_to_backend("POST")

    def do_PUT(self):
        self._proxy_to_backend("PUT")

    def do_PATCH(self):
        self._proxy_to_backend("PATCH")

    def do_DELETE(self):
        self._proxy_to_backend("DELETE")

    def do_OPTIONS(self):
        self._send_cors()

    def _send_cors(self):
        self.send_response(200)
        origin = self.headers.get("Origin", "*")
        self.send_header("Access-Control-Allow-Origin", origin)
        self.send_header("Access-Control-Allow-Credentials", "true")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()

    def _proxy_to_backend(self, method):
        if not self.path.startswith("/api/"):
            self._handle_request()
            return
        url = urllib.parse.urlparse(API_BASE)
        conn = http.client.HTTPConnection(url.hostname, url.port or 80)
        content_length = self.headers.get("Content-Length", 0)
        body = self.rfile.read(int(content_length)) if content_length else None
        headers = {k: v for k, v in self.headers.items() if k.lower() not in ("host", "content-length")}
        try:
            conn.request(method, self.path, body=body, headers=headers)
            resp = conn.getresponse()
            self.send_response(resp.status)
            for k, v in resp.getheaders():
                if k.lower() not in ("transfer-encoding", "content-encoding", "connection"):
                    self.send_header(k, v)
            origin = self.headers.get("Origin", "*")
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Access-Control-Allow-Credentials", "true")
            self.end_headers()
            data = resp.read()
            self.wfile.write(data)
            self.wfile.flush()
        except Exception as e:
            self.send_response(502)
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode())
        finally:
            conn.close()

    def _handle_request(self):
        path = self.path
        if path.startswith(BASE_PATH):
            path = path[len(BASE_PATH):]
        if not path or path == "/":
            path = "/index.html"

        full_path = os.path.join(DIST_DIR, path.lstrip("/"))
        if os.path.exists(full_path) and os.path.isfile(full_path):
            self.path = path
            super().do_GET()
            return

        # Fallback to index.html for SPA routes
        self.path = "/index.html"
        super().do_GET()

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

with ReusableTCPServer(("", PORT), Handler) as httpd:
    print(f"Serving {DIST_DIR} at http://localhost:{PORT}{BASE_PATH}/")
    print(f"Proxying /api/* to {API_BASE}")
    httpd.serve_forever()
