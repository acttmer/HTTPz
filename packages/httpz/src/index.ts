import { createServer, type Server } from 'http'
import { HTTPResponse } from './http-response'
import type { Middleware, Request, Response } from './interface'
import { bodyParser, querystringParser } from './parsers'

export * from './http-error'
export * from './http-response'
export type * from './interface'
export * from './parsers'

export class HTTPz {
  private readonly server: Server
  private readonly middlewares: Middleware[]

  constructor() {
    this.server = createServer(async (req, res) => {
      try {
        for (const middleware of this.middlewares) {
          const result = await middleware(req as Request, res as Response)

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

    this.middlewares = [querystringParser(), bodyParser()]
  }

  /**
   * Use a middleware
   * @param {Middleware} middleware
   * @returns {HTTPz}
   */
  use(middleware: Middleware): HTTPz {
    return this.middlewares.push(middleware), this
  }

  /**
   * Start a server listening for connections
   * @param {number} port
   * @param {string} hostname
   * @param {Function} cb
   * @returns {Server}
   */
  listen(port: number, hostname: string, cb?: () => void): Server {
    return this.server.listen(port, hostname, cb)
  }
}
