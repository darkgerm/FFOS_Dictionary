#!/usr/bin/env python2
import SimpleHTTPServer
import SocketServer
SimpleHTTPServer.SimpleHTTPRequestHandler.extensions_map['.webapp'] = 'application/x-web-app-manifest+json'
httpd = SocketServer.TCPServer(("", 8000), SimpleHTTPServer.SimpleHTTPRequestHandler)
print 'Serving HTTP on 0.0.0.0 port 8000 ...'
httpd.serve_forever()

