function buildQuery(params: Record<string, any>): string {
  const parts: string[] = []
  function add(val: any, prefix: string) {
    if (val === null || val === undefined) return
    if (Array.isArray(val)) val.forEach((v, i) => add(v, `${prefix}[${i}]`))
    else if (typeof val === 'object') Object.keys(val).forEach(k => add(val[k], `${prefix}[${k}]`))
    else parts.push(`${prefix}=${encodeURIComponent(String(val))}`)
  }
  Object.keys(params).forEach(k => add(params[k], k))
  return parts.join('&')
}

export const useStrapi = () => {
  const config = useRuntimeConfig()
  const baseURL = `${config.public.apiUrl}/api`

  const getHeaders = (): Record<string, string> => {
    const token = config.strapiToken as string | undefined
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  const find = <T = any>(collection: string, params?: Record<string, any>) => {
    const query = params ? buildQuery(params) : ''
    return $fetch<T>(`${baseURL}/${collection}${query ? '?' + query : ''}`, {
      headers: getHeaders(),
    })
  }

  const findOne = <T = any>(collection: string, id: string | number, params?: Record<string, any>) => {
    const query = params ? buildQuery(params) : ''
    return $fetch<T>(`${baseURL}/${collection}/${id}${query ? '?' + query : ''}`, {
      headers: getHeaders(),
    })
  }

  return { find, findOne }
}
