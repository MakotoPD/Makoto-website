export function r2Endpoint(accountId: string, endpoint?: string) {
  const url = new URL(endpoint || `https://${accountId}.r2.cloudflarestorage.com`)
  const hosts = ['', '.eu', '.us', '.fedramp'].map(jurisdiction => `${accountId}${jurisdiction}.r2.cloudflarestorage.com`)
  if (url.protocol !== 'https:' || !hosts.includes(url.hostname) || url.port || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('R2_ENDPOINT must be the Cloudflare S3 endpoint for R2_ACCOUNT_ID')
  }
  return url.origin
}
