/**
 * Diagnosticar drift entre schema Prisma e banco PostgreSQL.
 *
 * Uso:
 *   cd backend && npx tsx scripts/diagnose-schema-drift.ts
 *
 * Este script e READ-ONLY. Apenas consulta information_schema.
 */
import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PrismaField {
  name: string;
  type: string;
  isOptional: boolean;
  isArray: boolean;
  dbNativeType?: string;
}

interface PrismaModel {
  name: string;
  schema: string;
  fields: PrismaField[];
}

interface DbColumn {
  column_name: string;
  data_type: string;
  udt_name: string;
  is_nullable: string;
}

interface DbTable {
  schema: string;
  name: string;
  columns: DbColumn[];
}

interface DriftItem {
  category:
    | "tableMissingInDb"
    | "tableMissingInPrisma"
    | "schemaMismatch"
    | "columnMissingInDb"
    | "columnMissingInPrisma"
    | "typeMismatch"
    | "nullabilityMismatch";
  severity: "critical" | "high" | "medium" | "low";
  prismaSchema?: string;
  prismaTable?: string;
  prismaColumn?: string;
  prismaType?: string;
  dbSchema?: string;
  dbTable?: string;
  dbColumn?: string;
  dbType?: string;
  message: string;
  recommendation: string;
}

interface Report {
  timestamp: string;
  databaseUrl: string;
  summary: {
    totalPrismaModels: number;
    totalPrismaScalarFields: number;
    totalDbTables: number;
    totalDbColumns: number;
    tablesMissingInDb: number;
    tablesMissingInPrisma: number;
    schemaMismatches: number;
    columnsMissingInDb: number;
    columnsMissingInPrisma: number;
    typeMismatches: number;
    nullabilityMismatches: number;
  };
  drifts: DriftItem[];
}

// ---------------------------------------------------------------------------
// Prisma Schema Parser
// ---------------------------------------------------------------------------

function parsePrismaSchema(schemaPath: string): {
  models: PrismaModel[];
  enums: Set<string>;
} {
  const content = fs.readFileSync(schemaPath, "utf-8");

  // Remove block comments /* ... */
  const withoutBlockComments = content.replace(/\/\*[\s\S]*?\*\//g, "");
  const lines = withoutBlockComments.split("\n");

  // Pass 1: collect model and enum names
  const modelNames = new Set<string>();
  const enumNames = new Set<string>();

  for (const line of lines) {
    const m = line.match(/^\s*(model|enum)\s+(\w+)\s*\{/);
    if (m) {
      if (m[1] === "model") modelNames.add(m[2]);
      else enumNames.add(m[2]);
    }
  }

  // Pass 2: parse models
  const models: PrismaModel[] = [];
  let currentModel: PrismaModel | null = null;
  let braceDepth = 0;

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.split("//")[0]; // strip inline comments

    if (!currentModel) {
      const m = line.match(/^\s*model\s+(\w+)\s*\{/);
      if (m) {
        currentModel = { name: m[1], schema: "public", fields: [] };
        braceDepth = 1;
      }
      continue;
    }

    // Count braces
    const open = (line.match(/\{/g) || []).length;
    const close = (line.match(/\}/g) || []).length;
    braceDepth += open - close;

    if (braceDepth <= 0) {
      models.push(currentModel);
      currentModel = null;
      braceDepth = 0;
      continue;
    }

    if (braceDepth === 1 && open === 1) continue; // first line of model

    const trimmed = line.trim();
    if (!trimmed) continue;

    // @@schema
    const schemaMatch = trimmed.match(/^@@schema\("([^"]+)"\)/);
    if (schemaMatch) {
      currentModel.schema = schemaMatch[1];
      continue;
    }

    // Skip other model-level attributes
    if (trimmed.startsWith("@@")) continue;

    // Parse field
    const tokens = trimmed.split(/\s+/).filter(Boolean);
    if (tokens.length < 2) continue;

    const fieldName = tokens[0];
    let fieldTypeRaw = tokens[1];

    const isOptional = fieldTypeRaw.endsWith("?");
    const isArray = fieldTypeRaw.endsWith("[]");
    const baseType = fieldTypeRaw.replace(/\?+$/, "").replace(/\[\]+$/, "");

    // Skip relation fields (type is another model name)
    if (modelNames.has(baseType)) continue;

    // Extract @db. native type
    let dbNativeType: string | undefined;
    const dbMatch = trimmed.match(/@db\.(\w+)(?:\([^)]*\))?/);
    if (dbMatch) {
      dbNativeType = dbMatch[0]; // full match like @db.VarChar(255)
    }

    currentModel.fields.push({
      name: fieldName,
      type: baseType,
      isOptional,
      isArray,
      dbNativeType,
    });
  }

  return { models, enums: enumNames };
}

// ---------------------------------------------------------------------------
// Type Mapping
// ---------------------------------------------------------------------------

function getExpectedDbTypes(field: PrismaField): string[] {
  const { type, dbNativeType, isArray } = field;

  // For arrays, information_schema.udt_name prefixes with _ and data_type is ARRAY
  const map: Record<string, string[]> = {
    String: ["text", "character varying", "varchar", "bpchar", "char"],
    Int: ["integer", "int", "int4"],
    BigInt: ["bigint", "int8"],
    Float: ["double precision", "float8"],
    Decimal: ["numeric", "decimal"],
    DateTime: [
      "timestamp with time zone",
      "timestamp without time zone",
      "timestamptz",
      "timestamp",
    ],
    Boolean: ["boolean", "bool"],
    Json: ["jsonb", "json"],
    Bytes: ["bytea"],
  };

  // Adjust based on @db. native type
  if (dbNativeType) {
    if (dbNativeType.startsWith("@db.Uuid"))
      return isArray ? ["_uuid"] : ["uuid"];
    if (dbNativeType.startsWith("@db.VarChar"))
      return isArray
        ? ["_varchar", "_character varying"]
        : ["character varying", "varchar"];
    if (dbNativeType.startsWith("@db.Char"))
      return isArray ? ["_bpchar", "_char"] : ["character", "bpchar", "char"];
    if (dbNativeType.startsWith("@db.Text"))
      return isArray ? ["_text"] : ["text"];
    if (dbNativeType.startsWith("@db.Citext"))
      return isArray ? ["_citext"] : ["citext"];
    if (dbNativeType.startsWith("@db.Bit")) return isArray ? ["_bit"] : ["bit"];
    if (dbNativeType.startsWith("@db.VarBit"))
      return isArray ? ["_varbit", "_bit varying"] : ["bit varying", "varbit"];
    if (dbNativeType.startsWith("@db.Inet"))
      return isArray ? ["_inet"] : ["inet"];
    if (dbNativeType.startsWith("@db.MacAddr"))
      return isArray ? ["_macaddr"] : ["macaddr"];
    if (dbNativeType.startsWith("@db.SmallInt"))
      return isArray ? ["_smallint", "_int2"] : ["smallint", "int2"];
    if (dbNativeType.startsWith("@db.Oid")) return isArray ? ["_oid"] : ["oid"];
    if (dbNativeType.startsWith("@db.Real"))
      return isArray ? ["_real", "_float4"] : ["real", "float4"];
    if (dbNativeType.startsWith("@db.DoublePrecision"))
      return isArray
        ? ["_float8", "_double precision"]
        : ["double precision", "float8"];
    if (dbNativeType.startsWith("@db.Decimal"))
      return isArray ? ["_numeric", "_decimal"] : ["numeric", "decimal"];
    if (dbNativeType.startsWith("@db.Timestamp"))
      return isArray
        ? ["_timestamp"]
        : ["timestamp without time zone", "timestamp"];
    if (dbNativeType.startsWith("@db.Timestamptz"))
      return isArray
        ? ["_timestamptz"]
        : ["timestamp with time zone", "timestamptz"];
    if (dbNativeType.startsWith("@db.Date"))
      return isArray ? ["_date"] : ["date"];
    if (dbNativeType.startsWith("@db.Time"))
      return isArray ? ["_time"] : ["time without time zone", "time"];
    if (dbNativeType.startsWith("@db.Json"))
      return isArray ? ["_json"] : ["json"];
    if (dbNativeType.startsWith("@db.JsonB"))
      return isArray ? ["_jsonb"] : ["jsonb"];
    if (dbNativeType.startsWith("@db.ByteA"))
      return isArray ? ["_bytea"] : ["bytea"];
  }

  const base = map[type];
  if (!base) return []; // unknown / enum handled separately
  if (isArray) {
    return base.map((b) => "_" + b.replace(/\s+/g, " "));
  }
  return base;
}

function isEnumType(prismaType: string, enums: Set<string>): boolean {
  return enums.has(prismaType);
}

// ---------------------------------------------------------------------------
// Database Introspection
// ---------------------------------------------------------------------------

async function introspectDatabase(prisma: PrismaClient): Promise<DbTable[]> {
  const tablesResult = await prisma.$queryRaw<
    { table_schema: string; table_name: string }[]
  >`
    SELECT table_schema, table_name
    FROM information_schema.tables
    WHERE table_schema NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
      AND table_type = 'BASE TABLE'
    ORDER BY table_schema, table_name
  `;

  const columnsResult = await prisma.$queryRaw<
    {
      table_schema: string;
      table_name: string;
      column_name: string;
      data_type: string;
      udt_name: string;
      is_nullable: string;
    }[]
  >`
    SELECT table_schema, table_name, column_name, data_type, udt_name, is_nullable
    FROM information_schema.columns
    WHERE table_schema NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
    ORDER BY table_schema, table_name, ordinal_position
  `;

  const columnsByTable = new Map<string, DbColumn[]>();
  for (const col of columnsResult) {
    const key = `${col.table_schema}.${col.table_name}`;
    if (!columnsByTable.has(key)) columnsByTable.set(key, []);
    columnsByTable.get(key)!.push({
      column_name: col.column_name,
      data_type: col.data_type,
      udt_name: col.udt_name,
      is_nullable: col.is_nullable,
    });
  }

  return tablesResult.map((t) => ({
    schema: t.table_schema,
    name: t.table_name,
    columns: columnsByTable.get(`${t.table_schema}.${t.table_name}`) || [],
  }));
}

// ---------------------------------------------------------------------------
// Comparison Logic
// ---------------------------------------------------------------------------

function compareSchemas(
  prismaModels: PrismaModel[],
  dbTables: DbTable[],
  enums: Set<string>,
): Report {
  const drifts: DriftItem[] = [];

  const dbTableMap = new Map<string, DbTable>();
  for (const t of dbTables) {
    dbTableMap.set(`${t.schema}.${t.name}`, t);
  }

  const dbTableNameToSchemas = new Map<string, string[]>();
  for (const t of dbTables) {
    if (!dbTableNameToSchemas.has(t.name)) dbTableNameToSchemas.set(t.name, []);
    dbTableNameToSchemas.get(t.name)!.push(t.schema);
  }

  const prismaModelMap = new Map<string, PrismaModel>();
  for (const m of prismaModels) {
    prismaModelMap.set(`${m.schema}.${m.name}`, m);
  }

  const prismaTableNameToSchemas = new Map<string, string[]>();
  for (const m of prismaModels) {
    if (!prismaTableNameToSchemas.has(m.name))
      prismaTableNameToSchemas.set(m.name, []);
    prismaTableNameToSchemas.get(m.name)!.push(m.schema);
  }

  // 1. Tables missing in DB (Prisma -> DB)
  for (const model of prismaModels) {
    const key = `${model.schema}.${model.name}`;
    if (!dbTableMap.has(key)) {
      // Check if table exists under a different schema
      const otherSchemas = dbTableNameToSchemas.get(model.name);
      if (otherSchemas && otherSchemas.length > 0) {
        drifts.push({
          category: "schemaMismatch",
          severity: "critical",
          prismaSchema: model.schema,
          prismaTable: model.name,
          dbSchema: otherSchemas.join(", "),
          dbTable: model.name,
          message: `Tabela "${model.name}" existe no DB mas no schema(s): ${otherSchemas.join(", ")} (esperado: ${model.schema})`,
          recommendation: `Mover tabela "${model.name}" para o schema "${model.schema}" ou atualizar @@schema no Prisma para refletir a localizacao real.`,
        });
      } else {
        drifts.push({
          category: "tableMissingInDb",
          severity: "critical",
          prismaSchema: model.schema,
          prismaTable: model.name,
          message: `Tabela "${model.name}" definida no Prisma (schema "${model.schema}") nao existe no banco de dados.`,
          recommendation: `Executar migrate deploy ou criar a tabela "${model.name}" no schema "${model.schema}" manualmente.`,
        });
      }
    }
  }

  // 2. Tables missing in Prisma (DB -> Prisma)
  for (const table of dbTables) {
    const key = `${table.schema}.${table.name}`;
    if (!prismaModelMap.has(key)) {
      const otherSchemas = prismaTableNameToSchemas.get(table.name);
      const existsElsewhere = otherSchemas && otherSchemas.length > 0;
      if (!existsElsewhere) {
        drifts.push({
          category: "tableMissingInPrisma",
          severity: "low",
          dbSchema: table.schema,
          dbTable: table.name,
          message: `Tabela "${table.name}" no schema "${table.schema}" existe no DB mas nao esta modelada no Prisma.`,
          recommendation: `Adicionar model "${table.name}" ao schema Prisma com @@schema("${table.schema}") ou avaliar se a tabela e obsoleta e pode ser removida.`,
        });
      }
    }
  }

  // 3. Column-level comparison for matching tables
  for (const model of prismaModels) {
    const dbTable = dbTableMap.get(`${model.schema}.${model.name}`);
    if (!dbTable) continue;

    const dbColumnMap = new Map<string, DbColumn>();
    for (const col of dbTable.columns) {
      dbColumnMap.set(col.column_name, col);
    }

    const prismaColumnNames = new Set<string>();
    for (const field of model.fields) {
      prismaColumnNames.add(field.name);
      const dbCol = dbColumnMap.get(field.name);

      if (!dbCol) {
        drifts.push({
          category: "columnMissingInDb",
          severity: field.isOptional ? "medium" : "high",
          prismaSchema: model.schema,
          prismaTable: model.name,
          prismaColumn: field.name,
          prismaType:
            field.type +
            (field.isArray ? "[]" : "") +
            (field.isOptional ? "?" : ""),
          message: `Coluna "${model.name}.${field.name}" definida no Prisma nao existe no banco de dados.`,
          recommendation: `Adicionar coluna "${field.name}" (${field.type}) a tabela "${model.schema}.${model.name}" via migration.`,
        });
        continue;
      }

      // Type check
      const isEnum = isEnumType(field.type, enums);
      if (isEnum) {
        if (dbCol.udt_name !== field.type) {
          // Try case-insensitive match
          if (dbCol.udt_name.toLowerCase() !== field.type.toLowerCase()) {
            drifts.push({
              category: "typeMismatch",
              severity: "high",
              prismaSchema: model.schema,
              prismaTable: model.name,
              prismaColumn: field.name,
              prismaType: field.type,
              dbSchema: dbTable.schema,
              dbTable: dbTable.name,
              dbColumn: dbCol.column_name,
              dbType: `${dbCol.data_type} (${dbCol.udt_name})`,
              message: `Tipo enum mismatch em "${model.name}.${field.name}": Prisma=${field.type}, DB=${dbCol.udt_name}.`,
              recommendation: `Alinhar o tipo enum: recriar a coluna ou ajustar o schema Prisma.`,
            });
          }
        }
      } else {
        const expected = getExpectedDbTypes(field);
        const dbUdt = dbCol.udt_name;
        const dbData = dbCol.data_type;

        // Normalize for comparison: some types show differently
        const isMatch =
          expected.length === 0 ||
          expected.some(
            (e) =>
              e.toLowerCase() === dbUdt.toLowerCase() ||
              e.toLowerCase() === dbData.toLowerCase(),
          );

        if (!isMatch) {
          drifts.push({
            category: "typeMismatch",
            severity: "high",
            prismaSchema: model.schema,
            prismaTable: model.name,
            prismaColumn: field.name,
            prismaType:
              field.type +
              (field.dbNativeType ? ` (${field.dbNativeType})` : ""),
            dbSchema: dbTable.schema,
            dbTable: dbTable.name,
            dbColumn: dbCol.column_name,
            dbType: `${dbData} (${dbUdt})`,
            message: `Tipo mismatch em "${model.name}.${field.name}": Prisma=${field.type}${field.dbNativeType ? ` ${field.dbNativeType}` : ""}, DB=${dbData} (${dbUdt}).`,
            recommendation: `Revisar migration para alinhar o tipo da coluna "${field.name}" ou atualizar o schema Prisma.`,
          });
        }
      }

      // Nullability check
      const prismaNullable = field.isOptional || field.isArray;
      const dbNullable = dbCol.is_nullable === "YES";
      if (prismaNullable !== dbNullable) {
        drifts.push({
          category: "nullabilityMismatch",
          severity: prismaNullable && !dbNullable ? "medium" : "high",
          prismaSchema: model.schema,
          prismaTable: model.name,
          prismaColumn: field.name,
          dbSchema: dbTable.schema,
          dbTable: dbTable.name,
          dbColumn: dbCol.column_name,
          message: `Nullability mismatch em "${model.name}.${field.name}": Prisma=${prismaNullable ? "nullable" : "NOT NULL"}, DB=${dbNullable ? "nullable" : "NOT NULL"}.`,
          recommendation: prismaNullable
            ? `Tornar coluna "${field.name}" nullable no DB ou remova o '?' no Prisma.`
            : `Tornar coluna "${field.name}" NOT NULL no DB ou adicione '?' no Prisma.`,
        });
      }
    }

    // Columns in DB but missing in Prisma
    for (const dbCol of dbTable.columns) {
      if (!prismaColumnNames.has(dbCol.column_name)) {
        drifts.push({
          category: "columnMissingInPrisma",
          severity: "low",
          dbSchema: dbTable.schema,
          dbTable: dbTable.name,
          dbColumn: dbCol.column_name,
          dbType: `${dbCol.data_type} (${dbCol.udt_name})`,
          message: `Coluna "${dbTable.name}.${dbCol.column_name}" existe no DB mas nao esta modelada no Prisma.`,
          recommendation: `Adicionar campo ao model Prisma "${model.name}" ou remover a coluna se for obsoleta.`,
        });
      }
    }
  }

  const summary = {
    totalPrismaModels: prismaModels.length,
    totalPrismaScalarFields: prismaModels.reduce(
      (acc, m) => acc + m.fields.length,
      0,
    ),
    totalDbTables: dbTables.length,
    totalDbColumns: dbTables.reduce((acc, t) => acc + t.columns.length, 0),
    tablesMissingInDb: drifts.filter((d) => d.category === "tableMissingInDb")
      .length,
    tablesMissingInPrisma: drifts.filter(
      (d) => d.category === "tableMissingInPrisma",
    ).length,
    schemaMismatches: drifts.filter((d) => d.category === "schemaMismatch")
      .length,
    columnsMissingInDb: drifts.filter((d) => d.category === "columnMissingInDb")
      .length,
    columnsMissingInPrisma: drifts.filter(
      (d) => d.category === "columnMissingInPrisma",
    ).length,
    typeMismatches: drifts.filter((d) => d.category === "typeMismatch").length,
    nullabilityMismatches: drifts.filter(
      (d) => d.category === "nullabilityMismatch",
    ).length,
  };

  // Sort drifts: severity desc, then category
  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  drifts.sort((a, b) => {
    const sevDiff = severityOrder[a.severity] - severityOrder[b.severity];
    if (sevDiff !== 0) return sevDiff;
    return a.category.localeCompare(b.category);
  });

  return {
    timestamp: new Date().toISOString(),
    databaseUrl: (process.env.DATABASE_URL || "").replace(
      /\/\/[^:]+:[^@]+@/,
      "//***:***@",
    ),
    summary,
    drifts,
  };
}

// ---------------------------------------------------------------------------
// Markdown Report Generator
// ---------------------------------------------------------------------------

function generateMarkdown(report: Report): string {
  const lines: string[] = [];

  lines.push(`# Relatorio de Drift Schema — OrthoPlus Enterprise`);
  lines.push(``);
  lines.push(`**Gerado em:** ${report.timestamp}`);
  lines.push(`**Database:** ${report.databaseUrl}`);
  lines.push(``);

  // Summary
  lines.push(`## Resumo Executivo`);
  lines.push(``);
  lines.push(`| Metrica | Valor |`);
  lines.push(`|--------|-------|`);
  lines.push(`| Modelos Prisma | ${report.summary.totalPrismaModels} |`);
  lines.push(
    `| Campos escalares Prisma | ${report.summary.totalPrismaScalarFields} |`,
  );
  lines.push(`| Tabelas no DB | ${report.summary.totalDbTables} |`);
  lines.push(`| Colunas no DB | ${report.summary.totalDbColumns} |`);
  lines.push(
    `| Tabelas ausentes no DB | ${report.summary.tablesMissingInDb} |`,
  );
  lines.push(
    `| Tabelas extras no DB | ${report.summary.tablesMissingInPrisma} |`,
  );
  lines.push(`| Mismatch de schema | ${report.summary.schemaMismatches} |`);
  lines.push(
    `| Colunas ausentes no DB | ${report.summary.columnsMissingInDb} |`,
  );
  lines.push(
    `| Colunas extras no DB | ${report.summary.columnsMissingInPrisma} |`,
  );
  lines.push(`| Type mismatches | ${report.summary.typeMismatches} |`);
  lines.push(
    `| Nullability mismatches | ${report.summary.nullabilityMismatches} |`,
  );
  lines.push(``);

  // Severity summary
  const bySeverity = {
    critical: report.drifts.filter((d) => d.severity === "critical"),
    high: report.drifts.filter((d) => d.severity === "high"),
    medium: report.drifts.filter((d) => d.severity === "medium"),
    low: report.drifts.filter((d) => d.severity === "low"),
  };

  lines.push(`## Distribuicao por Severidade`);
  lines.push(``);
  lines.push(`| Severidade | Quantidade |`);
  lines.push(`|------------|------------|`);
  lines.push(`| Critical | ${bySeverity.critical.length} |`);
  lines.push(`| High | ${bySeverity.high.length} |`);
  lines.push(`| Medium | ${bySeverity.medium.length} |`);
  lines.push(`| Low | ${bySeverity.low.length} |`);
  lines.push(``);

  // Per-category sections
  const categories: DriftItem["category"][] = [
    "tableMissingInDb",
    "schemaMismatch",
    "columnMissingInDb",
    "typeMismatch",
    "nullabilityMismatch",
    "columnMissingInPrisma",
    "tableMissingInPrisma",
  ];

  const categoryTitles: Record<string, string> = {
    tableMissingInDb: "Tabelas Ausentes no Banco de Dados",
    schemaMismatch: "Mismatch de Localizacao de Schema",
    columnMissingInDb: "Colunas Ausentes no Banco de Dados",
    typeMismatch: "Mismatch de Tipo de Dado",
    nullabilityMismatch: "Mismatch de Nullability",
    columnMissingInPrisma: "Colunas Extras no Banco de Dados",
    tableMissingInPrisma: "Tabelas Extras no Banco de Dados",
  };

  for (const cat of categories) {
    const items = report.drifts.filter((d) => d.category === cat);
    if (items.length === 0) continue;
    lines.push(`## ${categoryTitles[cat]} (${items.length})`);
    lines.push(``);
    for (const item of items) {
      lines.push(
        `### ${item.prismaTable || item.dbTable}.${item.prismaColumn || item.dbColumn || ""}`,
      );
      lines.push(`- **Severidade:** ${item.severity.toUpperCase()}`);
      lines.push(`- **Mensagem:** ${item.message}`);
      lines.push(`- **Recomendacao:** ${item.recommendation}`);
      lines.push(``);
    }
  }

  // Risk Assessment
  lines.push(`## Avaliacao de Risco por Drift`);
  lines.push(``);
  lines.push(`| Drift | Risco | Justificativa |`);
  lines.push(`|-------|-------|---------------|`);
  lines.push(
    `| Tabela ausente no DB | **Critical** | Quebra funcionalidades que dependem do model. Queries falham. |`,
  );
  lines.push(
    `| Mismatch de schema | **Critical** | Prisma aponta para schema errado; queries nao encontram tabela. |`,
  );
  lines.push(
    `| Coluna obrigatoria ausente | **High** | Inserts falham por campo NOT NULL faltante. |`,
  );
  lines.push(
    `| Type mismatch | **High** | Cast errors, perda de precisao ou falhas de serializacao. |`,
  );
  lines.push(
    `| Nullability mismatch | **High/Medium** | Inconsistencia de validacao; pode causar erros em runtime. |`,
  );
  lines.push(
    `| Coluna opcional ausente | **Medium** | Funcionalidade pode ficar incompleta; nao quebra inserts. |`,
  );
  lines.push(
    `| Tabela/Coluna extra no DB | **Low** | Dead code; sem impacto direto, mas polui schema. |`,
  );
  lines.push(``);

  // Migration Plan
  lines.push(`## Plano de Migracao para Alinhamento`);
  lines.push(``);
  lines.push(
    `> **Aviso:** Este plano e uma recomendacao. Sempre faca backup e teste em staging antes de aplicar em producao.`,
  );
  lines.push(``);
  lines.push(`### Fase 1 — Preparacao (Janela de manutencao)`);
  lines.push(`1. Criar backup completo do banco de producao via pg_dump.`);
  lines.push(`2. Verificar integridade do backup.`);
  lines.push(`3. Notificar stakeholders sobre a janela de manutencao.`);
  lines.push(``);
  lines.push(`### Fase 2 — Correcoes de Schema`);
  if (report.summary.schemaMismatches > 0) {
    lines.push(
      `- Resolver mismatches de schema movendo tabelas para o schema correto (ou ajustando @@schema no Prisma).`,
    );
  }
  if (report.summary.tablesMissingInDb > 0) {
    lines.push(
      `- Criar tabelas ausentes via prisma migrate deploy ou script DDL customizado.`,
    );
  }
  if (report.summary.columnsMissingInDb > 0) {
    lines.push(`- Adicionar colunas ausentes com ALTER TABLE ... ADD COLUMN.`);
  }
  if (report.summary.typeMismatches > 0) {
    lines.push(
      `- Corrigir type mismatches com ALTER TABLE ... ALTER COLUMN TYPE (com cuidado para dados existentes).`,
    );
  }
  if (report.summary.nullabilityMismatches > 0) {
    lines.push(`- Ajustar constraints de nullability conforme necessario.`);
  }
  lines.push(``);
  lines.push(`### Fase 3 — Validacao`);
  lines.push(
    `1. Re-executar este script de diagnostico e confirmar zero drifts.`,
  );
  lines.push(`2. Rodar testes automatizados do backend.`);
  lines.push(`3. Rodar smoke tests das funcionalidades criticas.`);
  lines.push(``);
  lines.push(`### Fase 4 — Cleanup (opcional)`);
  lines.push(
    `- Avaliar remocao de tabelas e colunas marcadas como 'extras' apos validacao.`,
  );
  lines.push(``);

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const prisma = new PrismaClient();

  try {
    const schemaPath = path.join(__dirname, "..", "prisma", "schema.prisma");
    if (!fs.existsSync(schemaPath)) {
      console.error(`Schema nao encontrado: ${schemaPath}`);
      process.exit(1);
    }

    console.log("Parsing Prisma schema...");
    const { models, enums } = parsePrismaSchema(schemaPath);
    console.log(`   ${models.length} models, ${enums.size} enums encontrados.`);

    console.log("Introspecting database...");
    const dbTables = await introspectDatabase(prisma);
    console.log(
      `   ${dbTables.length} tabelas, ${dbTables.reduce((a, t) => a + t.columns.length, 0)} colunas encontradas.`,
    );

    console.log("Comparando schemas...");
    const report = compareSchemas(models, dbTables, enums);

    const totalDrifts = report.drifts.length;
    console.log(`\nResultado: ${totalDrifts} drift(s) detectado(s).`);
    console.log(
      `   - Critical: ${report.drifts.filter((d) => d.severity === "critical").length}`,
    );
    console.log(
      `   - High:     ${report.drifts.filter((d) => d.severity === "high").length}`,
    );
    console.log(
      `   - Medium:   ${report.drifts.filter((d) => d.severity === "medium").length}`,
    );
    console.log(
      `   - Low:      ${report.drifts.filter((d) => d.severity === "low").length}`,
    );

    // Write JSON
    const jsonPath = path.join(
      __dirname,
      "..",
      "scripts",
      "schema-drift-report.json",
    );
    fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));
    console.log(`\nJSON salvo em: ${jsonPath}`);

    // Write Markdown
    const mdDir = path.join(__dirname, "..", "..", "docs", "aide");
    if (!fs.existsSync(mdDir)) fs.mkdirSync(mdDir, { recursive: true });
    const mdPath = path.join(mdDir, "schema-drift-report.md");
    const mdContent = generateMarkdown(report);
    fs.writeFileSync(mdPath, mdContent);
    console.log(`Markdown salvo em: ${mdPath}`);

    if (totalDrifts === 0) {
      console.log("\nSchema esta alinhado! Nenhum drift detectado.");
    } else {
      console.log("\nDrifts detectados. Reveja o relatorio para detalhes.");
      process.exitCode = 2; // non-zero exit for CI/alerting if desired
    }
  } catch (err) {
    console.error("Erro durante diagnostico:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
