export const projectThemes = [
  { value: 'red', label: 'Czerwony', dark: '#991b1b', primary: '#ef4444' },
  { value: 'orange', label: 'Pomarańczowy', dark: '#9a3412', primary: '#fb923c' },
  { value: 'amber', label: 'Bursztynowy', dark: '#92400e', primary: '#fbbf24' },
  { value: 'yellow', label: 'Żółty', dark: '#854d0e', primary: '#facc15' },
  { value: 'lime', label: 'Limonkowy', dark: '#3f6212', primary: '#a3e635' },
  { value: 'green', label: 'Zielony', dark: '#166534', primary: '#4ade80' },
  { value: 'emerald', label: 'Szmaragdowy', dark: '#065f46', primary: '#34d399' },
  { value: 'teal', label: 'Morski', dark: '#115e59', primary: '#2dd4bf' },
  { value: 'cyan', label: 'Cyjan', dark: '#155e75', primary: '#22d3ee' },
  { value: 'sky', label: 'Błękitny', dark: '#075985', primary: '#38bdf8' },
  { value: 'blue', label: 'Niebieski', dark: '#1e40af', primary: '#60a5fa' },
  { value: 'indigo', label: 'Indygo', dark: '#3730a3', primary: '#818cf8' },
  { value: 'violet', label: 'Fioletowy', dark: '#5b21b6', primary: '#a78bfa' },
  { value: 'purple', label: 'Purpurowy', dark: '#6b21a8', primary: '#c084fc' },
  { value: 'fuchsia', label: 'Fuksja', dark: '#86198f', primary: '#e879f9' },
  { value: 'pink', label: 'Różowy', dark: '#9d174d', primary: '#f472b6' },
  { value: 'rose', label: 'Różany', dark: '#9f1239', primary: '#fb7185' }
] as const

export function projectAppearance(theme: unknown, primaryColor?: unknown) {
  const palette = projectThemes.find(item => item.value === theme) || projectThemes.find(item => item.value === 'sky')!
  let dark: string = palette.dark
  let primary: string = palette.primary
  if (typeof primaryColor === 'string' && /^#[\da-f]{6}$/i.test(primaryColor)) {
    primary = primaryColor.toLowerCase()
    dark = '#' + [1, 3, 5].map(index => Math.round(parseInt(primary.slice(index, index + 2), 16) * 0.32).toString(16).padStart(2, '0')).join('')
  }
  return { dark, primary, gradient: `linear-gradient(135deg, ${dark}, ${dark} 42%, ${primary})` }
}

