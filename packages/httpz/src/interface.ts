import type {
  IncomingHttpHeaders,
  IncomingMessage,
  ServerResponse,
} from 'node:http'
import type { ParsedUrlQuery } from 'node:querystring'

export type HTTPMethod =
  | 'DELETE'
  | 'GET'
  | 'HEAD'
  | 'PATCH'
  | 'POST'
  | 'PUT'
  | 'OPTIONS'
  | 'PROPFIND'
  | 'PROPPATCH'
  | 'MKCOL'
  | 'COPY'
  | 'MOVE'
  | 'LOCK'
  | 'UNLOCK'
  | 'TRACE'
  | 'SEARCH'

export type DefaultParams = Record<string, string>
export type DefaultQuery = ParsedUrlQuery
export type DefaultBody = unknown
export type DefaultHeaders = IncomingHttpHeaders

export interface Request<
  Params = DefaultParams,
  Query = DefaultQuery,
  Body = DefaultBody,
  Headers = DefaultHeaders,
> extends Omit<IncomingMessage, 'headers'> {
  readonly params: Readonly<Params>
  readonly query: Readonly<Query>
  readonly body: Readonly<Body>
  readonly headers: Readonly<Headers>
}

export type Response = ServerResponse<IncomingMessage>

export type Middleware<
  Params = DefaultParams,
  Query = DefaultQuery,
  Body = DefaultBody,
  Headers = DefaultHeaders,
> = (
  req: Request<Params, Query, Body, Headers>,
  res: Response,
) => Promise<unknown> | unknown | Promise<void> | void
