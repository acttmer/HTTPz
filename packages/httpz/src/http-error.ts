export class HTTPError extends Error {
  public readonly statusCode: number
  public readonly data?: unknown

  constructor({
    statusCode,
    message,
    data,
  }: {
    statusCode: number
    message?: string
    data?: unknown
  }) {
    super(message)

    this.statusCode = statusCode
    this.data = data
  }
}
