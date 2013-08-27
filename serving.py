#!/usr/bin/env python2
from SimpleHTTPServer import SimpleHTTPRequestHandler as HTTPHandler
import SocketServer
import urllib2
import re
import sys

HTTPHandler.extensions_map['.webapp'] = 'application/x-web-app-manifest+json'

def cdic_proxy(params):
    url = 'http://cdict.info/'
    return urllib2.urlopen(url + params).read()
 

class Handler(HTTPHandler):
    def do_GET(self, *args, **kwargs):
        path = self.path
        reobj = re.search(r'/cdict/(.*)', path)
        if reobj:
            print reobj.group(1)
            self.wfile.write(cdic_proxy(reobj.group(1)))
        else:
            HTTPHandler.do_GET(self, *args, **kwargs)
            

def main():
    try:
        port = int(sys.argv[1])
    except:
        port = 8000
    httpd = SocketServer.TCPServer(("", port), Handler)
    print 'Serving HTTP on 0.0.0.0 port', port, '...'
    httpd.serve_forever()


if __name__=='__main__': main()

