import { readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'

const exportData = JSON.parse(await readFile('data/strapi-public-export.json', 'utf8'))
const failures = [...exportData.errors]
let bytes = 0

for (const [url, item] of Object.entries(exportData.media)) {
  try {
    const file = await readFile(`data/${item.file}`)
    bytes += file.length
    const hash = createHash('sha256').update(file).digest('hex')
    if (file.length !== item.bytes || hash !== item.sha256) failures.push(`Checksum mismatch: ${url}`)
  } catch (error) {
    failures.push(`Missing media: ${url}: ${String(error)}`)
  }
}

const counts = Object.fromEntries(Object.entries(exportData.records).map(([key, value]) => [key, value.length]))
console.log(JSON.stringify({ counts, media: Object.keys(exportData.media).length, bytes, failures }, null, 2))
if (failures.length) process.exitCode = 1
