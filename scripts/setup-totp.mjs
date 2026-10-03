import * as OTPAuth from 'otpauth'

const login = process.env.ADMIN_LOGIN || 'admin'
const secret = new OTPAuth.Secret({ size: 20 })
const totp = new OTPAuth.TOTP({ issuer: 'Makoto', label: login, algorithm: 'SHA1', digits: 6, period: 30, secret })
console.log('Save this value in your local .env; do not commit it.')
console.log(`ADMIN_TOTP_SECRET=${secret.base32}`)
console.log(`Authenticator URI: ${totp.toString()}`)
