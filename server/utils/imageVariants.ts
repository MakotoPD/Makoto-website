import sharp from 'sharp'

export const imageSizes = { small: 500, medium: 1000, big: 1800 } as const
export type ImageSize = keyof typeof imageSizes
const cache = new Map<string, Buffer>()
const pending = new Map<string, Promise<Buffer>>()
let bytes = 0
const budget = 64 * 1024 * 1024

export function imageVariant(key: string, size: ImageSize, load: () => Promise<Buffer>) {
  const cacheKey = `${key}:${size}:v1`
  const hit = cache.get(cacheKey)
  if (hit) { cache.delete(cacheKey); cache.set(cacheKey, hit); return Promise.resolve(hit) }
  const running = pending.get(cacheKey)
  if (running) return running
  const job = (async () => {
    const edge = imageSizes[size]
    const result = await sharp(await load(), { limitInputPixels: 40_000_000, failOn: 'error' })
      .rotate().resize({ width: edge, height: edge, fit: 'inside', withoutEnlargement: true }).webp({ quality: 85 }).toBuffer()
    while (bytes + result.length > budget && cache.size) {
      const oldest = cache.keys().next().value!
      bytes -= cache.get(oldest)!.length
      cache.delete(oldest)
    }
    if (result.length <= budget) { cache.set(cacheKey, result); bytes += result.length }
    return result
  })().finally(() => pending.delete(cacheKey))
  pending.set(cacheKey, job)
  return job
}
