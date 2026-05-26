#!/usr/bin/env node
/**
 * Script de Auditoria de Tipos Duplicados Frontend/Backend
 * OrthoPlus Enterprise
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const FRONTEND_DIR = path.join(__dirname, '..', 'apps', 'web', 'src')
const BACKEND_DIR = path.join(__dirname, '..', 'backend', 'src')
const REPORT_PATH = path.join(__dirname, '..', 'docs', 'aide', 'auditoria-tipos.md')

// Palavras-chave JS/TS que nunca sao membros de tipos
const JS_KEYWORDS = new Set([
  'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue',
  'return', 'throw', 'try', 'catch', 'finally', 'with', 'debugger',
  'function', 'const', 'let', 'var', 'import', 'export', 'default',
  'from', 'as', 'new', 'this', 'super', 'typeof', 'instanceof', 'void', 'delete',
  'in', 'of', 'await', 'yield', 'async'
])

function shouldSkipFile(filePath) {
  const basename = path.basename(filePath)
  if (basename === 'database.ts') return true
  if (basename.endsWith('.test.ts') || basename.endsWith('.spec.ts')) return true
  if (basename.endsWith('.d.ts')) return true
  if (filePath.includes('node_modules')) return true
  return false
}

function walkDir(dir, callback) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walkDir(fullPath, callback)
    } else {
      callback(fullPath)
    }
  }
}

function stripComments(code) {
  let result = code.replace(/\/\/.*$/gm, '')
  result = result.replace(/\/\*[\s\S]*?\*\//g, '')
  return result
}

const DECL_REGEX = /^\s*(?:export\s+(?:default\s+)?)?(?:abstract\s+)?(?:class|interface|type)\s+([A-Za-z0-9_]+)/gm

function extractDeclarations(filePath, content, side) {
  const cleanContent = stripComments(content)
  const decls = []

  let match
  while ((match = DECL_REGEX.exec(cleanContent)) !== null) {
    const name = match[1]
    const startIndex = match.index
    const lineNumber = cleanContent.substring(0, startIndex).split('\n').length

    const afterDecl = cleanContent.substring(startIndex)
    const openBrace = afterDecl.indexOf('{')

    let body = ''
    let properties = []

    if (openBrace !== -1) {
      let braceCount = 0
      let inString = false
      let stringChar = ''
      let escaped = false
      let i = openBrace

      for (; i < afterDecl.length; i++) {
        const ch = afterDecl[i]
        if (escaped) {
          escaped = false
          continue
        }
        if (ch === '\\') {
          escaped = true
          continue
        }
        if (inString) {
          if (ch === stringChar) inString = false
          continue
        }
        if (ch === '"' || ch === "'" || ch === '`') {
          inString = true
          stringChar = ch
          continue
        }
        if (ch === '{') braceCount++
        else if (ch === '}') {
          braceCount--
          if (braceCount === 0) break
        }
      }
      body = afterDecl.substring(openBrace + 1, i)
    } else {
      const line = cleanContent.split('\n')[lineNumber - 1] || ''
      const eqIndex = line.indexOf('=')
      if (eqIndex !== -1) {
        body = line.substring(eqIndex + 1)
      }
    }

    properties = extractMemberNames(body)

    decls.push({
      name,
      file: filePath,
      line: lineNumber,
      side,
      kind: match[0].includes('interface')
        ? 'interface'
        : match[0].includes('type')
          ? 'type'
          : 'class',
      properties
    })
  }

  return decls
}

function extractMemberNames(body) {
  const names = new Set()

  const propRegex = /^\s*(?:readonly\s+)?(?:private\s+|protected\s+|public\s+)?([a-zA-Z_][a-zA-Z0-9_]*)\??\s*:/gm
  let m
  while ((m = propRegex.exec(body)) !== null) {
    if (!JS_KEYWORDS.has(m[1])) names.add(m[1])
  }

  const methodRegex = /^\s*(?:async\s+)?(?:private\s+|protected\s+|public\s+)?([a-zA-Z_][a-zA-Z0-9_]*)\s*(?:<[^>]+>)?\s*\(/gm
  while ((m = methodRegex.exec(body)) !== null) {
    if (!JS_KEYWORDS.has(m[1])) names.add(m[1])
  }

  const accessorRegex = /^\s*(?:get|set)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/gm
  while ((m = accessorRegex.exec(body)) !== null) {
    if (!JS_KEYWORDS.has(m[1])) names.add(m[1])
  }

  return Array.from(names)
}

function computeOverlap(propsA, propsB) {
  if (propsA.length === 0 && propsB.length === 0) return 1
  const setA = new Set(propsA)
  const setB = new Set(propsB)
  const intersection = new Set([...setA].filter(x => setB.has(x)))
  const minSize = Math.min(setA.size, setB.size)
  return minSize === 0 ? 0 : intersection.size / minSize
}

function main() {
  console.log('Scanning frontend...')
  const frontendDecls = []
  walkDir(FRONTEND_DIR, (filePath) => {
    if (shouldSkipFile(filePath)) return
    const content = fs.readFileSync(filePath, 'utf-8')
    frontendDecls.push(...extractDeclarations(filePath, content, 'frontend'))
  })
  console.log(`  Found ${frontendDecls.length} declarations`)

  console.log('Scanning backend...')
  const backendDecls = []
  walkDir(BACKEND_DIR, (filePath) => {
    if (shouldSkipFile(filePath)) return
    const content = fs.readFileSync(filePath, 'utf-8')
    backendDecls.push(...extractDeclarations(filePath, content, 'backend'))
  })
  console.log(`  Found ${backendDecls.length} declarations`)

  const byName = {}
  for (const d of [...frontendDecls, ...backendDecls]) {
    if (!byName[d.name]) byName[d.name] = { frontend: [], backend: [] }
    byName[d.name][d.side].push(d)
  }

  const duplicates = []
  for (const [name, groups] of Object.entries(byName)) {
    if (groups.frontend.length > 0 && groups.backend.length > 0) {
      duplicates.push({ name, ...groups })
    }
  }
  duplicates.sort((a, b) => a.name.localeCompare(b.name))

  console.log(`  Duplicates found: ${duplicates.length}`)

  let report = '# Auditoria de Tipos Duplicados\n\n'
  report += `> Gerado automaticamente em: ${new Date().toLocaleString('pt-BR')}\n\n`
  report += '## Resumo\n'
  report += `- Total de tipos no frontend: ${frontendDecls.length}\n`
  report += `- Total de tipos no backend: ${backendDecls.length}\n`
  report += `- Duplicatas encontradas: ${duplicates.length}\n\n`

  report += '## Duplicatas Candidatas a Migracao\n\n'

  for (const dup of duplicates) {
    let bestPair = null
    let bestScore = -1

    for (const f of dup.frontend) {
      for (const b of dup.backend) {
        const score = computeOverlap(f.properties, b.properties)
        if (score > bestScore) {
          bestScore = score
          bestPair = { frontend: f, backend: b }
        }
      }
    }

    if (!bestPair) continue

    const fProps = new Set(bestPair.frontend.properties)
    const bProps = new Set(bestPair.backend.properties)
    const onlyInFrontend = [...fProps].filter(p => !bProps.has(p)).sort()
    const onlyInBackend = [...bProps].filter(p => !fProps.has(p)).sort()
    const common = [...fProps].filter(p => bProps.has(p)).sort()

    let severity
    if (bestScore >= 0.7) severity = 'ALTA'
    else if (bestScore >= 0.3) severity = 'MEDIA'
    else severity = 'BAIXA'

    const moreComplete =
      bestPair.frontend.properties.length >= bestPair.backend.properties.length
        ? 'frontend'
        : 'backend'

    const relFile = (p) => path.relative(path.join(__dirname, '..'), p)

    report += `### ${dup.name}\n`
    report += `- **Frontend:** \`${relFile(bestPair.frontend.file)}\` (linha ${bestPair.frontend.line})\n`
    report += `- **Backend:** \`${relFile(bestPair.backend.file)}\` (linha ${bestPair.backend.line})\n`
    report += `- **Kind:** ${bestPair.frontend.kind} / ${bestPair.backend.kind}\n`
    report += `- **Severidade:** ${severity}\n`
    report += `- **Sobreposicao:** ${(bestScore * 100).toFixed(0)}% (${common.length} de ${Math.max(fProps.size, bProps.size)} campos comuns)\n`
    report += `- **Sugestao:** Manter versao do ${moreComplete} — mais completa (${bestPair.frontend.properties.length} vs ${bestPair.backend.properties.length} campos)\n`

    const diffs = []
    if (onlyInFrontend.length) {
      diffs.push(`campos apenas no frontend: \`${onlyInFrontend.join(', ')}\``)
    }
    if (onlyInBackend.length) {
      diffs.push(`campos apenas no backend: \`${onlyInBackend.join(', ')}\``)
    }
    if (diffs.length === 0) {
      diffs.push('estruturas identicas')
    }
    report += `- **Diff:** ${diffs.join('; ')}\n`
    report += '\n'
  }

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true })
  fs.writeFileSync(REPORT_PATH, report, 'utf-8')

  console.log(`\n✅ Relatorio gerado em: ${REPORT_PATH}`)
  console.log(`   Resumo: ${frontendDecls.length} frontend, ${backendDecls.length} backend, ${duplicates.length} duplicatas`)
}

main()
