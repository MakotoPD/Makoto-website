import 'dotenv/config'
import pg from 'pg'
import { readdir, readFile } from 'node:fs/promises'

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required')
const client = new pg.Client({ connectionString: process.env.DATABASE_URL })
await client.connect()
try {
  await client.query('CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())')
  for (const name of (await readdir('db/migrations')).filter(name => name.endsWith('.sql')).sort()) {
    const exists = await client.query('SELECT 1 FROM schema_migrations WHERE name = $1', [name])
    if (exists.rowCount) continue
    await client.query('BEGIN')
    try {
      await client.query(await readFile(`db/migrations/${name}`, 'utf8'))
      await client.query('INSERT INTO schema_migrations(name) VALUES ($1)', [name])
      await client.query('COMMIT')
      console.log(`Applied ${name}`)
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    }
  }
} finally {
  await client.end()
}
