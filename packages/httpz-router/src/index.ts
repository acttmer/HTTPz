import {
  HTTPError,
  HTTPResponse,
  type DefaultParams,
  type Middleware,
} from '@httpz/core'
import type { Route, RouteCompiled, RouteSchema } from './interface'
import { parseRoutePath, removeTrailingSlashes } from './utils'

export type * from './interface'

export interface RouterInit {
  prefix?: string
}

export class Router {
  private _prefix: string
  private _middlewares: Middleware[]
  private _routes: Route[]

  constructor({ prefix = '' }: RouterInit = {}) {
    this._prefix = prefix
    this._middlewares = []
    this._routes = []
  }

  /**
   * Get all routes
   * @returns {ReadonlyArray<Readonly<Route>>}
   */
  getRoutes(): ReadonlyArray<Readonly<Route>> {
    return this._routes.slice()
  }

  /**
   * Use a middleware or router
   * @param {Middleware} middleware
   */
  use(middleware: Middleware): Router
  use(path: string, router: Router): Router
  use(router: Router): Router
  use(routerOrPath: string | Router | Middleware, router?: Router) {
    if (typeof routerOrPath === 'string') {
      if (router) {
        for (const { path, ...route } of router._routes) {
          this.route({ path: routerOrPath + path, ...route })
        }
      }
    } else if (routerOrPath instanceof Router) {
      for (const route of routerOrPath._routes) {
        this.route(route)
      }
    } else {
      this._middlewares.push(routerOrPath)
    }

    return this
  }

  /**
   * Add a route
   * @param {Route<Schema>} params
   * @returns {Router}
   */
  route<Schema extends RouteSchema>({ path, ...route }: Route<Schema>): Router {
    this._routes.push({
      path: this._prefix + path,
      ...route,
    })

    return this
  }

  /**
   * Compile all routes into a middleware
   * @returns {Middleware}
   */
  middleware(): Middleware {
    const routes = this._routes.map(route => {
      const { name, method, path, schema, middlewares = [], handler } = route
      const { pattern, params } = parseRoutePath(path)

      return {
        name,
        method,
        path,
        pattern,
        params,
        schema: typeof schema === 'function' ? schema() : schema,
        middlewares:
          typeof middlewares === 'function' ? middlewares() : middlewares,
        handler,
      } satisfies RouteCompiled
    })

    return async (req, res) => {
      for (const middleware of this._middlewares) {
        const result = await middleware(req, res)

        if (result instanceof HTTPResponse) {
          return await result.callback(res)
        }

        if (res.writableEnded) {
          return
        }
      }

      if (req.method === undefined || req.url === undefined) {
        throw new HTTPError({
          statusCode: 400,
          message: 'Invalid http method or url',
        })
      }

      const { method, url } = req
      const { pathname } = new URL(url, `http://localhost`)

      for (const route of routes) {
        if (route.method !== method.toUpperCase()) {
          continue
        }

        const match = removeTrailingSlashes(pathname).match(route.pattern)

        if (match === null) {
          continue
        }

        const params = match.slice(1).reduce((prev, curr, index) => {
          prev[route.params[index]] = curr
          return prev
        }, {} as DefaultParams)

        const request = Object.assign(req, { params })

        const { schema, middlewares, handler } = route

        if (schema) {
          if (schema.params) {
            const parsed = await schema.params.safeParseAsync(request.params)

            if (!parsed.success) {
              throw new HTTPError({
                statusCode: 400,
                message: 'Invalid request params',
                data: { issues: parsed.error.issues },
              })
            }

            Object.assign(request.params, parsed.data)
          }

          if (schema.query) {
            const parsed = await schema.query.safeParseAsync(request.query)

            if (!parsed.success) {
              throw new HTTPError({
                statusCode: 400,
                message: 'Invalid request query',
                data: { issues: parsed.error.issues },
              })
            }

            Object.assign(request.query, parsed.data)
          }

          if (schema.body) {
            const parsed = await schema.body.safeParseAsync(request.body)

            if (!parsed.success) {
              throw new HTTPError({
                statusCode: 400,
                message: 'Invalid request body',
                data: { issues: parsed.error.issues },
              })
            }

            if (request.body !== null) {
              Object.assign(request.body, parsed.data)
            }
          }

          if (schema.headers) {
            const parsed = await schema.headers.safeParseAsync(request.headers)

            if (!parsed.success) {
              throw new HTTPError({
                statusCode: 400,
                message: 'Invalid request headers',
                data: { issues: parsed.error.issues },
              })
            }

            Object.assign(request.headers, parsed.data)
          }
        }

        for (const middleware of middlewares) {
          const result = await middleware(req, res)

          if (result instanceof HTTPResponse) {
            return await result.callback(res)
          }

          if (res.writableEnded) {
            return
          }
        }

        return await handler(request, res)
      }

      throw new HTTPError({
        statusCode: 404,
        message: 'Not found',
        data: {
          method,
          pathname,
        },
      })
    }
  }
}
