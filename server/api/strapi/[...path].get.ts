/**
 * Proxy server-side dla Strapi API.
 * Przeglądarka nie ma dostępu do config.strapiToken (prywatny config),
 * więc wszystkie requesty z klienta trafiają tutaj, gdzie token jest dodawany.
 *
 * Przykład: klient wywołuje /api/strapi/articles?locale=pl
 *           → serwer proxy przekazuje do https://api.makoto.com.pl/api/articles?locale=pl
 *             z nagłówkiem Authorization: Bearer <token>
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const path = getRouterParam(event, 'path')
  const url = getRequestURL(event)

  console.log('[strapi-proxy] token present:', !!config.strapiToken, '| token prefix:', String(config.strapiToken).slice(0, 8))

  return await $fetch(`${config.public.apiUrl}/api/${path}${url.search}`, {
    headers: config.strapiToken
      ? { Authorization: `Bearer ${config.strapiToken}` }
      : {},
  })
})
