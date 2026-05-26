import Database from "better-sqlite3"
import fs from "fs"
import path from "path"
import { logger } from "@/infrastructure/logger"
import { getMetricsCollector } from "@/infrastructure/metrics/MetricsCollector"
import { prometheusMetrics } from "@/infrastructure/metrics/PrometheusMetrics"
import { MemoryHubController } from "./api/controller"
import { SearchService } from "./domain/services/SearchService"
import { ContextBriefService } from "./domain/services/ContextBriefService"
import { IndexingService } from "./domain/services/IndexingService"
import { GraphService } from "./domain/services/GraphService"
import { EmbeddingClientFactory } from "./infrastructure/EmbeddingClientFactory"
import { EmbeddingRepository } from "./infrastructure/EmbeddingRepository"
import { DocumentRepository } from "./infrastructure/DocumentRepository"
import { FileWatcher } from "./infrastructure/FileWatcher"
import { SearchAuditRepository } from "./infrastructure/SearchAuditRepository"
import { HealthService } from "./domain/services/HealthService"
import { CostTrackingService } from "./domain/services/CostTrackingService"

export interface MemoryHubModule {
  controller: MemoryHubController
  fileWatcher: FileWatcher | null
  indexingService: IndexingService
  startFileWatcher(): void
  stopFileWatcher(): void
}

export function createMemoryHubModule(
  dbPath: string = process.env.MEMORY_HUB_INDEX_PATH || ".memory-hub/index.db",
  enabled: boolean = process.env.MEMORY_HUB_ENABLED !== "false",
  watchDirs: string[] = (process.env.MEMORY_HUB_WATCH_DIRS || "specs/,docs/,categories/")
    .split(",")
    .map((d) => d.trim()),
  pollingInterval: number = parseInt(process.env.MEMORY_HUB_POLLING_INTERVAL_MS || "30000", 10),
): MemoryHubModule {
  // Ensure parent directory exists with restricted permissions (F-RT-020-016)
  const dbDir = path.dirname(dbPath)
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true, mode: 0o700 })
  }

  const db = new Database(dbPath)

  // Restrict SQLite file permissions to owner only (F-RT-020-016)
  try {
    fs.chmodSync(dbPath, 0o600)
  } catch {
    logger.warn("[MemoryHub] Could not set SQLite file permissions")
  }

  // Backup index mechanism: copy DB to .backup on startup (F-RT-020-016)
  const backupPath = dbPath + ".backup"
  try {
    if (fs.existsSync(dbPath)) {
      fs.copyFileSync(dbPath, backupPath)
      fs.chmodSync(backupPath, 0o600)
    }
  } catch {
    logger.warn("[MemoryHub] Could not create backup index")
  }

  const metrics = getMetricsCollector(prometheusMetrics.getRegistry())

  EmbeddingClientFactory.validateConfig()
  const embedder = EmbeddingClientFactory.create()
  const embeddings = new EmbeddingRepository(db)
  const documents = new DocumentRepository(db)
  const auditRepository = new SearchAuditRepository(db)
  const healthService = new HealthService(db, documents, embeddings)
  const costTrackingService = new CostTrackingService(db)
  const searchService = new SearchService(embedder, embeddings, documents)
  const contextBriefService = new ContextBriefService(searchService, documents)
  const indexingService = new IndexingService(db)
  const graphService = new GraphService(documents)

  const controller = new MemoryHubController({
    searchService,
    contextBriefService,
    indexingService,
    graphService,
    documents,
    auditRepository,
    healthService,
    costTrackingService,
    metrics,
    db,
  })

  let fileWatcher: FileWatcher | null = null

  // Create file watcher if enabled (start explicitly via startFileWatcher)
  if (enabled) {
    fileWatcher = new FileWatcher(async (events) => {
      for (const evt of events) {
        if (evt.type === "unlink") {
          indexingService.archiveFile(evt.filePath)
        } else {
          try {
            await indexingService.indexFile(evt.filePath)
          } catch (err) {
            logger.error(`[MemoryHub] Auto-index failed for ${evt.filePath}`, { error: err })
          }
        }
      }
    })
  }

  return {
    controller,
    fileWatcher,
    indexingService,
    startFileWatcher() {
      if (fileWatcher) {
        fileWatcher.start(watchDirs, pollingInterval)
        logger.info("[MemoryHub] FileWatcher started")
      }
    },
    stopFileWatcher() {
      if (fileWatcher) {
        fileWatcher.stop()
        logger.info("[MemoryHub] FileWatcher stopped")
      }
    },
  }
}
