/**
 * FASE 0: Auditoria Praxeológica Automatizada
 * Análise estática do código para identificar redundâncias e dead code
 */

import { Project, SyntaxKind } from "ts-morph";
import fs from "fs";
import path from "path";

interface AuditMetrics {
  total_loc: number;
  duplicated_loc: number;
  dead_code_loc: number;
  typescript_strict_violations: number;
  files_over_300_lines: string[];
  unused_imports: string[];
  circular_dependencies: string[];
  components_without_tests: string[];
}

class PraxeologicalAuditor {
  private project: Project;
  private metrics: AuditMetrics = {
    total_loc: 0,
    duplicated_loc: 0,
    dead_code_loc: 0,
    typescript_strict_violations: 0,
    files_over_300_lines: [],
    unused_imports: [],
    circular_dependencies: [],
    components_without_tests: [],
  };

  constructor() {
    this.project = new Project({
      tsConfigFilePath: "tsconfig.json",
    });
  }

  async runAudit() {
    console.log("🔍 Iniciando Auditoria Praxeológica...\n");

    await this.analyzeLOC();
    await this.analyzeFileComplexity();
    await this.analyzeUnusedImports();
    await this.analyzeTestCoverage();

    this.generateReport();
  }

  private async analyzeLOC() {
    console.log("📊 Analisando Lines of Code...");

    const sourceFiles = this.project.getSourceFiles();

    sourceFiles.forEach((file) => {
      const filePath = file.getFilePath();

      // Ignorar node_modules e build
      if (filePath.includes("node_modules") || filePath.includes("dist")) {
        return;
      }

      const lines = file.getFullText().split("\n").length;
      this.metrics.total_loc += lines;

      // Identificar arquivos grandes
      if (lines > 300) {
        this.metrics.files_over_300_lines.push(
          `${filePath.replace(process.cwd(), "")} (${lines} LOC)`,
        );
      }
    });

    console.log(`✅ Total LOC: ${this.metrics.total_loc}`);
  }

  private async analyzeFileComplexity() {
    console.log("🧩 Analisando Complexidade de Arquivos...");

    const sourceFiles = this.project.getSourceFiles();

    sourceFiles.forEach((file) => {
      const filePath = file.getFilePath();

      if (filePath.includes("node_modules") || filePath.includes("dist")) {
        return;
      }

      // Contar funções com muitos parâmetros (> 5)
      const functions = file.getFunctions();
      functions.forEach((fn) => {
        const params = fn.getParameters();
        if (params.length > 5) {
          console.warn(
            `⚠️  Função ${fn.getName()} tem ${params.length} parâmetros em ${filePath}`,
          );
        }
      });

      // Detectar uso de 'any' (TypeScript strict violation)
      const anyOccurrences = file.getDescendantsOfKind(SyntaxKind.AnyKeyword);
      this.metrics.typescript_strict_violations += anyOccurrences.length;
    });

    console.log(
      `✅ Violações TypeScript Strict: ${this.metrics.typescript_strict_violations}`,
    );
  }

  private async analyzeUnusedImports() {
    console.log("🗑️  Analisando Imports Não Utilizados...");

    const sourceFiles = this.project.getSourceFiles();

    sourceFiles.forEach((file) => {
      const filePath = file.getFilePath();

      if (filePath.includes("node_modules") || filePath.includes("dist")) {
        return;
      }

      const imports = file.getImportDeclarations();

      imports.forEach((importDecl) => {
        const namedImports = importDecl.getNamedImports();

        namedImports.forEach((namedImport) => {
          const name = namedImport.getName();
          const references = file
            .getDescendantsOfKind(SyntaxKind.Identifier)
            .filter((id) => id.getText() === name);

          // Se só há 1 referência (o próprio import), está não utilizado
          if (references.length <= 1) {
            this.metrics.unused_imports.push(
              `${name} em ${filePath.replace(process.cwd(), "")}`,
            );
          }
        });
      });
    });

    console.log(
      `✅ Imports não utilizados: ${this.metrics.unused_imports.length}`,
    );
  }

  private async analyzeTestCoverage() {
    console.log("🧪 Analisando Cobertura de Testes...");

    const sourceFiles = this.project.getSourceFiles();
    const componentFiles = sourceFiles.filter((file) => {
      const filePath = file.getFilePath();
      return (
        filePath.includes("/components/") &&
        filePath.endsWith(".tsx") &&
        !filePath.includes(".test.") &&
        !filePath.includes(".spec.")
      );
    });

    componentFiles.forEach((file) => {
      const filePath = file.getFilePath();
      const testPath = filePath.replace(".tsx", ".test.tsx");
      const specPath = filePath.replace(".tsx", ".spec.tsx");

      if (!fs.existsSync(testPath) && !fs.existsSync(specPath)) {
        this.metrics.components_without_tests.push(
          filePath.replace(process.cwd(), ""),
        );
      }
    });

    const coveragePercent =
      componentFiles.length > 0
        ? ((componentFiles.length -
            this.metrics.components_without_tests.length) /
            componentFiles.length) *
          100
        : 0;

    console.log(`✅ Cobertura de Testes: ${coveragePercent.toFixed(1)}%`);
  }

  private generateReport() {
    console.log("\n📄 Gerando Relatório...\n");

    const report = `
# RELATÓRIO DE AUDITORIA PRAXEOLÓGICA
**Data:** ${new Date().toISOString()}

---

## 📊 MÉTRICAS GERAIS

| Métrica | Valor |
|---------|-------|
| **Total LOC** | ${this.metrics.total_loc.toLocaleString()} |
| **Arquivos > 300 linhas** | ${this.metrics.files_over_300_lines.length} |
| **Violações TypeScript Strict** | ${this.metrics.typescript_strict_violations} |
| **Imports não utilizados** | ${this.metrics.unused_imports.length} |
| **Componentes sem testes** | ${this.metrics.components_without_tests.length} |

---

## 🔴 ARQUIVOS GRANDES (> 300 LOC)

${
  this.metrics.files_over_300_lines.length > 0
    ? this.metrics.files_over_300_lines.map((f) => `- ${f}`).join("\n")
    : "_Nenhum arquivo encontrado_"
}

---

## 🗑️ IMPORTS NÃO UTILIZADOS (Top 20)

${
  this.metrics.unused_imports.slice(0, 20).length > 0
    ? this.metrics.unused_imports
        .slice(0, 20)
        .map((i) => `- ${i}`)
        .join("\n")
    : "_Nenhum import não utilizado encontrado_"
}

---

## 🧪 COMPONENTES SEM TESTES (Top 20)

${
  this.metrics.components_without_tests.slice(0, 20).length > 0
    ? this.metrics.components_without_tests
        .slice(0, 20)
        .map((c) => `- ${c}`)
        .join("\n")
    : "_Todos os componentes têm testes_"
}

---

## 🎯 RECOMENDAÇÕES PRIORITÁRIAS

### Alta Prioridade
1. **Refatorar arquivos grandes**: ${this.metrics.files_over_300_lines.length} arquivos precisam ser quebrados em componentes menores
2. **Adicionar testes**: ${this.metrics.components_without_tests.length} componentes sem cobertura
3. **Remover imports**: ${this.metrics.unused_imports.length} imports podem ser removidos

### Média Prioridade
4. **TypeScript Strict**: Corrigir ${this.metrics.typescript_strict_violations} usos de 'any'

---

## 📈 PRÓXIMOS PASSOS

1. Implementar FASE 1 (Segurança Enterprise-Grade)
2. Implementar FASE 2 (Arquitetura DDD)
3. Implementar FASE 3 (Consolidação de Backups)

**Baseline estabelecida com sucesso! ✅**
`;

    fs.writeFileSync("PRAXEOLOGICAL_AUDIT_REPORT.md", report);
    console.log("✅ Relatório salvo em PRAXEOLOGICAL_AUDIT_REPORT.md\n");
  }
}

// Executar auditoria
const auditor = new PraxeologicalAuditor();
auditor.runAudit().catch(console.error);
