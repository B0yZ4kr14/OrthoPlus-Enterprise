#!/usr/bin/env python3
import re
import json
import subprocess
from datetime import datetime

LOCKFILE = "/home/b0yz4kr14/Projects/OrthoPlus-Enterprise/pnpm-lock.yaml"
REPORT_PATH = "/home/b0yz4kr14/Projects/OrthoPlus-Enterprise/.specify/version-guard-report.md"

PACKAGES = [
    "react", "react-dom", "vite", "express",
    "prisma", "@prisma/client",
    "jsonwebtoken", "bcrypt", "helmet", "express-rate-limit",
    "zustand", "@tanstack/react-query",
    "tailwindcss", "tailwind-merge", "clsx", "autoprefixer", "postcss",
    "playwright", "jest", "@playwright/test", "vitest", "@testing-library/react",
    "typescript", "eslint", "@eslint/js", "typescript-eslint",
    "@typescript-eslint/eslint-plugin", "@typescript-eslint/parser",
    "turbo", "tsx", "ts-jest", "tsc-alias", "tsconfig-paths", "esbuild",
    "axios", "zod", "winston", "ioredis", "pg", "dotenv", "cors",
    "cookie-parser", "multer", "node-cron", "nodemailer",
    "prom-client", "supertest",
    "react-router-dom", "react-hook-form", "framer-motion", "lucide-react",
    "sonner", "date-fns", "uuid", "qrcode", "html2canvas", "jspdf",
    "@hookform/resolvers", "recharts", "exceljs", "fabric", "canvas-confetti",
    "@dnd-kit/core", "@react-three/drei", "@react-three/fiber", "three",
    "@fontsource/jetbrains-mono", "@fontsource/plus-jakarta-sans",
    "react-hotkeys-hook", "react-image-crop", "react-joyride",
    "use-debounce", "@vitejs/plugin-react-swc",
    "nodemon", "prettier", "tailwindcss-animate", "globals",
    "eslint-plugin-react-hooks", "eslint-plugin-react-refresh",
    "eslint-plugin-unused-imports", "terser",
    "@types/node", "@types/react", "@types/react-dom",
    "@types/express", "@types/bcrypt", "@types/jsonwebtoken",
    "@types/jest", "@types/multer", "@types/cors",
    "@types/cookie-parser", "@types/node-cron", "@types/nodemailer",
    "@types/pg", "@types/supertest",
]

def parse_lockfile_versions(lockfile_path, packages):
    versions = {}
    with open(lockfile_path, "r", encoding="utf-8") as f:
        content = f.read()
    for pkg in packages:
        patterns = [
            rf'^      {re.escape(pkg)}:\s*\n        specifier:.*\n        version: ([^\s\n(]+)',
            rf'^      \'{re.escape(pkg)}\':\s*\n        specifier:.*\n        version: ([^\s\n(]+)',
            rf'^      "{re.escape(pkg)}":\s*\n        specifier:.*\n        version: ([^\s\n(]+)',
        ]
        found = None
        for pat in patterns:
            m = re.search(pat, content, re.MULTILINE)
            if m:
                ver = m.group(1).split("(")[0].strip()
                found = ver
                break
        versions[pkg] = found
    return versions

def fetch_npm_latest(pkg):
    url = f"https://registry.npmjs.org/{pkg.replace('/', '%2F')}/latest"
    try:
        result = subprocess.run(
            ["curl", "-sS", "--max-time", "15", "-H", "Accept: application/json", url],
            capture_output=True, text=True, timeout=20
        )
        if result.returncode != 0:
            return None, result.stderr.strip()
        data = json.loads(result.stdout)
        return data.get("version"), data.get("deprecated")
    except Exception as e:
        return None, str(e)

def classify(current, latest):
    if not current or not latest:
        return "Unverified"
    if current == latest:
        return "Current"
    return "Behind"

def main():
    locked = parse_lockfile_versions(LOCKFILE, PACKAGES)
    results = []
    unverified = []
    behind = []
    current = []

    print(f"Checking {len(PACKAGES)} packages...")
    for pkg in PACKAGES:
        locked_ver = locked.get(pkg)
        latest_ver, deprecation = fetch_npm_latest(pkg)
        status = classify(locked_ver, latest_ver)
        results.append({
            "package": pkg,
            "locked": locked_ver or "—",
            "latest": latest_ver or "—",
            "status": status,
            "deprecated": deprecation if deprecation else "",
        })
        if status == "Unverified":
            unverified.append(pkg)
        elif status == "Behind":
            behind.append(pkg)
        else:
            current.append(pkg)
        print(f"  {pkg}: locked={locked_ver or '—'} latest={latest_ver or '—'} {status}")

    results.sort(key=lambda r: (
        0 if r["status"] == "Behind" else (1 if r["status"] == "Current" else 2),
        r["package"].lower()
    ))

    now = datetime.now().isoformat()
    lines = [
        "# Version Guard Report — OrthoPlus Enterprise",
        "",
        f"**Generated:** {now}",
        f"**Lockfile:** pnpm-lock.yaml",
        f"**Package Manager:** pnpm 10.33.0",
        "",
        "## Summary",
        "",
        f"- Current: {len(current)}",
        f"- Behind: {len(behind)}",
        f"- Unverified: {len(unverified)}",
        "",
        "## Top Packages Status",
        "",
        "| Package | Locked | Latest | Status | Notes |",
        "|---------|--------|--------|--------|-------|",
    ]

    for r in results:
        notes = r["deprecated"]
        lines.append(f"| {r['package']} | {r['locked']} | {r['latest']} | {r['status']} | {notes} |")

    lines.extend([
        "",
        "## Critical Findings",
        "",
    ])

    if behind:
        lines.append("### Packages Behind Latest")
        lines.append("")
        for pkg in behind:
            r = next(x for x in results if x["package"] == pkg)
            lines.append(f"- {pkg}: {r['locked']} -> {r['latest']}")
        lines.append("")
    else:
        lines.append("- No packages are behind latest.")
        lines.append("")

    if unverified:
        lines.append("### Unverified Packages")
        lines.append("")
        for pkg in unverified:
            r = next(x for x in results if x["package"] == pkg)
            lines.append(f"- {pkg}: {r['deprecated'] or 'Could not fetch from npm'}")
        lines.append("")

    lines.extend([
        "### Security Notes",
        "",
        "- jsonwebtoken 9.0.2: Verify against known CVEs for jwt libs (CVE-2022-23529 through CVE-2022-23543). Ensure latest patch.",
        "- express <4.19: CVE-2024-29041 (qs Prototype Pollution). Upgrade to >=4.19.2 if behind.",
        "- vite <5.4.6: CVE-2024-45812 / CVE-2024-45811 (server.fs.deny bypass). Upgrade if behind.",
        "- axios <1.7.4: CVE-2024-39348 (SSRF). Upgrade if behind.",
        "- helmet <7.2.0: Monitor for security policy updates.",
        "- react <18.3.1: Ensure latest patch for DoS fixes.",
        "- zod <3.23.8: Monitor for prototype pollution fixes.",
        "",
        "## Recommendations",
        "",
        "1. Run pnpm audit --prod to surface known CVEs in resolved lockfile.",
        "2. For packages marked Behind, review changelogs for breaking changes before upgrading.",
        "3. Keep prisma and @prisma/client in sync.",
        "4. Ensure express is on >=4.19.2.",
        "5. Verify jsonwebtoken is on latest 9.x patch (or migrate to 10.x if feasible).",
        "",
    ])

    report = "\n".join(lines)
    with open(REPORT_PATH, "w", encoding="utf-8") as f:
        f.write(report)

    print(f"\nReport written to: {REPORT_PATH}")
    print(f"Summary: {len(current)} current, {len(behind)} behind, {len(unverified)} unverified")

if __name__ == "__main__":
    main()
