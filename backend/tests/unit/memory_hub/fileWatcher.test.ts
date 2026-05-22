// Mock chokidar before importing FileWatcher
const mockOn = jest.fn()
const mockClose = jest.fn()
const mockWatch = jest.fn(() => ({
  on: mockOn,
  close: mockClose,
}))

jest.mock("chokidar", () => ({
  watch: (...args: any[]) => (mockWatch as any)(...args),
}))

// Mock fs.statSync so that mocked file paths appear to exist (F-RT-020-018 validation)
jest.mock("fs", () => ({
  ...jest.requireActual("fs"),
  statSync: (path: string) => {
    if (path.startsWith("/tmp/test/")) {
      return { isFile: () => true } as any
    }
    throw new Error("ENOENT")
  },
}))

import { FileWatcher, FileChangeEvent } from "../../../src/modules/memory_hub/infrastructure/FileWatcher"

describe("FileWatcher", () => {
  let watcher: FileWatcher
  let events: FileChangeEvent[] = []

  beforeEach(() => {
    events = []
    mockOn.mockClear()
    mockClose.mockClear()
    mockWatch.mockClear()
  })

  afterEach(() => {
    watcher?.stop()
  })

  describe("T022: file watcher detects create/update/delete events", () => {
    it("starts watching with correct options", () => {
      watcher = new FileWatcher(() => {}, 100)
      watcher.start(["/tmp/test"])

      expect(mockWatch).toHaveBeenCalledTimes(1)
      const callArgs = (mockWatch.mock.calls[0] as any[])
      expect(callArgs[0]).toEqual([expect.stringContaining("test")])
      expect(callArgs[1]).toMatchObject({
        ignored: expect.any(RegExp),
        persistent: true,
        ignoreInitial: true,
        usePolling: false,
      })
    })

    it("registers add, change, and unlink event handlers", () => {
      watcher = new FileWatcher(() => {}, 100)
      watcher.start(["/tmp/test"])

      const registeredEvents = mockOn.mock.calls.map((call) => call[0])
      expect(registeredEvents).toContain("add")
      expect(registeredEvents).toContain("change")
      expect(registeredEvents).toContain("unlink")
    })

    it("emits add events for markdown files", (done) => {
      let capturedHandler: ((path: string) => void) | null = null

      mockOn.mockImplementation((event: string, handler: (path: string) => void) => {
        if (event === "add") {
          capturedHandler = handler
        }
      })

      watcher = new FileWatcher((e) => {
        events.push(...e)
      }, 50)

      watcher.start(["/tmp/test"])

      setTimeout(() => {
        capturedHandler?.("/tmp/test/doc.md")
      }, 10)

      setTimeout(() => {
        expect(events.length).toBe(1)
        expect(events[0].type).toBe("add")
        expect(events[0].filePath).toBe("/tmp/test/doc.md")
        done()
      }, 150)
    })

    it("emits change events for markdown files", (done) => {
      let capturedHandler: ((path: string) => void) | null = null

      mockOn.mockImplementation((event: string, handler: (path: string) => void) => {
        if (event === "change") {
          capturedHandler = handler
        }
      })

      watcher = new FileWatcher((e) => {
        events.push(...e)
      }, 50)

      watcher.start(["/tmp/test"])

      setTimeout(() => {
        capturedHandler?.("/tmp/test/doc.md")
      }, 10)

      setTimeout(() => {
        expect(events.length).toBe(1)
        expect(events[0].type).toBe("change")
        expect(events[0].filePath).toBe("/tmp/test/doc.md")
        done()
      }, 150)
    })

    it("emits unlink events for markdown files", (done) => {
      let capturedHandler: ((path: string) => void) | null = null

      mockOn.mockImplementation((event: string, handler: (path: string) => void) => {
        if (event === "unlink") {
          capturedHandler = handler
        }
      })

      watcher = new FileWatcher((e) => {
        events.push(...e)
      }, 50)

      watcher.start(["/tmp/test"])

      setTimeout(() => {
        capturedHandler?.("/tmp/test/doc.md")
      }, 10)

      setTimeout(() => {
        expect(events.length).toBe(1)
        expect(events[0].type).toBe("unlink")
        expect(events[0].filePath).toBe("/tmp/test/doc.md")
        done()
      }, 150)
    })

    it("ignores non-markdown files", (done) => {
      let capturedHandler: ((path: string) => void) | null = null

      mockOn.mockImplementation((event: string, handler: (path: string) => void) => {
        if (event === "add") {
          capturedHandler = handler
        }
      })

      watcher = new FileWatcher((e) => {
        events.push(...e)
      }, 50)

      watcher.start(["/tmp/test"])

      setTimeout(() => {
        capturedHandler?.("/tmp/test/doc.txt")
        capturedHandler?.("/tmp/test/doc.md")
      }, 10)

      setTimeout(() => {
        expect(events.length).toBe(1)
        expect(events[0].filePath).toBe("/tmp/test/doc.md")
        done()
      }, 150)
    })

    it("debounces rapid changes into single batch", (done) => {
      let capturedHandler: ((path: string) => void) | null = null

      mockOn.mockImplementation((event: string, handler: (path: string) => void) => {
        if (event === "add") {
          capturedHandler = handler
        }
      })

      watcher = new FileWatcher((e) => {
        events.push(...e)
      }, 100)

      watcher.start(["/tmp/test"])

      setTimeout(() => {
        capturedHandler?.("/tmp/test/file1.md")
        capturedHandler?.("/tmp/test/file2.md")
        capturedHandler?.("/tmp/test/file3.md")
      }, 10)

      setTimeout(() => {
        expect(events.length).toBe(0)
      }, 50)

      setTimeout(() => {
        expect(events.length).toBe(3)
        done()
      }, 250)
    })

    it("uses polling when MEMORY_HUB_USE_POLLING env var is true", () => {
      const originalEnv = process.env.MEMORY_HUB_USE_POLLING
      process.env.MEMORY_HUB_USE_POLLING = "true"

      watcher = new FileWatcher(() => {}, 100)
      watcher.start(["/tmp/test"])

      const callArgs = (mockWatch.mock.calls[0] as any[])
      expect(callArgs[1].usePolling).toBe(true)

      process.env.MEMORY_HUB_USE_POLLING = originalEnv
    })

    it("stops cleanly calling watcher.close()", () => {
      watcher = new FileWatcher(() => {}, 100)
      watcher.start(["/tmp/test"])
      watcher.stop()

      expect(mockClose).toHaveBeenCalledTimes(1)
    })

    it("does not throw when stop called without start", () => {
      watcher = new FileWatcher(() => {}, 100)
      expect(() => watcher.stop()).not.toThrow()
    })
  })
})
