export default defineEventHandler(event => {
  const method = event.method
  if (method !== 'GET' && method !== 'HEAD') return
  const url = getRequestURL(event)
  if (url.pathname === '/' || !url.pathname.endsWith('/')) return
  if (/^\/(api|_nuxt)\//.test(url.pathname)) return
  url.pathname = url.pathname.replace(/\/+$/, '')
  return sendRedirect(event, `${url.pathname}${url.search}`, 301)
})
