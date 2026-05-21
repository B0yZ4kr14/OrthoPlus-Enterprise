import { FSWatcher, watch } from "chokidar"
import path from "path"

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

    this.watcher = watch(absoluteDirs, {
      ignored: /(^|[/\\])\../, // ignore dotfiles
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: { stabilityThreshold: 500 },
      usePolling: false,
      interval: pollingInterval,
      binaryInterval: pollingInterval,
    })

    this.watcher.on("add", (filePath) => this.queueEvent("add", filePath))
    this.watcher.on("change", (filePath) => this.queueEvent("change", filePath))
    this.watcher.on("unlink", (filePath) => this.queueEvent("unlink", filePath))

    console.log("[MemoryHub] FileWatcher started for:", absoluteDirs)
  }

  stop(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
      this.debounceTimer = null
    }
    this.watcher?.close()
    this.watcher = null
    console.log("[MemoryHub] FileWatcher stopped")
  }

  private queueEvent(type: FileChangeType, filePath: string): void {
    // Only watch markdown files
    if (!filePath.endsWith(".md")) return

    this.pendingEvents.push({ type, filePath })

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
    }

    this.debounceTimer = setTimeout(() => {
      const events = [...this.pendingEvents]
      this.pendingEvents = []
      this.onChange(events)
    }, this.debounceMs)
  }
}
