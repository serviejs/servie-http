import pump = require('pump')
import { Request, Response, Headers, createHeaders } from 'servie'
import { createBody, Body } from 'servie/dist/body/node'
import { IncomingMessage, ServerResponse } from 'http'
import { TLSSocket } from 'tls'
import { finalhandler } from 'servie-finalhandler'
import { errorhandler } from 'servie-errorhandler'

export type App = (req: Request, next: () => Promise<Response>) => Promise<Response>

export interface Options {
  production?: boolean
  logError?: (err: any) => void
}

/**
 * Create a node.js-compatible http handler.
 */
export function createHandler (app: App, options: Options = {}) {
  return function (request: IncomingMessage, response: ServerResponse): Promise<void> {
    let hasResponded = false

    const req = new Request({
      connection: {
        localAddress: request.socket.localAddress,
        localPort: request.socket.localPort,
        remoteAddress: request.socket.remoteAddress,
        remotePort: request.socket.remotePort,
        encrypted: !!(request.socket as TLSSocket).encrypted
      },
      method: request.method,
      url: request.url!,
      body: createBody(request),
      headers: createHeaders(request.rawHeaders)
    })

    const mapError = errorhandler(req, {
      production: options.production,
      log: options.logError
    })

    function sendError (err: Error) {
      return sendResponse(mapError(err))
    }

    function sendResponse (res: Response): void {
      if (hasResponded) return

      hasResponded = true
      res.started = true
      req.events.emit('response', res)

      if (res.statusCode) response.statusCode = res.statusCode
      if (res.statusMessage) response.statusMessage = res.statusMessage

      const headers = res.allHeaders.asObject(false)

      for (const key of Object.keys(headers)) {
        response.setHeader(key, headers[key])
      }

      if (!(res.body instanceof Body)) {
        throw new TypeError('Transport only supports node.js bodies')
      }

      Promise.all([
        res.trailer.then(trailer => {
          if (trailer.rawHeaders.length) response.addTrailers(toTrailers(trailer))
        }),
        res.body.buffered
          ? res.body.buffer().then(buffer => { res.finished = true; response.end(buffer) })
          : Promise.resolve(void pump(res.body.stream(), response, () => { res.finished = true }))
      ]).catch(sendError)
    }

    // Handle request and response errors.
    req.events.on('error', sendError)
    req.events.on('abort', () => sendResponse(new Response({ statusCode: 444 })))

    req.started = true

    return Promise.resolve(app(req, finalhandler(req)))
      .then(
        (res) => sendResponse(res),
        (err) => sendError(err)
      )
  }
}

/**
 * Convert the trailers object into a list of trailers for node.js.
 */
function toTrailers (trailers: Headers): any {
  const result: [string, string][] = new Array(trailers.rawHeaders.length / 2)

  for (let i = 0; i < trailers.rawHeaders.length; i += 2) {
    result[i / 2] = [trailers.rawHeaders[i], trailers.rawHeaders[i + 1]]
  }

  return result
}
