import { OutgoingHttpHeaders } from 'http'
import { HTTPError } from './http-error'
import { Response } from './interface'

export namespace HTTPResponse {
  export type Body = unknown

  export interface SuccessParams {
    statusCode?: number
    headers?: OutgoingHttpHeaders
  }
}

export class HTTPResponse {
  /**
   * Construct a success JSON response
   * @param {HTTPResponse.Body} body
   * @param {HTTPResponse.JSONParams} params
   * @returns
   */
  static success(
    body: HTTPResponse.Body,
    params: HTTPResponse.SuccessParams = {},
  ): HTTPResponse {
    return new HTTPResponse({
      body,
      headers: {
        'Content-Type': 'application/json',
        ...params.headers,
      },
    })
  }

  /**
   * Construct an error JSON response
   * @param {Error} error
   * @returns {HTTPResponse}
   */
  static error(error: Error): HTTPResponse {
    if (error instanceof HTTPError) {
      return new HTTPResponse({
        statusCode: error.statusCode,
        body: {
          code: error.statusCode,
          message: error.message,
          data: error.data,
        },
        headers: {
          'Content-Type': 'application/json',
        },
      })
    }

    return new HTTPResponse({
      statusCode: 500,
      body: {
        code: 500,
        message: error.message,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }

  readonly statusCode: number
  readonly headers: OutgoingHttpHeaders
  readonly body: HTTPResponse.Body

  constructor({
    statusCode = 200,
    headers = {},
    body,
  }: {
    statusCode?: number
    headers?: OutgoingHttpHeaders
    body: HTTPResponse.Body
  }) {
    this.statusCode = statusCode
    this.headers = headers
    this.body = body
  }

  /**
   * Callback function to write the http response
   * @param {Response} res
   */
  async callback(res: Response): Promise<void> {
    res.statusCode = this.statusCode

    Object.entries(this.headers).forEach(([name, value]) => {
      if (value !== undefined) {
        res.setHeader(name, value)
      }
    })

    res.end(JSON.stringify(this.body))
  }
}
