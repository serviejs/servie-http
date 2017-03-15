const { createServer } = require('http')
const parseurl = require('parseurl')

const port = 4000

function app (req, res) {
  const Url = parseurl(req)

  if (req.method === 'GET' && Url.pathname === '/') {
    res.setHeader('Content-Type', 'text/plain')
    res.setHeader('Content-Length', '11')
    res.end('hello world')
    return
  }

  res.statusCode = 404
  res.end()
}

createServer(app).listen(port, () => console.log('http running:', port))
