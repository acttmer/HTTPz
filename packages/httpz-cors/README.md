# HTTPz CORS

CORS middleware for HTTPz

## What to know

It's same as the CORS middleware for express

## Example

```typescript
import { HTTPz } from '@httpz/core'
import { cors } from '@httpz/cors'

const httpz = new HTTPz()

httpz.use(cors())
httpz.listen(3579, '0.0.0.0')
```
