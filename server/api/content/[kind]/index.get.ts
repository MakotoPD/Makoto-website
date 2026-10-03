import { contentKinds, type ContentKind, type Locale } from '../../../../shared/content'
import { getPublished, listPublished } from '../../../utils/content'

export default defineEventHandler(async event => {
  const kind = getRouterParam(event, 'kind') as ContentKind
  if (!contentKinds.includes(kind)) throw createError({ statusCode: 404 })
  const locale = getQuery(event).locale === 'pl' ? 'pl' : 'en' as Locale
  const slug = getQuery(event).slug
  if (typeof slug === 'string') {
    const entry = await getPublished(kind, locale, slug)
    if (!entry) throw createError({ statusCode: 404, statusMessage: 'Content not found' })
    return entry
  }
  return listPublished(kind, locale)
})
