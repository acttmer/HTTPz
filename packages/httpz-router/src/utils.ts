export function removeTrailingSlashes(path: string) {
  return path.replace(/\/+$/, '')
}

export function parseRoutePath(path: string): {
  params: string[]
  pattern: RegExp
} {
  const params: string[] = []
  const pattern = new RegExp(
    `^${path.replace(/:\w+/g, param => {
      params.push(param.slice(1))
      return '([^/]+)'
    })}$`,
  )

  return { params, pattern }
}
