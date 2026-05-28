import fs from "fs"
import path from "path"
import dotenv from "dotenv"
import { logger } from "@/infrastructure/logger"
import { EmbeddingClientFactory, EmbeddingProviderConfig } from "./EmbeddingClientFactory"

let chokidar: typeof import("chokidar") | null = null
try {
  chokidar = require("chokidar")
} catch {
  logger.warn("[ApiKeyHotSwap] chokidar not available — SIGHUP will be the only hot-swap mechanism")
}

/**
 * Enables hot-swapping of API keys without restart (MEM-FR-012).
 * Primary mechanism: SIGHUP signal.
 * Fallback mechanism: chokidar file watcher on .env file.
 */
export class ApiKeyHotSwap {
  private envPath: string
  private watcher: any | null = null
  private isWatching = false

  constructor(envPath = ".env") {
    this.envPath = path.resolve(envPath)
  }

  /**
   * Register SIGHUP handler and optional file watcher.
   * Call once during application startup.
   */
  start(): void {
    this.registerSignalHandler()
    this.startFileWatcher()
  }

  /**
   * Stop file watcher (if running). Signal handlers cannot be unregistered in Node.js.
   */
  stop(): void {
    if (this.watcher) {
      this.watcher.close().catch(() => {})
      this.watcher = null
      this.isWatching = false
      logger.info("[ApiKeyHotSwap] File watcher stopped")
    }
  }

  private registerSignalHandler(): void {
    process.on("SIGHUP", () => {
      logger.info("[ApiKeyHotSwap] SIGHUP received — reloading API configuration")
      this.reload()
    })
    logger.info("[ApiKeyHotSwap] SIGHUP handler registered")
  }

  private startFileWatcher(): void {
    if (!chokidar || this.isWatching) {
      return
    }

    if (!fs.existsSync(this.envPath)) {
      logger.warn(`[ApiKeyHotSwap] .env file not found at ${this.envPath} — file watcher disabled`)
      return
    }

    this.watcher = chokidar!.watch(this.envPath, {
      persistent: false,
      ignoreInitial: true,
      awaitWriteFinish: { stabilityThreshold: 500, pollInterval: 100 },
    })

    this.watcher.on("change", () => {
      logger.info(`[ApiKeyHotSwap] .env changed — reloading API configuration`)
      this.reload()
    })

    this.watcher.on("error", (error: unknown) => {
      const message = error instanceof Error ? error.message : String(error)
      logger.error("[ApiKeyHotSwap] File watcher error", { error: message })
    })

    this.isWatching = true
    logger.info(`[ApiKeyHotSwap] File watcher started on ${this.envPath}`)
  }

  /**
   * Reload environment variables and validate new configuration.
   * Thread-safe: updates process.env atomically; in-flight requests use cached clients.
   */
  private reload(): void {
    try {
      this.loadEnvFile()

      const provider = process.env.MEMORY_HUB_EMBEDDING_PROVIDER || "ollama"
      const apiKey = process.env.MEMORY_HUB_API_KEY
      const model = process.env.MEMORY_HUB_EMBEDDING_MODEL
      const baseUrl = process.env.MEMORY_HUB_API_BASE_URL

      const updates: Partial<EmbeddingProviderConfig> = {}
      if (provider) updates.provider = provider as EmbeddingProviderConfig["provider"]
      if (apiKey !== undefined) updates.apiKey = apiKey
      if (model) updates.model = model
      if (baseUrl) updates.baseUrl = baseUrl

      EmbeddingClientFactory.updateConfig(updates)

      logger.info("[ApiKeyHotSwap] Configuration reloaded successfully", {
        provider,
        model: model || "default",
        hasApiKey: !!apiKey,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      logger.error("[ApiKeyHotSwap] Reload failed — keeping previous configuration", { error: message })
    }
  }

  private loadEnvFile(): void {
    try {
      if (fs.existsSync(this.envPath)) {
        const result = dotenv.config({ path: this.envPath, override: true })
        if (result.error) {
          logger.warn("[ApiKeyHotSwap] dotenv reload failed", { error: result.error.message })
        }
      }
    } catch {
      logger.debug("[ApiKeyHotSwap] dotenv not available — relying on external env update")
    }
  }
}
