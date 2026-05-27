import Database from "better-sqlite3"
import { SecureConfigStore } from "../../../src/modules/memory_hub/infrastructure/SecureConfigStore"

describe("SecureConfigStore", () => {
  let db: Database.Database
  let store: SecureConfigStore
  const originalMasterKey = process.env.MEMORY_HUB_MASTER_KEY

  beforeEach(() => {
    db = new Database(":memory:")
  })

  afterEach(() => {
    db.close()
    if (originalMasterKey !== undefined) {
      process.env.MEMORY_HUB_MASTER_KEY = originalMasterKey
    } else {
      delete process.env.MEMORY_HUB_MASTER_KEY
    }
  })

  it("should store and retrieve encrypted value with valid master key", () => {
    process.env.MEMORY_HUB_MASTER_KEY = "a".repeat(64)
    store = new SecureConfigStore(db)

    store.set("test-key", "secret-value")
    const retrieved = store.get("test-key")

    expect(retrieved).toBe("secret-value")
  })

  it("should store plaintext when master key is missing (dev fallback)", () => {
    delete process.env.MEMORY_HUB_MASTER_KEY
    store = new SecureConfigStore(db)

    store.set("test-key", "plaintext-value")
    // When master key is missing, get returns null because it cannot decrypt
    const retrieved = store.get("test-key")
    expect(retrieved).toBeNull()
  })

  it("should return null for non-existent key", () => {
    process.env.MEMORY_HUB_MASTER_KEY = "b".repeat(64)
    store = new SecureConfigStore(db)

    const retrieved = store.get("non-existent")
    expect(retrieved).toBeNull()
  })

  it("should check if key exists", () => {
    process.env.MEMORY_HUB_MASTER_KEY = "c".repeat(64)
    store = new SecureConfigStore(db)

    store.set("existing-key", "value")
    expect(store.has("existing-key")).toBe(true)
    expect(store.has("missing-key")).toBe(false)
  })

  it("should delete a key", () => {
    process.env.MEMORY_HUB_MASTER_KEY = "d".repeat(64)
    store = new SecureConfigStore(db)

    store.set("delete-me", "value")
    expect(store.has("delete-me")).toBe(true)

    store.delete("delete-me")
    expect(store.has("delete-me")).toBe(false)
  })

  it("should store and retrieve API key with provider prefix", () => {
    process.env.MEMORY_HUB_MASTER_KEY = "e".repeat(64)
    store = new SecureConfigStore(db)

    store.storeApiKey("openai", "sk-test-123")
    const retrieved = store.getApiKey("openai")

    expect(retrieved).toBe("sk-test-123")
  })

  it("should update existing key value", () => {
    process.env.MEMORY_HUB_MASTER_KEY = "f".repeat(64)
    store = new SecureConfigStore(db)

    store.set("update-key", "old-value")
    store.set("update-key", "new-value")

    const retrieved = store.get("update-key")
    expect(retrieved).toBe("new-value")
  })

  it("should return null when master key is invalid hex", () => {
    process.env.MEMORY_HUB_MASTER_KEY = "not-hex"
    store = new SecureConfigStore(db)

    store.set("test", "value")
    expect(store.get("test")).toBeNull()
  })

  it("should return null when master key is wrong length", () => {
    process.env.MEMORY_HUB_MASTER_KEY = "ff".repeat(16) // 32 chars, not 64
    store = new SecureConfigStore(db)

    store.set("test", "value")
    expect(store.get("test")).toBeNull()
  })
})
