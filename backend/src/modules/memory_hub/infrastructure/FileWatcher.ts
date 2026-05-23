import { FSWatcher, watch } from "chokidar"
import path from "path"
import fs from "fs"
import { logger } from "@/infrastructure/logger"

export type FileChangeType = "add" | "change" | "unlink"

export interface FileChangeEvent {
  type: FileChangeType
  filePath: string
}

export class FileWatcher {
  private watcher: FSWatcher | null = null
  private onChange: (events: FileChangeEvent[]) => void
  private debounceTimer: NodeJS.Timeout | null = null
  private pendingEvents: FileChangeEvent[] = []
  private readonly debounceMs: number

  constructor(
    onChange: (events: FileChangeEvent[]) => void,
    debounceMs = 5000,
  ) {
    this.onChange = onChange
    this.debounceMs = debounceMs
  }

  start(watchDirs: string[], pollingInterval = 30000): void {
    const absoluteDirs = watchDirs.map((d) => path.resolve(d))

    // NFR-002: fallback to polling when inotify is unavailable (e.g. Docker, NFS, WSL)
    const usePolling = process.env.MEMORY_HUB_USE_POLLING === "true"

    this.watcher = watch(absoluteDirs, {
      ignored: /(^|[/\\])\../, // ignore dotfiles
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: { stabilityThreshold: 500 },
      followSymlinks: false, // F-RT-020-018: prevent symlink traversal attacks
      usePolling,
      interval: pollingInterval,
      binaryInterval: pollingInterval,
    })

    this.watcher.on("add", (filePath) => this.queueEvent("add", filePath))
    this.watcher.on("change", (filePath) => this.queueEvent("change", filePath))
    this.watcher.on("unlink", (filePath) => this.queueEvent("unlink", filePath))

    logger.info("[MemoryHub] FileWatcher started", { watchDirs: absoluteDirs })
  }

  stop(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
      this.debounceTimer = null
    }
    this.watcher?.close()
    this.watcher = null
    logger.info("[MemoryHub] FileWatcher stopped")
  }

  private queueEvent(type: FileChangeType, filePath: string): void {
    // Only watch markdown files (case-insensitive, F-RT-020-018)
    if (!filePath.toLowerCase().endsWith(".md")) return

    this.pendingEvents.push({ type, filePath })

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
    }

    this.debounceTimer = setTimeout(() => {
      // Validate files still exist after debounce (F-RT-020-018)
      const validEvents = this.pendingEvents.filter((evt) => {
        if (evt.type === "unlink") return true
        try {
          fs.statSync(evt.filePath)
          return true
        } catch {
          logger.warn("[MemoryHub] File disappeared during debounce", { filePath: evt.filePath })
          return false
        }
      })
      this.pendingEvents = []
      if (validEvents.length > 0) {
        this.onChange(validEvents)
      }
    }, this.debounceMs)
  }
}
