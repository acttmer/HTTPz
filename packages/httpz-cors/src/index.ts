import type { Middleware, Request, Response } from '@httpz/core'
import { vary } from './utils'

export interface AccessControlOptions {
  origin?:
    | string
    | boolean
    | ((req: Request, res: Response) => string)
    | Array<string>
    | RegExp
  methods?: string[]
  allowedHeaders?: string[]
  exposedHeaders?: string[]
  credentials?: boolean
  maxAge?: number
  optionsSuccessStatus?: number
  preflightContinue?: boolean
}

export function cors({
  origin = '*',
  methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD'],
  allowedHeaders,
  exposedHeaders,
  credentials,
  maxAge,
  optionsSuccessStatus = 204,
  preflightContinue = false,
}: AccessControlOptions = {}): Middleware {
  return async (req, res) => {
    if (typeof origin === 'boolean' && origin) {
      res.setHeader('Access-Control-Allow-Origin', '*')
    } else if (typeof origin === 'string') {
      res.setHeader('Access-Control-Allow-Origin', origin)
    } else if (typeof origin === 'function') {
      res.setHeader('Access-Control-Allow-Origin', origin(req, res))
    } else if (typeof origin === 'object' && req.headers.origin) {
      if (
        Array.isArray(origin) &&
        (origin.includes(req.headers.origin) || origin.includes('*'))
      ) {
        res.setHeader('Access-Control-Allow-Origin', req.headers.origin)
      } else if (origin instanceof RegExp && origin.test(req.headers.origin)) {
        res.setHeader('Access-Control-Allow-Origin', req.headers.origin)
      }
    }

    if (
      (typeof origin === 'string' && origin !== '*') ||
      typeof origin === 'function'
    ) {
      vary(res, 'Origin')
    }

    res.setHeader(
      'Access-Control-Allow-Methods',
      methods.join(', ').toUpperCase(),
    )

    if (allowedHeaders) {
      res.setHeader('Access-Control-Allow-Headers', allowedHeaders.join(', '))
    } else {
      const requestHeaders = req.headers['access-control-request-headers']

      if (requestHeaders) {
        res.setHeader('Access-Control-Allow-Headers', requestHeaders)
      }

      vary(res, 'Access-Control-Request-Headers')
    }

    if (exposedHeaders) {
      res.setHeader('Access-Control-Expose-Headers', exposedHeaders.join(', '))
    }

    if (credentials) {
      res.setHeader('Access-Control-Allow-Credentials', 'true')
    }

    if (maxAge) {
      res.setHeader('Access-Control-Max-Age', maxAge)
    }

    if (req.method?.toUpperCase?.() === 'OPTIONS') {
      if (!preflightContinue) {
        res.statusCode = optionsSuccessStatus
        res.setHeader('Content-Length', '0')
        res.end()
      }
    }
  }
}
