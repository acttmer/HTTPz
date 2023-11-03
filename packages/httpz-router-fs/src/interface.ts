import type {
  DefaultBody,
  DefaultHeaders,
  DefaultParams,
  DefaultQuery,
  Middleware,
} from '@httpz/core'
import type { RouteHandler, RouteSchema } from '@httpz/router'
import type { TypeOf, ZodType } from 'zod'

type LazyCallback<T> = () => T
type LazyCallbackOr<T> = LazyCallback<T> | T

type Static<T, U> = [T] extends [ZodType] ? TypeOf<T> : U

export interface FileRoute<Schema extends RouteSchema = {}> {
  name?: string
  schema?: LazyCallbackOr<Schema>
  middlewares?: LazyCallbackOr<readonly Middleware[]>
  handler: RouteHandler<
    Static<Schema['params'], DefaultParams>,
    Static<Schema['query'], DefaultQuery>,
    Static<Schema['body'], DefaultBody>,
    Static<Schema['headers'], DefaultHeaders>
  >
}
