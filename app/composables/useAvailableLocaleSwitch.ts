export function useAvailableLocaleSwitch() {
  const route = useRoute()
  const { locale } = useI18n()
  const switchLocalePath = useSwitchLocalePath()
  const translations = useState<{ locale: string; path: string }[]>('page-translations', () => [])
  const targetLocale = computed(() => locale.value === 'pl' ? 'en' : 'pl')
  const languagePath = computed(() => route.params.slug !== undefined
    ? translations.value.find(item => item.locale === targetLocale.value)?.path
    : switchLocalePath(targetLocale.value))
  return { targetLocale, languagePath }
}
