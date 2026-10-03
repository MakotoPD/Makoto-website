export const isLoopback = (hostname: string) => ['localhost', '127.0.0.1', '[::1]'].includes(hostname)

export function allowedAdminOrigin(origin: string | undefined, requestUrl: URL, configured: string | undefined, development: boolean) {
  if (!origin || origin === 'null') return false
  // Local aliases are accepted only for same-origin development requests.
  if (development && isLoopback(requestUrl.hostname) && origin === requestUrl.origin) return true
  try { return origin === new URL(configured || requestUrl.origin).origin } catch { return false }
}
