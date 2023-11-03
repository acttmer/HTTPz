import { createServer, type Server } from 'http'
import { HTTPResponse } from './http-response'
import type { Middleware, Request, Response } from './interface'
import { bodyParser, querystringParser } from './parsers'

export * from './http-error'
export * from './http-response'
export type * from './interface'
export * from './parsers'

export class HTTPz {
  private _server: Server
  private _middlewares: Middleware[]

  constructor() {
    this._server = createServer()
    this._middlewares = [querystringParser(), bodyParser()]
  }

  get server(): Server {
    return this._server
  }

  /**
   * Use a middleware
   * @param {Middleware} middleware
   * @returns {HTTPz}
   */
  use(middleware: Middleware): HTTPz {
    return this._middlewares.push(middleware), this
  }

  /**
   * Start a server listening for connections
   * @param {number} port
   * @param {string} hostname
   * @param {Function} cb
   */
  listen(port: number, hostname: string, cb?: () => void): void {
    this._server.on('request', async (req: Request, res: Response) => {
      try {
        for (const middleware of this._middlewares) {
          const result = await middleware(req, res)

          if (result instanceof HTTPResponse) {
            return await result.callback(res)
          }

          if (res.writableEnded) {
            return
          }
        }
      } catch (error) {
        if (error instanceof Error) {
          return await HTTPResponse.error(error).callback(res)
        }

        throw error
      }
    })

    this._server.listen(port, hostname, cb)
  }
}
