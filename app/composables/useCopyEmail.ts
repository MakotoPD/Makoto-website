const EMAIL = 'contact@makoto.com.pl'

export const useCopyEmail = () => {
  const toast = useToast()

  const copyEmail = async (e: Event, messages: {
    title: string
    description: string
    btnLabel: string
  }) => {
    let success = false

    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(EMAIL)
        success = true
      } catch {
        success = false
      }
    } else {
      try {
        const textArea = document.createElement('textarea')
        textArea.value = EMAIL
        textArea.style.cssText = 'position:absolute;left:-9999px;top:0'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        success = true
      } catch {
        success = false
      }
    }

    if (success) {
      toast.add({
        title: messages.title,
        description: messages.description,
        color: 'info',
        icon: 'i-solar-clipboard-check-linear',
        progress: false,
        orientation: 'horizontal',
        actions: [{
          icon: 'i-solar-plain-linear',
          label: messages.btnLabel,
          color: 'neutral',
          variant: 'solid',
          onClick: () => window.open(`mailto:${EMAIL}`, '_blank')
        }]
      })

      await nextTick()
      const target = e.currentTarget as HTMLElement
      target.classList.add('wobble-hor-bottom')
      setTimeout(() => target.classList.remove('wobble-hor-bottom'), 1000)
    } else {
      toast.add({
        title: 'Błąd',
        description: 'Nie udało się skopiować adresu e-mail.',
        color: 'error'
      })
    }
  }

  return { copyEmail, EMAIL }
}
