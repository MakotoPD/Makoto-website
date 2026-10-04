import { database } from '../../../db/client'
import { media } from '../../../db/schema'
import { requireSession } from '../../../utils/auth'
import { deleteObject, detectedMime, uploadObject } from '../../../utils/r2'
import sharp from 'sharp'

export default defineEventHandler(async event => {
  await requireSession(event, true)
  const contentLength = Number(getHeader(event, 'content-length') || 0)
  if (contentLength > 12 * 1024 * 1024) throw createError({ statusCode: 413, statusMessage: 'File is too large' })
  const parts = await readMultipartFormData(event)
  const file = parts?.find(part => part.name === 'file')
  if (!file?.data?.length || file.data.length > 10 * 1024 * 1024) throw createError({ statusCode: 413, statusMessage: 'File must be 1 byte to 10 MB' })
  const mime = detectedMime(file.data)
  if (!mime || mime !== file.type) throw createError({ statusCode: 415, statusMessage: 'Unsupported file format' })
  let dimensions: { width?: number; height?: number } = {}
  if (mime.startsWith('image/')) {
    try {
      const info = await sharp(file.data, { limitInputPixels: 40_000_000, failOn: 'error' }).metadata()
      if (!info.width || !info.height || `image/${info.format === 'jpeg' ? 'jpeg' : info.format}` !== mime) throw new Error('Invalid image')
      dimensions = info.autoOrient || { width: info.width, height: info.height }
    } catch {
      throw createError({ statusCode: 415, statusMessage: 'Invalid image data' })
    }
  } else if (!file.data.subarray(-1024).toString('latin1').includes('%%EOF')) {
    throw createError({ statusCode: 415, statusMessage: 'Invalid PDF data' })
  }
  const name = (file.filename || 'file').replace(/[\\/\x00-\x1f]/g, '').slice(0, 180)
  const alt = parts?.find(part => part.name === 'alt')?.data.toString('utf8').slice(0, 500) || ''
  const key = await uploadObject(file.data, mime)
  let row: typeof media.$inferSelect | undefined
  try {
    const inserted = await database().insert(media).values({
      objectKey: key, name, mime, bytes: file.data.length, alt, ...dimensions
    }).returning()
    row = inserted[0]
    if (!row) throw new Error('Media record was not created')
  } catch (cause) {
    await deleteObject(key).catch(() => undefined)
    throw cause
  }
  setResponseStatus(event, 201)
  return row
})
