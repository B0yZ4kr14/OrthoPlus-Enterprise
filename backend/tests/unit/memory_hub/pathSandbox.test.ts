import { PathSandbox } from "../../../src/modules/memory_hub/infrastructure/PathSandbox";

describe("PathSandbox", () => {
  const sandbox = new PathSandbox("/home/project");

  it("should allow paths within the root", () => {
    expect(sandbox.isAllowed("/home/project/src/index.ts")).toBe(true);
    expect(sandbox.isAllowed("/home/project/backend/src/modules")).toBe(true);
  });

  it("should block paths outside the root", () => {
    expect(sandbox.isAllowed("/etc/passwd")).toBe(false);
    expect(sandbox.isAllowed("/home/other-project")).toBe(false);
    expect(sandbox.isAllowed("/")).toBe(false);
  });

  it("should block path traversal attempts", () => {
    expect(sandbox.isAllowed("/home/project/../../../etc/passwd")).toBe(false);
    // Note: /home/project/backend/../package.json resolves to /home/project/package.json
    // which is within the sandbox — this is correct behavior after normalization
    expect(sandbox.isAllowed("/home/project/backend/../package.json")).toBe(
      true,
    );
  });

  it("should block absolute paths outside root even if they contain root substring", () => {
    expect(sandbox.isAllowed("/home/project-malicious")).toBe(false);
  });

  it("should allow root itself", () => {
    expect(sandbox.isAllowed("/home/project")).toBe(true);
  });

  it("should throw on assertAllowed for blocked paths", () => {
    expect(() => sandbox.assertAllowed("/etc/passwd")).toThrow("Access denied");
  });

  it("should resolve safe subpaths", () => {
    expect(sandbox.resolve("backend/src")).toBe("/home/project/backend/src");
    expect(sandbox.resolve("apps/web")).toBe("/home/project/apps/web");
  });

  it("should throw on resolve for traversal subpaths", () => {
    expect(() => sandbox.resolve("../etc")).toThrow("Access denied");
  });
});
