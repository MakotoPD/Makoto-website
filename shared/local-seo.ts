import { safeHref, type PublicEntry } from './content'

export function cityName(value: unknown) {
  if (typeof value !== 'string') return ''
  return ({ inowroclaw: 'Inowrocław', torun: 'Toruń', bydgoszcz: 'Bydgoszcz' } as Record<string, string>)[value] || value.trim()
}

function cityKey(value: unknown) {
  return cityName(value).replace(/[łŁ]/g, 'l').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

export function projectLocations(project: PublicEntry, locations: PublicEntry[]) {
  const selected = Array.isArray(project.data.locationSlugs) ? project.data.locationSlugs : []
  const city = cityKey(project.data.clientCity)
  return locations.filter(location => location.locale === project.locale && (
    selected.includes(location.slug) || (city && cityKey(location.data.city) === city)
  ))
}

export function contactInfo(data: Record<string, unknown> = {}) {
  const text = (key: string) => typeof data[key] === 'string' ? data[key].trim() : ''
  const phone = text('contactPhone')
  const phoneNumber = phone.replace(/[^\d+]/g, '')
  const mapsUrl = safeHref(data.googleMapsUrl)
  return {
    name: text('contactName') || 'Patryk Dąbrowski — Makoto',
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text('contactEmail')) ? text('contactEmail') : 'contact@makoto.com.pl',
    phone, phoneHref: /^\+?\d{6,15}$/.test(phoneNumber) ? `tel:${phoneNumber}` : '',
    mapsUrl: /^https?:\/\//.test(mapsUrl) ? mapsUrl : '',
    areas: (Array.isArray(data.serviceArea) ? data.serviceArea : ['Inowrocław', 'Toruń', 'Bydgoszcz']).map(cityName).filter(Boolean),
    note: text('contactNote')
  }
}
