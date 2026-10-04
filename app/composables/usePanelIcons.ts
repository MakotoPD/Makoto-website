import { technologyCatalog } from '#shared/technology-catalog'

const assets = import.meta.glob<string>('~/assets/icons/*.svg', { eager: true, query: '?url', import: 'default' })
const icons = Object.entries(assets).map(([path, src]) => {
  const file = path.split('/').pop()!
  const name = file.replace(/\.svg$/i, '')
  return { file, name, icon: `i-mkt-${name}`, src }
}).sort((a, b) => a.name.localeCompare(b.name))
const technologies = technologyCatalog.flatMap(item => {
  const asset = icons.find(icon => icon.file === item.file)
  return asset ? [{ label: item.name, icon: asset.icon, src: asset.src }] : []
})

export function usePanelIcons() { return { icons, technologies } }
