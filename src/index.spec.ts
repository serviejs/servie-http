import { Response } from 'servie'
import { get } from 'servie-route'
import { request } from 'popsicle'
import popsicleServer = require('popsicle-server')
import { createHandler } from './index'

describe('servie-http', () => {
  const handler = createHandler(get('/', () => {
    return new Response({ body: 'hello world' })
  }))

  it('should work over http', () => {
    return request('/')
      .use(popsicleServer(handler))
      .then((res) => {
        expect(res.body).toBe('hello world')
      })
  })
})
