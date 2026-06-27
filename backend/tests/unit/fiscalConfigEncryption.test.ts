import { encryptField, decryptField } from '../../src/modules/financeiro/application/crypto/fieldEncryption'

const TEST_KEY = 'a'.repeat(64)

describe('fiscal config field encryption', () => {
  beforeAll(() => {
    process.env.FISCAL_CERT_ENCRYPT_KEY = TEST_KEY
  })

  afterAll(() => {
    delete process.env.FISCAL_CERT_ENCRYPT_KEY
  })

  it('encrypts and decrypts a certificate password', () => {
    const plain = 'my-cert-password'
    const encrypted = encryptField(plain)
    expect(encrypted).not.toEqual(plain)
    expect(decryptField(encrypted)).toEqual(plain)
  })

  it('returns null for malformed cipher text', () => {
    expect(decryptField('not-a-cipher')).toBeNull()
    expect(decryptField('a:b')).toBeNull()
  })

  it('returns null for tampered cipher text', () => {
    const encrypted = encryptField('secret')
    const tampered = encrypted.slice(0, -1) + '0'
    expect(decryptField(tampered)).toBeNull()
  })

  it('throws when key is missing during encryption', () => {
    delete process.env.FISCAL_CERT_ENCRYPT_KEY
    expect(() => encryptField('x')).toThrow('FISCAL_CERT_ENCRYPT_KEY')
    process.env.FISCAL_CERT_ENCRYPT_KEY = TEST_KEY
  })

  it('throws when key is missing during decryption', () => {
    const encrypted = encryptField('secret')
    delete process.env.FISCAL_CERT_ENCRYPT_KEY
    expect(() => decryptField(encrypted)).toThrow('FISCAL_CERT_ENCRYPT_KEY')
    process.env.FISCAL_CERT_ENCRYPT_KEY = TEST_KEY
  })

  it('throws when key is invalid hex length', () => {
    process.env.FISCAL_CERT_ENCRYPT_KEY = 'a'.repeat(62)
    expect(() => encryptField('x')).toThrow('FISCAL_CERT_ENCRYPT_KEY')
    process.env.FISCAL_CERT_ENCRYPT_KEY = TEST_KEY
  })
})
