#!/usr/bin/env python3
"""
Simple HTTP Server for Baytna Al-Falastini Website
Run this script to serve the website locally
"""

import http.server
import socketserver
import webbrowser
import os

# Configuration
PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

def run_server():
    """Start the HTTP server and open browser"""
    try:
        with socketserver.TCPServer(("", PORT), Handler) as httpd:
            print(f"🚀 Server started at http://localhost:{PORT}")
            print(f"📁 Serving directory: {DIRECTORY}")
            print("Press Ctrl+C to stop the server")
            
            # Open browser automatically
            webbrowser.open(f"http://localhost:{PORT}")
            
            # Keep server running
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print("\n🛑 Server stopped")
    except OSError as e:
        print(f"❌ Error: Port {PORT} is already in use")
        print("Try using a different port or stop the existing server")

if __name__ == "__main__":
    run_server()