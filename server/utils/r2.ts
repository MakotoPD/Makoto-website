import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { randomUUID } from 'node:crypto'
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

let client: S3Client | undefined

function testStorage() {
  if (!process.env.R2_TEST_DIR || process.env.SITE_URL !== 'http://127.0.0.1:3101') return null
  try {
    const database = new URL(process.env.DATABASE_URL || '')
    if (!['localhost', '127.0.0.1'].includes(database.hostname) || database.pathname !== '/makoto_verify') return null
    return process.env.R2_TEST_DIR
  } catch { return null }
}

function config() {
  const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME } = process.env
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME) {
    throw createError({ statusCode: 503, statusMessage: 'Media storage is not configured' })
  }
  return { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME }
}

function r2() {
  const settings = config()
  client ||= new S3Client({
    region: 'auto',
    endpoint: `https://${settings.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: settings.R2_ACCESS_KEY_ID,
      secretAccessKey: settings.R2_SECRET_ACCESS_KEY
    }
  })
  return { client, bucket: settings.R2_BUCKET_NAME }
}

export function mediaUrl(id: string) {
  const base = (process.env.SITE_URL || 'https://makoto.com.pl').replace(/\/$/, '')
  return `${base}/api/media/${id}`
}

export async function uploadObject(data: Buffer, mime: string) {
  const extension: Record<string, string> = {
    'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'application/pdf': 'pdf'
  }
  const key = `private/${randomUUID()}.${extension[mime]}`
  const localDirectory = testStorage()
  if (localDirectory) {
    const localKey = key.replace('private/', 'test/')
    await mkdir(localDirectory, { recursive: true })
    await writeFile(join(localDirectory, localKey.slice('test/'.length)), data)
    return localKey
  }
  const { client, bucket } = r2()
  await client.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: data, ContentType: mime, CacheControl: 'private, no-store' }))
  return key
}

export async function downloadObject(key: string) {
  const localDirectory = testStorage()
  if (key.startsWith('test/') && localDirectory) {
    if (!/^test\/[0-9a-f-]{36}\.(?:jpg|png|webp|pdf)$/.test(key)) throw createError({ statusCode: 404 })
    return readFile(join(localDirectory, key.slice('test/'.length)))
  }
  if (key.startsWith('local/') && process.env.NODE_ENV !== 'production') {
    const name = key.slice('local/'.length)
    if (!/^[0-9a-f]{24}\.(?:jpg|png|webp|pdf)$/.test(name)) throw createError({ statusCode: 404 })
    return readFile(join(process.cwd(), 'data', 'strapi-media', name))
  }
  const { client, bucket } = r2()
  const result = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }))
  if (!result.Body) throw createError({ statusCode: 404 })
  return Buffer.from(await result.Body.transformToByteArray())
}

export async function deleteObject(key: string) {
  const localDirectory = testStorage()
  if (key.startsWith('test/') && localDirectory) {
    await unlink(join(localDirectory, key.slice('test/'.length)))
    return
  }
  if (key.startsWith('local/') && process.env.NODE_ENV !== 'production') return
  const { client, bucket } = r2()
  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }))
}

export function detectedMime(data: Buffer): string | null {
  if (data.length < 12) return null
  if (data.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) return 'image/jpeg'
  if (data.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png'
  if (data.toString('ascii', 0, 4) === 'RIFF' && data.toString('ascii', 8, 12) === 'WEBP') return 'image/webp'
  if (data.toString('ascii', 0, 5) === '%PDF-') return 'application/pdf'
  return null
}
