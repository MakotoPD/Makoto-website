import argon2 from 'argon2'

if (!process.stdin.isTTY) throw new Error('Run this script in an interactive terminal')
process.stdout.write('New administrator password: ')
let password = ''
process.stdin.setRawMode(true)
process.stdin.resume()
process.stdin.setEncoding('utf8')
for await (const key of process.stdin) {
  if (key === '\u0003') process.exit(130)
  if (key === '\r' || key === '\n') break
  if (key === '\u007f' || key === '\b') password = password.slice(0, -1)
  else if (key.length === 1) password += key
}
process.stdin.setRawMode(false)
process.stdin.pause()
process.stdout.write('\n')
if (password.length < 14) throw new Error('Use at least 14 characters')
const result = await argon2.hash(password, { type: argon2.argon2id, memoryCost: 65_536, timeCost: 3, parallelism: 1 })
password = ''
process.stdout.write(`ADMIN_PASSWORD_HASH=${result}\n`)
