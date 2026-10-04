import { llmsText } from '../utils/ai-content'

export default defineEventHandler(async event => {
  setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  setHeader(event, 'Cache-Control', 'public, max-age=300')
  return llmsText()
})
