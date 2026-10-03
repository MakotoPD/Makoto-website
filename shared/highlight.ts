import { common, createLowlight } from 'lowlight'

export const syntaxHighlighter = createLowlight(common)
syntaxHighlighter.registerAlias({ xml: ['html', 'vue'], bash: ['shell', 'sh'] })
