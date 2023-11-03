# HTTPz Router

Router middleware for HTTPz

## What to know

- `zod` should be used for schema validation, it must be also installed as a peer dependency
- It's fast, but the algorithms used are not fully optimized

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
