import 'dotenv/config'
import { spawnSync } from 'node:child_process'
import { r2Endpoint } from '../shared/r2-config.ts'

const required = ['DATABASE_URL', 'SITE_URL', 'ADMIN_LOGIN', 'ADMIN_PASSWORD_HASH', 'ADMIN_SESSION_SECRET', 'ADMIN_2FA_ENCRYPTION_KEY', 'TURNSTILE_SITE_KEY', 'TURNSTILE_SECRET_KEY', 'R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET_NAME']
const missing = required.filter(name => !process.env[name])
if (missing.length) throw new Error(`Missing production settings: ${missing.join(', ')}`)
r2Endpoint(process.env.R2_ACCOUNT_ID, process.env.R2_ENDPOINT)
if (process.env.ADMIN_SESSION_SECRET.length < 32) throw new Error('ADMIN_SESSION_SECRET must contain at least 32 characters')
if (!process.env.ADMIN_PASSWORD_HASH.startsWith('$argon2id$')) throw new Error('ADMIN_PASSWORD_HASH must be an Argon2id hash')
if (!process.argv.includes('--import-strapi')) throw new Error('Confirm the initial archive import with --import-strapi')

for (const args of [
  ['scripts/verify-strapi-export.mjs'],
  ['scripts/migrate-strapi.mjs', '--dry-run'],
  ['scripts/db-migrate.mjs'],
  ['scripts/seed-site.ts'],
  ['scripts/migrate-strapi.mjs']
]) {
  const result = spawnSync(process.execPath, args, { stdio: 'inherit' })
  if (result.error || result.status !== 0) process.exit(result.status || 1)
}
console.log('Initial content import completed. Future starts only apply schema migrations.')
