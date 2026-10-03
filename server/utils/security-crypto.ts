import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'

function encryptionKey() {
  const key = Buffer.from(process.env.ADMIN_2FA_ENCRYPTION_KEY || '', 'base64')
  if (key.length !== 32) throw new Error('ADMIN_2FA_ENCRYPTION_KEY must contain 32 random bytes encoded as base64')
  return key
}

export function encryptTotp(secret: string) {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv)
  cipher.setAAD(Buffer.from('makoto-admin-totp-v1'))
  const ciphertext = Buffer.concat([cipher.update(secret, 'utf8'), cipher.final()])
  return ['v1', iv.toString('base64'), cipher.getAuthTag().toString('base64'), ciphertext.toString('base64')].join('.')
}

export function decryptTotp(value: string) {
  const [version, iv, tag, ciphertext] = value.split('.')
  if (version !== 'v1' || !iv || !tag || !ciphertext) throw new Error('Invalid encrypted TOTP secret')
  const decipher = createDecipheriv('aes-256-gcm', encryptionKey(), Buffer.from(iv, 'base64'))
  decipher.setAAD(Buffer.from('makoto-admin-totp-v1'))
  decipher.setAuthTag(Buffer.from(tag, 'base64'))
  return Buffer.concat([decipher.update(Buffer.from(ciphertext, 'base64')), decipher.final()]).toString('utf8')
}
