import type { ContentKind, Locale, RichNode } from './content'

export const panelSections = [
  { slug: 'blog', label: 'Blog', kind: 'article', singular: 'wpis' },
  { slug: 'strony', label: 'Strony', kind: 'page', singular: 'strona' },
  { slug: 'start', label: 'Strona główna', kind: 'home', singular: 'strona główna' },
  { slug: 'projekty', label: 'Realizacje', kind: 'project', singular: 'realizacja' },
  { slug: 'uslugi', label: 'Usługi', kind: 'service', singular: 'usługa' },
  { slug: 'lokalizacje', label: 'Lokalizacje', kind: 'location', singular: 'lokalizacja' },
  { slug: 'portfolio', label: 'Portfolio', kind: 'portfolio', singular: 'praca' },
  { slug: 'doswiadczenie', label: 'Doświadczenie', kind: 'work', singular: 'doświadczenie' },
  { slug: 'kategorie', label: 'Kategorie bloga', kind: 'category', singular: 'kategoria' },
  { slug: 'autorzy', label: 'Autorzy bloga', kind: 'author', singular: 'autor' }
] as const

export interface AdminEntry {
  id: string; kind: ContentKind; locale: Locale; slug: string; translationGroup: string
  title: string; summary: string; body: RichNode; sections: any[]; data: Record<string, any>
  status: string; seoTitle: string | null; seoDescription: string | null; coverMediaId: string | null
  updatedAt?: string
}
export interface MediaItem {
  id: string; name: string; mime: string; bytes: number; alt: string; caption: string
  width?: number | null; height?: number | null; aliases?: string[]; uses?: number; published?: string | null
}
export type EntryReference = Pick<AdminEntry, 'id' | 'kind' | 'locale' | 'slug' | 'translationGroup' | 'title' | 'status'>

export function controlledDataKeys(kind: ContentKind, slug: string) {
  const keys = ['image', 'cover', 'avatar', 'picture', 'originalBlocks', 'id', 'documentId', 'createdAt', 'updatedAt', 'publishedAt', 'locale', 'localizations']
  if (kind === 'project') keys.push('stack', 'theme', 'primaryColor', 'externalUrl', 'slogan', 'scope', 'featured', 'clientName', 'clientCity', 'industry', 'caseStudy', 'testimonial', 'serviceSlugs', 'locationSlugs')
  if (kind === 'work') keys.push('company', 'from', 'to', 'tags', 'location', 'isRemote')
  if (kind === 'article') keys.push('authorSource', 'categorySources')
  if (kind === 'author') keys.push('email')
  if (kind === 'portfolio') keys.push('type')
  if (kind === 'location') keys.push('city', 'parentService')
  if (kind === 'page' && ['about', 'links'].includes(slug)) keys.push('links', 'primarylinks')
  if (kind === 'page' && ['kontakt', 'contact'].includes(slug)) keys.push('contactName', 'contactEmail', 'contactPhone', 'googleMapsUrl', 'serviceArea', 'contactNote')
  return new Set(keys)
}
export function copyEntry(entry: AdminEntry): AdminEntry {
  // API records are JSON. This also works when Vue wraps a record in a reactive proxy.
  return JSON.parse(JSON.stringify(entry))
}
export function groupEntries(items: AdminEntry[]) {
  const groups = new Map<string, Partial<Record<Locale, AdminEntry>>>()
  for (const item of items) {
    if (item.status === 'deleted') continue
    const key = `${item.kind}:${item.translationGroup}`
    const group = groups.get(key) || {}
    group[item.locale] = item
    groups.set(key, group)
  }
  return [...groups.entries()].map(([key, translations]) => ({ key, translations, entry: translations.pl || translations.en! }))
}
export function emptyEntry(kind: ContentKind, locale: Locale, translationGroup: string): AdminEntry {
  return { id: '', kind, locale, translationGroup, slug: '', title: '', summary: '', body: { type: 'doc', content: [{ type: 'paragraph' }] }, sections: [], data: {}, status: 'draft', seoTitle: null, seoDescription: null, coverMediaId: null }
}
export function entrySlug(title: string) {
  return title.replace(/[łŁ]/g, 'l').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 150)
}
export function panelError(error: any) {
  const status = error?.statusCode || error?.response?.status
  if (status === 401) return 'Sesja wygasła. Zaloguj się ponownie.'
  if (status === 409) return error?.data?.message || 'Ten adres lub wersja językowa już istnieje.'
  if (status === 422) return 'Sprawdź tytuł, adres i opisy obrazów w treści.'
  return error?.data?.message || error?.message || 'Nie udało się wykonać operacji. Spróbuj ponownie.'
}
