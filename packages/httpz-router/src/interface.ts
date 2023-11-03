import type {
  DefaultBody,
  DefaultHeaders,
  DefaultParams,
  DefaultQuery,
  HTTPMethod,
  Middleware,
  Request,
  Response,
} from '@httpz/core'
import type { TypeOf, ZodType } from 'zod'

type LazyCallback<T> = () => T
type LazyCallbackOr<T> = LazyCallback<T> | T

type Static<T, U> = [T] extends [ZodType] ? TypeOf<T> : U

export interface RouteSchema {
  params?: ZodType
  query?: ZodType
  body?: ZodType
  headers?: ZodType
}

export type RouteHandler<
  Params = DefaultParams,
  Query = DefaultQuery,
  Body = DefaultBody,
  Headers = DefaultHeaders,
> = (
  req: Request<Params, Query, Body, Headers>,
  res: Response,
) => Promise<unknown> | unknown | Promise<void> | void

export interface Route<Schema extends RouteSchema = {}> {
  name?: string
  method: HTTPMethod
  path: string
  schema?: LazyCallbackOr<Schema>
  middlewares?: LazyCallbackOr<readonly Middleware[]>
  handler: RouteHandler<
    Static<Schema['params'], DefaultParams>,
    Static<Schema['query'], DefaultQuery>,
    Static<Schema['body'], DefaultBody>,
    Static<Schema['headers'], DefaultHeaders>
  >
}

export interface RouteCompiled {
  readonly name?: string
  readonly method: HTTPMethod
  readonly path: string
  readonly pattern: RegExp
  readonly params: readonly string[]
  readonly schema?: RouteSchema
  readonly middlewares: readonly Middleware[]
  readonly handler: RouteHandler
}
