import { HTTPError } from './http-error'
import { Middleware } from './interface'

/**
 * Construct a querystring parser middleware
 * @returns {Middleware}
 */
export function querystringParser(): Middleware {
  return req => {
    if (req.method === undefined || req.url === undefined) {
      throw new HTTPError({
        statusCode: 400,
        message: `Invalid http request method or url`,
      })
    }

    const { url } = req
    const { searchParams } = new URL(url, `http://localhost`)

    Object.assign(req, {
      query: Object.fromEntries(searchParams),
    })
  }
}

/**
 * Construct a body parser middleware
 * @returns {Middleware}
 */
export function bodyParser(): Middleware {
  return async req => {
    if (
      req.headers['content-type'] &&
      req.headers['content-type'] !== 'application/json'
    ) {
      throw new HTTPError({
        statusCode: 400,
        message: `Unsupported content-type '${req.headers['content-type']}'`,
      })
    }

    const body = await new Promise<any>(resolve => {
      let payload = ''

      req.on('data', chunk => {
        payload += chunk
      })

      req.on('end', () => {
        if (payload.length > 0) {
          try {
            resolve(JSON.parse(payload))
          } catch {
            resolve(null)
          }
        } else {
          resolve(null)
        }
      })

      req.on('error', () => resolve(null))
    })

    Object.assign(req, { body })
  }
}
