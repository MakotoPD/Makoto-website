import { spawn } from 'node:child_process'

const migrate = spawn(process.execPath, ['scripts/db-migrate.mjs'], { stdio: 'inherit' })
const migrationStatus = await new Promise(resolve => {
  migrate.on('error', () => resolve(1))
  migrate.on('exit', code => resolve(code ?? 1))
})
if (migrationStatus !== 0) process.exit(migrationStatus)

const server = spawn(process.execPath, ['.output/server/index.mjs'], { stdio: 'inherit' })
for (const signal of ['SIGTERM', 'SIGINT']) process.on(signal, () => server.kill(signal))
server.on('error', () => process.exit(1))
server.on('exit', (code, signal) => process.exit(code ?? (signal === 'SIGTERM' ? 0 : 1)))
