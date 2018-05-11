const { createServer } = require('http')
const { Response } = require('servie')
const { createBody } = require('servie/dist/body/node')
const route = require('servie-route')
const { createHandler } = require('../dist/index')

const port = 4000

const app = createHandler(route.get('/', () => {
  return new Response({ body: createBody('hello world') })
}))

createServer(app).listen(port, () => console.log('servie running:', port))
