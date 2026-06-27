import crypto from 'crypto'

const ALGO = 'aes-256-gcm'

function getKey(): Buffer {
  const raw = process.env.FISCAL_CERT_ENCRYPT_KEY || ''
  const key = Buffer.from(raw, 'hex')
  if (key.length !== 32) {
    throw new Error('FISCAL_CERT_ENCRYPT_KEY must be 64 hex chars (32 bytes)')
  }
  return key
}

export function encryptField(plainText: string): string {
  const key = getKey()
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv(ALGO, key, iv)
  const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`
}

export function decryptField(cipherText: string): string | null {
  const key = getKey()
  const parts = cipherText.split(':')
  if (parts.length !== 3) return null
  const [ivHex, authTagHex, encryptedHex] = parts
  if (!ivHex || !authTagHex || !encryptedHex) return null

  try {
    const decipher = crypto.createDecipheriv(ALGO, key, Buffer.from(ivHex, 'hex'))
    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'))
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encryptedHex, 'hex')),
      decipher.final(),
    ])
    return decrypted.toString('utf8')
  } catch {
    return null
  }
}
