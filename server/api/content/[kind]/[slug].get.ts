import { contentKinds, type ContentKind, type Locale } from '../../../../shared/content'
import { getPublished } from '../../../utils/content'

export default defineEventHandler(async event => {
  const kind = getRouterParam(event, 'kind') as ContentKind
  if (!contentKinds.includes(kind)) throw createError({ statusCode: 404 })
  const slug = getRouterParam(event, 'slug') || ''
  const locale = getQuery(event).locale === 'pl' ? 'pl' : 'en' as Locale
  const entry = await getPublished(kind, locale, slug)
  if (!entry) throw createError({ statusCode: 404, statusMessage: 'Content not found' })
  return entry
})
