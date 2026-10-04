import type { ContentEntry } from '../db/schema'
import type { Locale, RichNode } from '../../shared/content'
import { richMarkdown } from '../../shared/rich-markdown'
import { absoluteUrl, listingPages, pagePath } from '../../shared/seo'
import { entryPath, publishedSeoEntries } from './seo-content'

const line = (value: string) => value.replace(/\s+/g, ' ').trim()
const label = (value: string) => line(value).replace(/([\[\]\\])/g, '\\$1')

export function entryMarkdown(row: ContentEntry) {
  const blocks = [`# ${row.title}`, row.summary, richMarkdown(row.body as unknown as RichNode).trim()]
  for (const section of row.sections) {
    if (typeof section.heading === 'string') blocks.push(`## ${section.heading}`)
    else if (typeof section.title === 'string') blocks.push(`## ${section.title}`)
    if (typeof section.text === 'string') blocks.push(section.text)
    if (typeof section.description === 'string') blocks.push(section.description)
    if (Array.isArray(section.items)) {
      for (const item of section.items) {
        if (typeof item === 'string') blocks.push(`- ${item}`)
        else if (Array.isArray(item) && typeof item[0] === 'string' && typeof item[1] === 'string') blocks.push(`### ${item[0]}\n\n${item[1]}`)
        else if (item && typeof item === 'object') {
          if (typeof item.question === 'string') blocks.push(`### ${item.question}`)
          else if (typeof item.title === 'string') blocks.push(`### ${item.title}`)
          for (const key of ['answer', 'text', 'description']) if (typeof item[key] === 'string') blocks.push(item[key])
        }
      }
    }
  }
  return blocks.filter(Boolean).join('\n\n')
}

export async function llmsText(full = false) {
  const rows = await publishedSeoEntries()
  const blocks = [
    '# Makoto — Patryk Dąbrowski',
    '> Websites, online stores and web applications. Portfolio and articles by Patryk Dąbrowski. Content is available in Polish and English.',
    'Website: https://makoto.com.pl\nContact: contact@makoto.com.pl',
    `## Resources\n\n- [XML sitemap](${absoluteUrl('/sitemap.xml')})\n- [Complete published content](${absoluteUrl('/llms-full.txt')})`,
    'The links below point to published pages. Add .md to a page path for its Markdown version. This file is generated from the live CMS; drafts and private administration pages are excluded.'
  ]
  for (const locale of ['pl', 'en'] as const) {
    blocks.push(`## ${locale === 'pl' ? 'Polski' : 'English'}`)
    for (const row of rows.filter(item => item.locale === locale)) {
      blocks.push(`- [${label(row.title)}](${absoluteUrl(entryPath(row))})${row.summary ? `: ${line(row.summary)}` : ''}`)
    }
    for (const [slug, page] of Object.entries(listingPages)) {
      blocks.push(`- [${page.label[locale]}](${absoluteUrl(pagePath(slug, locale))}): ${page.description[locale]}`)
    }
  }
  if (full) {
    for (const row of rows) {
      blocks.push(`---\n\nCanonical URL: ${absoluteUrl(entryPath(row))}\nLanguage: ${row.locale as Locale}\nUpdated: ${row.updatedAt.toISOString()}${row.kind === 'article' && row.publishedAt ? `\nPublished: ${row.publishedAt.toISOString()}` : ''}\n\n${entryMarkdown(row)}`)
    }
  }
  return blocks.join('\n\n') + '\n'
}
