import crypto from "crypto";
import Database from "better-sqlite3";
import { logger } from "@/infrastructure/logger";

/**
 * AES-256-GCM encrypted configuration storage (MEM-NFR-006).
 * Stores sensitive values (API keys, tokens) encrypted at rest in SQLite.
 * Master key derived from MEMORY_HUB_MASTER_KEY env var (32-byte hex).
 */
export class SecureConfigStore {
  private db: Database.Database;
  private masterKey: Buffer | null;
  private algorithm = "aes-256-gcm";

  constructor(db: Database.Database) {
    this.db = db;
    this.masterKey = this.deriveMasterKey();
    this.ensureTable();
  }

  /**
   * Store a value encrypted. If master key is unset, stores plaintext with warning (dev only).
   */
  set(key: string, value: string): void {
    if (!this.masterKey) {
      logger.warn(
        `[SecureConfigStore] Storing plaintext for ${key} — MEMORY_HUB_MASTER_KEY not set (development only)`,
      );
      this.storePlaintext(key, value);
      return;
    }

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      this.algorithm,
      this.masterKey,
      iv,
    ) as crypto.CipherGCM;

    let encrypted = cipher.update(value, "utf8", "hex");
    encrypted += cipher.final("hex");
    const authTag = cipher.getAuthTag();

    const stmt = this.db.prepare(`
      INSERT INTO config (key, encrypted_value, iv, auth_tag, updated_at)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET
        encrypted_value = excluded.encrypted_value,
        iv = excluded.iv,
        auth_tag = excluded.auth_tag,
        updated_at = excluded.updated_at
    `);

    stmt.run(key, Buffer.from(encrypted, "hex"), iv, authTag, Date.now());
    logger.info(`[SecureConfigStore] Encrypted and stored key: ${key}`);
  }

  /**
   * Retrieve and decrypt a value. Returns null if key not found.
   */
  get(key: string): string | null {
    const row = this.db
      .prepare("SELECT encrypted_value, iv, auth_tag FROM config WHERE key = ?")
      .get(key) as
      | { encrypted_value: Buffer; iv: Buffer; auth_tag: Buffer }
      | undefined;

    if (!row) {
      return null;
    }

    if (!this.masterKey) {
      logger.warn(
        `[SecureConfigStore] Cannot decrypt ${key} — MEMORY_HUB_MASTER_KEY not set`,
      );
      return null;
    }

    try {
      const decipher = crypto.createDecipheriv(
        this.algorithm,
        this.masterKey,
        row.iv,
      ) as crypto.DecipherGCM;
      decipher.setAuthTag(row.auth_tag);

      let decrypted = decipher.update(
        row.encrypted_value.toString("hex"),
        "hex",
        "utf8",
      );
      decrypted += decipher.final("utf8");

      return decrypted;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error(
        `[SecureConfigStore] Decryption failed for ${key} — data may be corrupted or master key changed`,
        { error: message },
      );
      return null;
    }
  }

  /**
   * Check if a key exists (regardless of encryption state).
   */
  has(key: string): boolean {
    const row = this.db.prepare("SELECT 1 FROM config WHERE key = ?").get(key);
    return !!row;
  }

  /**
   * Delete a key from secure storage.
   */
  delete(key: string): void {
    this.db.prepare("DELETE FROM config WHERE key = ?").run(key);
    logger.info(`[SecureConfigStore] Deleted key: ${key}`);
  }

  /**
   * Store API key encrypted. Convenience method.
   */
  storeApiKey(provider: string, apiKey: string): void {
    this.set(`api_key_${provider}`, apiKey);
  }

  /**
   * Retrieve API key for a provider.
   */
  getApiKey(provider: string): string | null {
    return this.get(`api_key_${provider}`);
  }

  private deriveMasterKey(): Buffer | null {
    const hexKey = process.env.MEMORY_HUB_MASTER_KEY;
    if (!hexKey) {
      logger.warn(
        "[SecureConfigStore] MEMORY_HUB_MASTER_KEY not set — encryption disabled (development only)",
      );
      return null;
    }

    if (hexKey.length !== 64) {
      logger.error(
        "[SecureConfigStore] MEMORY_HUB_MASTER_KEY must be exactly 64 hex characters (32 bytes)",
      );
      return null;
    }

    try {
      return Buffer.from(hexKey, "hex");
    } catch {
      logger.error(
        "[SecureConfigStore] MEMORY_HUB_MASTER_KEY is not valid hex",
      );
      return null;
    }
  }

  private ensureTable(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS config (
        key TEXT PRIMARY KEY,
        encrypted_value BLOB NOT NULL,
        iv BLOB NOT NULL,
        auth_tag BLOB NOT NULL,
        updated_at INTEGER
      )
    `);
  }

  private storePlaintext(key: string, value: string): void {
    const stmt = this.db.prepare(`
      INSERT INTO config (key, encrypted_value, iv, auth_tag, updated_at)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET
        encrypted_value = excluded.encrypted_value,
        iv = excluded.iv,
        auth_tag = excluded.auth_tag,
        updated_at = excluded.updated_at
    `);
    stmt.run(
      key,
      Buffer.from(value, "utf8"),
      Buffer.alloc(0),
      Buffer.alloc(0),
      Date.now(),
    );
  }
}
