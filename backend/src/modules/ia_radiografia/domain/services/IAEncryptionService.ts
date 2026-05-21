import crypto from "crypto"

const ENCRYPTION_KEY = process.env.IA_ENCRYPTION_KEY || ""

if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length < 32) {
  console.warn("[SECURITY] IA_ENCRYPTION_KEY nao configurada ou muito curta. Usando fallback DEV ONLY.")
}

function deriveKey(analiseId: string): Buffer {
  const base = ENCRYPTION_KEY || "dev-only-fallback-key-32-chars!!"
  return crypto.scryptSync(base, analiseId, 32)
}

export class IAEncryptionService {
  encrypt(data: unknown, analiseId: string): { iv: string; ciphertext: string; tag: string } {
    const key = deriveKey(analiseId)
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv)

    const plaintext = JSON.stringify(data)
    let encrypted = cipher.update(plaintext, "utf8", "base64")
    encrypted += cipher.final("base64")

    return {
      iv: iv.toString("base64"),
      ciphertext: encrypted,
      tag: cipher.getAuthTag().toString("base64"),
    }
  }

  decrypt(encrypted: { iv: string; ciphertext: string; tag: string }, analiseId: string): unknown {
    const key = deriveKey(analiseId)
    const iv = Buffer.from(encrypted.iv, "base64")
    const tag = Buffer.from(encrypted.tag, "base64")

    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv)
    decipher.setAuthTag(tag)

    let decrypted = decipher.update(encrypted.ciphertext, "base64", "utf8")
    decrypted += decipher.final("utf8")

    return JSON.parse(decrypted)
  }
}
