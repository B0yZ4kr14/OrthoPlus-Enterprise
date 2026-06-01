import fs from "fs";
import path from "path";
import { logger } from "@/infrastructure/logger";
import { IDocumentRepository } from "../ports/IDocumentRepository";
import { IDriftRepository } from "../ports/IDriftRepository";
import { PathSandbox } from "../../infrastructure/PathSandbox";
import { ContradictionDetector } from "./ContradictionDetector";
import { DriftIssue } from "../types";

export { DriftIssue };

export class DriftDetectionService {
  private documents: IDocumentRepository;
  private driftReports: IDriftRepository;
  private sandbox?: PathSandbox;

  constructor(
    documents: IDocumentRepository,
    driftReports: IDriftRepository,
    sandbox?: PathSandbox,
  ) {
    this.documents = documents;
    this.driftReports = driftReports;
    this.sandbox = sandbox;
  }

  async detect(): Promise<DriftIssue[]> {
    const issues: DriftIssue[] = [];

    issues.push(...this.detectBrokenApiRefs());
    issues.push(...this.detectOutdatedDecisions());
    issues.push(...this.detectMissingImplementations());
    issues.push(...this.detectOrphanDocs());
    issues.push(...this.detectContradictions());

    this.driftReports.insertMany(issues);

    return issues;
  }

  private detectBrokenApiRefs(): DriftIssue[] {
    const issues: DriftIssue[] = [];

    try {
      const backendRoutes = this.extractBackendRoutes();
      const frontendCalls = this.extractFrontendApiCalls();
      const specRefs = this.extractSpecApiRefs();

      // Normalize frontend calls (apiClient baseURL is "/api")
      const normalizedFrontendCalls = frontendCalls.map((call) => {
        if (call.startsWith("/api/")) return call;
        return "/api" + call;
      });

      // Deduplicate
      const uniqueFrontendCalls = [...new Set(normalizedFrontendCalls)];
      const uniqueRawFrontendCalls = [...new Set(frontendCalls)];
      const uniqueSpecRefs = [...new Set(specRefs)];

      logger.info("[DriftDetectionService] API ref scan", {
        backendRoutes: backendRoutes.length,
        frontendCalls: uniqueFrontendCalls.length,
        specRefs: uniqueSpecRefs.length,
      });

      // Check frontend calls against backend routes
      for (const call of uniqueRawFrontendCalls) {
        const normalized = call.startsWith("/api/") ? call : "/api" + call;
        const matched = backendRoutes.some((route) => {
          if (route.startsWith("/api/")) {
            return normalized.startsWith(route);
          }
          return call.startsWith(route);
        });
        if (!matched) {
          issues.push({
            type: "broken_ref",
            severity: "medium",
            sourceDocument: "apps/web/src",
            description: `Frontend API call ${normalized} does not match any registered backend route`,
          });
        }
      }

      // Check spec references against backend routes
      for (const ref of uniqueSpecRefs) {
        const matched = backendRoutes.some((route) => ref.startsWith(route));
        if (!matched) {
          issues.push({
            type: "broken_ref",
            severity: "high",
            sourceDocument: "specs/",
            description: `Spec references API ${ref} which does not match any registered backend route`,
          });
        }
      }

      // Check backend routes for orphans (no frontend or spec references)
      for (const route of backendRoutes) {
        const callsToCheck = route.startsWith("/api/")
          ? uniqueFrontendCalls
          : uniqueRawFrontendCalls;
        const hasFrontendRef = callsToCheck.some((call) =>
          call.startsWith(route),
        );
        const hasSpecRef = uniqueSpecRefs.some((ref) => ref.startsWith(route));
        if (!hasFrontendRef && !hasSpecRef) {
          issues.push({
            type: "orphan_doc",
            severity: "low",
            sourceDocument: "backend/src/index.ts",
            targetDocument: route,
            description: `Backend route ${route} has no references in frontend code or spec documents`,
          });
        }
      }
    } catch (err) {
      logger.warn("[DriftDetectionService] detectBrokenApiRefs failed", {
        error: err,
      });
    }

    return issues;
  }

  private extractBackendRoutes(): string[] {
    const routes: string[] = [];
    const indexPath = "backend/src/index.ts";

    if (this.sandbox) {
      this.sandbox.assertAllowed(indexPath);
    }

    if (!fs.existsSync(indexPath)) {
      return routes;
    }

    const content = fs.readFileSync(indexPath, "utf-8");
    // Match app.use("/api/...", ...) and app.use("/auth/v1", ...)
    const routeRegex = new RegExp(
      "app\\.use\\s*\\(\\s*[\"'`](/[^\"'`]+)[\"'`]",
      "g",
    );
    let match: RegExpExecArray | null;

    while ((match = routeRegex.exec(content)) !== null) {
      const route = match[1];
      // Only include API routes (skip middleware like cors, helmet, json, authMiddleware)
      if (route.startsWith("/api/") || route.startsWith("/auth/")) {
        routes.push(route);
      }
    }

    return [...new Set(routes)];
  }

  private extractFrontendApiCalls(): string[] {
    const calls: string[] = [];
    const frontendSrc = "apps/web/src";

    if (this.sandbox) {
      this.sandbox.assertAllowed(frontendSrc);
    }

    if (!fs.existsSync(frontendSrc)) {
      return calls;
    }

    const files = this.findFiles(frontendSrc, [".ts", ".tsx"]);
    // Match apiClient.get("/path", ...) or apiClient.post(`/path`, ...)
    // Handles template literals by extracting static prefix up to first ${ or backtick
    const callRegex = new RegExp(
      "apiClient\\.(?:get|post|put|delete|patch)(?:<[^>]+>)?\\s*\\(\\s*[\"'`]([^\"'`$]+)",
      "g",
    );

    for (const file of files) {
      try {
        if (this.sandbox) {
          this.sandbox.assertAllowed(file);
        }
        const content = fs.readFileSync(file, "utf-8");
        let match: RegExpExecArray | null;
        while ((match = callRegex.exec(content)) !== null) {
          const callPath = match[1].trim();
          if (callPath.startsWith("/")) {
            calls.push(callPath);
          }
        }
      } catch {
        // Skip unreadable files
      }
    }

    return calls;
  }

  private extractSpecApiRefs(): string[] {
    const refs: string[] = [];
    const allDocs = this.documents.listAll();

    // Regex to find /api/... references in markdown content
    // Lowercase-only after /api/ to avoid matching file paths like /api/PacientesController.ts
    const apiRefRegex = new RegExp("(/api/[a-z0-9_\\-/?=&]+)", "g");

    for (const doc of allDocs) {
      if (
        !doc.sourcePath.includes("specs/") &&
        !doc.sourcePath.includes("docs/")
      )
        continue;

      try {
        let content: string | undefined;

        // Try to get raw content from frontmatter (IndexingService stores it there)
        if (doc.frontmatter) {
          try {
            const fm = JSON.parse(doc.frontmatter) as Record<string, unknown>;
            if (typeof fm.rawContent === "string") {
              content = fm.rawContent;
            }
          } catch {
            // frontmatter is not JSON, fall through to file read
          }
        }

        // Fall back to reading the file directly
        if (!content) {
          if (this.sandbox) {
            this.sandbox.assertAllowed(doc.sourcePath);
          }
          if (fs.existsSync(doc.sourcePath)) {
            content = fs.readFileSync(doc.sourcePath, "utf-8");
          }
        }

        if (!content) continue;

        let match: RegExpExecArray | null;
        while ((match = apiRefRegex.exec(content)) !== null) {
          const ref = match[1];
          // Strip trailing punctuation / markdown artifacts and query strings
          const cleaned = ref.replace(/[.,;:!?)\]]+$/, "").replace(/\?.*$/, "");
          refs.push(cleaned);
        }
      } catch {
        // Skip unreadable docs
      }
    }

    return refs;
  }

  private findFiles(dir: string, extensions: string[]): string[] {
    const results: string[] = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (
        entry.isDirectory() &&
        !entry.name.startsWith(".") &&
        entry.name !== "node_modules"
      ) {
        results.push(...this.findFiles(fullPath, extensions));
      } else if (
        entry.isFile() &&
        extensions.some((ext) => entry.name.endsWith(ext))
      ) {
        results.push(fullPath);
      }
    }

    return results;
  }

  private detectOutdatedDecisions(): DriftIssue[] {
    const issues: DriftIssue[] = [];
    const allDocs = this.documents.listAll();

    for (const doc of allDocs) {
      // Skip archived docs
      if (doc.isArchived) continue;

      try {
        // Check if file on disk is newer than last indexed
        if (this.sandbox) {
          this.sandbox.assertAllowed(doc.sourcePath);
        }

        if (fs.existsSync(doc.sourcePath)) {
          const stats = fs.statSync(doc.sourcePath);
          const mtimeMs = stats.mtimeMs;

          if (mtimeMs > doc.lastIndexed) {
            const daysStale = Math.round(
              (mtimeMs - doc.lastIndexed) / (24 * 60 * 60 * 1000),
            );
            issues.push({
              type: "outdated_decision",
              severity: daysStale > 30 ? "high" : "medium",
              sourceDocument: doc.sourcePath,
              description: `Document modified ${daysStale} days ago but index is stale (last indexed: ${new Date(doc.lastIndexed).toISOString()})`,
            });
          }
        }
      } catch {
        // Skip unreadable docs
      }
    }

    return issues;
  }

  private detectMissingImplementations(): DriftIssue[] {
    const issues: DriftIssue[] = [];
    const allDocs = this.documents.listAll();

    // Check if specs have corresponding implementation directories
    const specDocs = allDocs.filter((d) => d.sourcePath.includes("specs/"));

    for (const spec of specDocs) {
      const featureName = path.basename(path.dirname(spec.sourcePath));
      const implPath = path.join("backend/src/modules", featureName);
      const frontendPath = path.join("apps/web/src/modules", featureName);

      // F-RT-020-019: Enforce sandbox boundaries before filesystem access
      if (this.sandbox) {
        this.sandbox.assertAllowed(implPath);
        this.sandbox.assertAllowed(frontendPath);
      }

      if (!fs.existsSync(implPath) && !fs.existsSync(frontendPath)) {
        issues.push({
          type: "missing_impl",
          severity: "medium",
          sourceDocument: spec.sourcePath,
          description: `Spec ${featureName} has no corresponding implementation in backend or frontend`,
        });
      }
    }

    return issues;
  }

  private detectOrphanDocs(): DriftIssue[] {
    const issues: DriftIssue[] = [];
    const allDocs = this.documents.listAll();

    // Find docs not referenced by any other doc (simple heuristic)
    // In a full implementation, we'd cross-reference links between docs
    const orphanThresholdDays = 90;
    const threshold = Date.now() - orphanThresholdDays * 24 * 60 * 60 * 1000;

    for (const doc of allDocs) {
      if (doc.lastIndexed < threshold && !doc.isArchived) {
        issues.push({
          type: "orphan_doc",
          severity: "low",
          sourceDocument: doc.sourcePath,
          description: `Document not reindexed in ${orphanThresholdDays} days`,
        });
      }
    }

    return issues;
  }

  private detectContradictions(): DriftIssue[] {
    const issues: DriftIssue[] = [];

    try {
      const detector = new ContradictionDetector(this.documents);
      const contradictions = detector.detect();

      for (const c of contradictions) {
        issues.push({
          type:
            c.type === "overlapping_scope"
              ? "overlapping_scope"
              : "contradictory_spec",
          severity: c.severity,
          sourceDocument: c.sourceDocument,
          targetDocument: c.targetDocument,
          description: c.description,
        });
      }
    } catch (err) {
      logger.warn("[DriftDetectionService] detectContradictions failed", {
        error: err,
      });
    }

    return issues;
  }
}
