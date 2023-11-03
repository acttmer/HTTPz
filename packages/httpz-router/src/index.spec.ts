import { HTTPError, HTTPResponse, HTTPz } from '@httpz/core'
import { Router } from '.'
import { z } from 'zod'
import { assert } from 'chai'

describe('httpz-router', () => {
  it('router', async () => {
    HTTPResponse.success = body => {
      return new HTTPResponse({
        statusCode: 200,
        body: {
          code: 200,
          message: 'Success',
          data: body,
        },
        headers: {
          'Content-Type': 'application/json',
        },
      })
    }

    const httpz = new HTTPz()
    const router = new Router()

    router.route({
      method: 'GET',
      path: '/test',
      schema: {
        query: z.object({
          token: z.string(),
        }),
      },
      handler: req => {
        const { token } = req.query

        if (token !== 'abc') {
          throw new HTTPError({
            statusCode: 403,
            message: 'Invalid token',
          })
        }

        return HTTPResponse.success({ token })
      },
    })

    httpz.use(router.middleware())
    httpz.listen(3579, '0.0.0.0')

    {
      const res = await fetch('http://localhost:3579/test?token=abc')
      const json = await res.json()

      assert.deepEqual(json, {
        code: 200,
        message: 'Success',
        data: {
          token: 'abc',
        },
      })
    }

    {
      const res = await fetch('http://localhost:3579/404')
      const json = await res.json()

      assert.deepEqual(json, {
        code: 404,
        message: 'Not found',
        data: {
          method: 'GET',
          pathname: '/404',
        },
      })
    }
  })
})
