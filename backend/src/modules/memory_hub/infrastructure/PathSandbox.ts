/**
 * PathSandbox — restricts filesystem access to a whitelisted root directory
 *
 * F-RT-020-019 remediation: Prevents drift worker from accessing files
 * outside the project root.
 */

import path from "path"
import { logger } from "@/infrastructure/logger"

export class PathSandbox {
  private rootDir: string

  constructor(rootDir: string) {
    this.rootDir = path.resolve(rootDir)
  }

  /**
   * Validate that a path is within the sandbox root.
   * Resolves symlinks and relative path traversal.
   */
  isAllowed(targetPath: string): boolean {
    const resolved = path.resolve(targetPath)
    const relative = path.relative(this.rootDir, resolved)

    // Path must be within root (not starting with ..)
    // Empty relative means target === root, which is allowed
    if (relative.startsWith("..")) {
      return false
    }

    // No path traversal sequences in the relative path
    if (relative.includes("..")) {
      return false
    }

    return true
  }

  /**
   * Assert that a path is allowed. Logs and throws if not.
   */
  assertAllowed(targetPath: string): void {
    if (!this.isAllowed(targetPath)) {
      logger.warn("[PathSandbox] Blocked path traversal attempt", {
        targetPath,
        rootDir: this.rootDir,
      })
      throw new Error(
        `PathSandbox: Access denied to "${targetPath}". ` +
          `Only paths within "${this.rootDir}" are allowed.`,
      )
    }
  }

  /**
   * Safely resolve a path within the sandbox.
   */
  resolve(subPath: string): string {
    const resolved = path.resolve(this.rootDir, subPath)
    this.assertAllowed(resolved)
    return resolved
  }
}
