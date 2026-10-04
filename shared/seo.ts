import type { Locale, PublicEntry } from './content'

export const siteOrigin = 'https://makoto.com.pl'
export const siteName = 'Makoto'
export const publicContentKinds = ['home', 'page', 'service', 'location', 'article', 'project'] as const
export const localeLanguage = (locale: Locale) => locale === 'pl' ? 'pl-PL' : 'en-US'
export const pagePath = (slug: string, locale: Locale) => `${locale === 'pl' ? '/pl' : ''}/${slug}`
export const absoluteUrl = (path: string) => new URL(path, `${siteOrigin}/`).href

export const listingPages = {
  blog: {
    title: { pl: 'Blog o stronach i technologiach', en: 'Web development blog' },
    description: { pl: 'Artykuły Patryka Dąbrowskiego o tworzeniu stron, aplikacji i praktycznych rozwiązaniach internetowych.', en: 'Articles by Patryk Dąbrowski about websites, applications and practical web development.' },
    label: { pl: 'Blog', en: 'Blog' }
  },
  work: {
    title: { pl: 'Realizacje stron i aplikacji internetowych', en: 'Website and application projects' },
    description: { pl: 'Wybrane strony, sklepy i aplikacje stworzone przez Patryka Dąbrowskiego — zakres prac, technologie i efekty.', en: 'Selected websites, online stores and applications by Patryk Dąbrowski, with project scope and technologies.' },
    label: { pl: 'Realizacje', en: 'Projects' }
  },
  portfolio: {
    title: { pl: 'Portfolio graficzne', en: 'Graphic design portfolio' },
    description: { pl: 'Wybrane prace graficzne, identyfikacje wizualne i projekty interfejsów Patryka Dąbrowskiego.', en: 'Selected graphic work, visual identities and interface designs by Patryk Dąbrowski.' },
    label: { pl: 'Portfolio', en: 'Portfolio' }
  },
  uses: {
    title: { pl: 'Narzędzia, których używam', en: 'Tools I use' },
    description: { pl: 'Sprzęt i oprogramowanie, których Patryk Dąbrowski używa do projektowania i tworzenia stron internetowych.', en: 'Hardware and software Patryk Dąbrowski uses for design and web development.' },
    label: { pl: 'Narzędzia', en: 'Tools' }
  },
  faq: {
    title: { pl: 'Pytania o tworzenie stron i współpracę', en: 'Website development questions' },
    description: { pl: 'Odpowiedzi na pytania o projektowanie stron, technologie, koszty i współpracę z Makoto.', en: 'Answers about website design, technologies, costs and working with Makoto.' },
    label: { pl: 'Pytania i odpowiedzi', en: 'Questions and answers' }
  }
}
export type ListingPage = keyof typeof listingPages

export function entryImage(entry: Pick<PublicEntry, 'data' | 'coverMediaId'>) {
  const candidate = entry.coverMediaId
    ? `/api/media/${entry.coverMediaId}?size=big`
    : entry.data.coverUrl || (entry.data.cover as { url?: string })?.url || (entry.data.image as { url?: string })?.url
  if (typeof candidate !== 'string') return undefined
  try {
    const url = new URL(candidate, siteOrigin)
    return url.origin === siteOrigin ? url.href : undefined
  } catch { return undefined }
}
