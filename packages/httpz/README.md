# HTTPz

A fast and simple JSON HTTP middleware framework.

## What to know

- HTTP is the only protocol supported (no HTTPs or HTTP/2).
- JSON (`application/json`) is the only supported content type.

## Example

```typescript
import { HTTPz } from '@httpz/core'
import { Router } from '@httpz/router'

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
```
