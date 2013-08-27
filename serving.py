#!/usr/bin/env python2
import SimpleHTTPServer
import SocketServer
import urllib2
import re
import sys

SimpleHTTPServer.SimpleHTTPRequestHandler.extensions_map['.webapp'] = 'application/x-web-app-manifest+json'


#return urllib2.urlopen(url + "?" + urllib.urlencode(params))

def cdic_proxy(word):
    url = 'http://cdict.info/wwwcdict.php'
    return urllib2.urlopen(url + "?word=" + word).read()
 

class Handler(SimpleHTTPServer.SimpleHTTPRequestHandler):
    def do_GET(self, *args, **kwargs):
        req = self.requestline.split()[1]   # query string
        reobj = re.search(r'/cdict\?word=(.*)', req)
        if reobj:
            print reobj.group(1)
            self.wfile.write(cdic_proxy(reobj.group(1)))
        else:
            SimpleHTTPServer.SimpleHTTPRequestHandler.do_GET(self, *args, **kwargs)
            

if __name__=='__main__':
    port = int(sys.argv[1])
    httpd = SocketServer.TCPServer(("", port), Handler)
    print 'Serving HTTP on 0.0.0.0 port', port, '...'
    httpd.serve_forever()

