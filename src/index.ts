import { Request, Response, Headers } from 'servie'
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
    let responded = false

    const req = new Request({
      connection: {
        localAddress: request.socket.localAddress,
        localPort: request.socket.localPort,
        remoteAddress: request.socket.remoteAddress,
        remotePort: request.socket.remotePort,
        encrypted: (request.socket as TLSSocket).encrypted
      },
      method: request.method,
      url: request.url!,
      body: request,
      headers: request.rawHeaders
    })

    const mapError = errorhandler(req, {
      production: options.production,
      log: options.logError
    })

    function sendError (err: Error) {
      return sendResponse(mapError(err))
    }

    function sendResponse (res: Response) {
      if (responded) {
        return
      }

      responded = true
      res.started = true
      req.events.emit('response', res)

      response.statusCode = res.status || 200
      response.statusMessage = res.statusText!

      if (res.headers.raw.length) {
        const headers = res.headers.object(true)

        for (const key of Object.keys(headers)) {
          response.setHeader(key, headers[key])
        }
      }

      if (res.bodyBuffered) {
        response.addTrailers(toTrailers(res.trailers))
        response.end(res.body)
      } else {
        const stream = res.stream()

        stream.on('error', sendError)
        stream.on('end', () => response.addTrailers(toTrailers(res.trailers)))

        stream.pipe(response)
      }
    }

    // Handle request and response errors.
    req.events.on('error', sendError)
    req.events.on('abort', () => sendResponse(new Response({ status: 444 })))

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
  const result: [string, string][] = new Array(trailers.raw.length / 2)

  for (let i = 0; i < trailers.raw.length; i += 2) {
    result[i / 2] = [trailers.raw[i], trailers.raw[i + 1]]
  }

  return result
}
