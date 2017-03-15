import { Request, Response } from 'servie'
import { IncomingMessage, ServerResponse } from 'http'
import { TLSSocket } from 'tls'
import { finalhandler } from 'servie-finalhandler'
import { errorhandler } from 'servie-errorhandler'

export type App = (req: Request, next: () => Promise<Response>) => Promise<Response>

export interface Options {
  production?: boolean
  logError?: (err: any) => void
}

export function createHandler (app: App, options: Options = {}) {
  return function (request: IncomingMessage, response: ServerResponse): void {
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

      for (let i = 0; i < res.headers.raw.length; i += 2) {
        response.setHeader(res.headers.raw[i], res.headers.raw[i + 1])
      }

      if (res.bodyBuffered) {
        response.end(res.body)
      } else {
        res.stream().pipe(response).on('error', (err: Error) => sendError(err))
      }
    }

    // Handle request and response errors.
    req.events.on('error', (err: Error) => sendError(err))
    req.events.on('abort', () => sendResponse(new Response({ status: 444 })))

    req.started = true

    app(req, finalhandler(req))
      .then(
        (res) => sendResponse(res),
        (err) => sendError(err)
      )
  }
}
