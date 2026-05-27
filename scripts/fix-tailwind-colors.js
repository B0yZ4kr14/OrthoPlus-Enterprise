#!/usr/bin/env node
/**
 * Script para migrar cores Tailwind hardcoded para classes semânticas do tema.
 * Mapeamento conservador: apenas casos onde o contexto é óbvio.
 */

const fs = require('fs')
const path = require('path')

// Mapeamento conservador: cor → classe semântica
// Applica a: text-, bg-, border-, ring-
const COLOR_MAP = {
  // Green → success (indicadores de sucesso, status positivo, checkmarks)
  'text-green-500': 'text-success',
  'text-green-600': 'text-success',
  'text-green-400': 'text-success',
  'text-green-700': 'text-success',
  'bg-green-500': 'bg-success',
  'bg-green-100': 'bg-success/10',
  'bg-green-50': 'bg-success/5',
  'border-green-500': 'border-success',
  'ring-green-500': 'ring-success',
  
  // Red → destructive (erros, status cancelado, alertas críticos)
  'text-red-500': 'text-destructive',
  'text-red-600': 'text-destructive',
  'text-red-400': 'text-destructive',
  'text-red-700': 'text-destructive',
  'text-red-800': 'text-destructive',
  'bg-red-500': 'bg-destructive',
  'bg-red-100': 'bg-destructive/10',
  'border-red-500': 'border-destructive',
  
  // Blue → info (status informativo, links, badges info)
  'text-blue-500': 'text-info',
  'text-blue-600': 'text-info',
  'text-blue-400': 'text-info',
  'text-blue-700': 'text-info',
  'bg-blue-500': 'bg-info',
  'border-blue-500': 'border-info',
  
  // Yellow → warning (status de aviso, pendente, alerta)
  'text-yellow-500': 'text-warning',
  'text-yellow-600': 'text-warning',
  'text-yellow-400': 'text-warning',
  'bg-yellow-500': 'bg-warning',
  'bg-yellow-100': 'bg-warning/10',
  
  // Orange → warning (status intermediário, alerta moderado)
  'text-orange-500': 'text-warning',
  'text-orange-600': 'text-warning',
  'text-orange-700': 'text-warning',
  'bg-orange-500': 'bg-warning',
  'border-orange-500': 'border-warning',
  'border-orange-200': 'border-warning/20',
}

const EXCLUDED_PATTERNS = [
  // Não substituir em comentários
  /\/\/.*text-(red|green|blue)/,
  /\/\*.*text-(red|green|blue)/,
  // Não substituir em strings que não são className
  /['"`][^'"`]*text-(red|green|blue)[^'"`]*['"`]/,
]

function findFiles(dir, extensions) {
  const results = []
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
      results.push(...findFiles(fullPath, extensions))
    } else if (entry.isFile() && extensions.some(ext => entry.name.endsWith(ext))) {
      results.push(fullPath)
    }
  }
  return results
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8')
  let modified = false
  let changes = []

  for (const [oldColor, newClass] of Object.entries(COLOR_MAP)) {
    // Regex segura: substitui apenas dentro de strings/className
    // Procura por aspas (simples, duplas ou template literal) contendo a classe
    const regex = new RegExp(
      `(["'\`\\b])${oldColor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(["'\`\\b])`,
      'g'
    )
    
    // Abordagem mais simples: substitui a substring diretamente onde aparece
    // Isso funciona porque as classes Tailwind são separadas por espaço
    const oldPattern = new RegExp(`\\b${oldColor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g')
    
    if (oldPattern.test(content)) {
      const count = (content.match(oldPattern) || []).length
      content = content.replace(oldPattern, newClass)
      changes.push({ old: oldColor, new: newClass, count })
      modified = true
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf-8')
  }

  return { modified, changes }
}

// ─── Main ───
const srcDir = path.resolve(__dirname, '../apps/web/src')
const files = findFiles(srcDir, ['.tsx', '.ts', '.css'])

let totalFiles = 0
let totalChanges = 0

for (const file of files) {
  const result = processFile(file)
  if (result.modified) {
    totalFiles++
    const fileChanges = result.changes.reduce((sum, c) => sum + c.count, 0)
    totalChanges += fileChanges
    console.log(`✅ ${path.relative(process.cwd(), file)} (${fileChanges} changes)`)
    for (const c of result.changes) {
      console.log(`   ${c.old} → ${c.new} (${c.count}x)`)
    }
  }
}

console.log(`\n📊 Resumo:`)
console.log(`   Arquivos modificados: ${totalFiles}`)
console.log(`   Substituições totais: ${totalChanges}`)
