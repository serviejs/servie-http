const { createServer } = require('http')
const express = require('express')

const port = 4000
const app = express()

app.get('/', function (req, res) {
  res.send('hello world')
})

createServer(app).listen(port, () => console.log('express running:', port))
