import 'dotenv/config'
import { readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { S3Client, HeadObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { r2Endpoint } from '../shared/r2-config.ts'

// Restore the original project screenshots referenced by migration 0005.
// Existing R2 objects and CMS edits are kept. Run with the destination bucket's environment.
const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_ENDPOINT } = process.env
if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME) throw new Error('R2 configuration is required')
const client = new S3Client({
  region: 'auto', endpoint: r2Endpoint(R2_ACCOUNT_ID, R2_ENDPOINT),
  credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY }
})
const directory = new URL('../data/project-media/', import.meta.url)
const media = JSON.parse(await readFile(new URL('manifest.json', directory), 'utf8'))
for (const item of media) {
  const body = await readFile(new URL(item.file, directory))
  if (createHash('sha256').update(body).digest('hex') !== item.sha256) throw new Error(`Screenshot checksum mismatch: ${item.file}`)
  try {
    await client.send(new HeadObjectCommand({ Bucket: R2_BUCKET_NAME, Key: item.objectKey }))
    console.log(`Already stored: ${item.file}`)
    continue
  } catch (error) {
    if (error.$metadata?.httpStatusCode !== 404) throw error
  }
  await client.send(new PutObjectCommand({ Bucket: R2_BUCKET_NAME, Key: item.objectKey, Body: body, ContentType: item.mime, CacheControl: 'private, no-store' }))
  console.log(`Stored: ${item.file}`)
}
