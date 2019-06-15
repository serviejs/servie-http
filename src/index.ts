import pump = require("pump");
import { Request, Response, RequestOptions } from "servie/dist/node";
import { useRawBody } from "servie/dist/common";
import { IncomingMessage, ServerResponse } from "http";
import { finalhandler } from "servie-finalhandler";
import { errorhandler } from "servie-errorhandler";

/**
 * Node.js HTTP request options.
 */
export interface HttpRequestOptions extends RequestOptions {
  request: IncomingMessage;
}

/**
 * Node.js HTTP request class.
 */
export class HttpRequest extends Request {
  request: IncomingMessage;

  constructor(input: string | Request, options: HttpRequestOptions) {
    super(input, options);
    this.request = options.request;
  }
}

/**
 * HTTP server application signature.
 */
export type App = (
  req: HttpRequest,
  next: () => Promise<Response>
) => Response | Promise<Response>;

/**
 * HTTP server options.
 */
export interface Options {
  production?: boolean;
  logError?: (err: any) => void;
}

/**
 * Create a node.js-compatible http handler.
 */
export function createHandler(app: App, options: Options = {}) {
  return function(
    request: IncomingMessage,
    response: ServerResponse
  ): Promise<void> {
    let didRespond = false;

    const req = new HttpRequest(request.url || "/", {
      method: request.method,
      body: request,
      headers: request.headers,
      omitDefaultHeaders: true,
      request: request
    });

    const mapError = errorhandler(req, {
      production: options.production,
      log: options.logError
    });

    function sendError(err: Error) {
      return sendResponse(mapError(err));
    }

    function sendResponse(res: Response): void {
      if (didRespond) return;

      didRespond = true;
      req.signal.emit("responseStarted");

      if (res.status) response.statusCode = res.status;
      if (res.statusText) response.statusMessage = res.statusText;

      const headers = res.headers.asObject();
      const rawBody = useRawBody(res);

      for (const key of Object.keys(headers)) {
        response.setHeader(key, headers[key]);
      }

      Promise.all([
        res.trailer.then(trailer => {
          response.addTrailers(trailer.asObject());
        }),
        // Creating a stream is super expensive, use buffered values when possible.
        rawBody === null
          ? new Promise(resolve => {
              req.signal.emit("responseEnded");
              response.end();
              return resolve();
            })
          : Buffer.isBuffer(rawBody) || typeof rawBody === "string"
          ? new Promise<undefined>(resolve => {
              response.write(rawBody);
              response.end();
              req.signal.emit("responseEnded");
              return resolve();
            })
          : new Promise<undefined>((resolve, reject) => {
              pump(rawBody, response, err => {
                req.signal.emit("responseEnded");
                return err ? reject(err) : resolve();
              });
            })
      ]).catch(sendError);
    }

    req.signal.on("abort", () => request.destroy());

    req.signal.emit("requestStarted");

    return Promise.resolve(app(req, finalhandler(req))).then(
      res => sendResponse(res),
      err => sendError(err)
    );
  };
}
