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

  /**
   * Na serwerze (SSR) → wywołuj Strapi bezpośrednio z tokenem.
   * Na kliencie (nawigacja klientem) → wywołuj serwer-proxy Nuxt,
   * który doda token po stronie serwera. Dzięki temu token nigdy
   * nie trafia do przeglądarki (nie jest w config.public).
   */
  const getBaseURL = () => {
    if (import.meta.server) {
      return `${config.public.apiUrl}/api`
    }
    return '/api/strapi'
  }

  const getHeaders = (): Record<string, string> => {
    // Nagłówek potrzebny tylko po stronie serwera (na kliencie proxy go doda)
    if (import.meta.server) {
      const token = config.strapiToken as string | undefined
      return token ? { Authorization: `Bearer ${token}` } : {}
    }
    return {}
  }

  const find = <T = any>(collection: string, params?: Record<string, any>) => {
    const query = params ? buildQuery(params) : ''
    const baseURL = getBaseURL()
    return $fetch<T>(`${baseURL}/${collection}${query ? '?' + query : ''}`, {
      headers: getHeaders(),
    })
  }

  const findOne = <T = any>(collection: string, id: string | number, params?: Record<string, any>) => {
    const query = params ? buildQuery(params) : ''
    const baseURL = getBaseURL()
    return $fetch<T>(`${baseURL}/${collection}/${id}${query ? '?' + query : ''}`, {
      headers: getHeaders(),
    })
  }

  return { find, findOne }
}
