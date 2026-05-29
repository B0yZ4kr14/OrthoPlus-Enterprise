#!/usr/bin/env tsx
import { PrismaClient } from "@prisma/client";
import { PepIndexer } from "../services/PepIndexer";

const prisma = new PrismaClient();
const indexer = new PepIndexer(prisma);

function parseArgs(): { force?: boolean; since?: Date } {
  const args = process.argv.slice(2);
  const force = args.includes("--force");
  const sinceFlag = args.find((arg) => arg.startsWith("--since="));
  const since = sinceFlag ? new Date(sinceFlag.split("=")[1]) : undefined;
  return { force, since };
}

async function main() {
  const { force, since } = parseArgs();

  if (force && since) {
    console.error("[CLI] Erro: --force e --since sao mutuamente exclusivos.");
    process.exit(1);
  }

  try {
    if (force) {
      console.log(
        "[CLI] Iniciando reindexacao completa de prontuarios (PEP)...",
      );
      const result = await indexer.fullReindex(true);
      console.log("[CLI] Reindexacao completa finalizada.");
      console.log(
        `[CLI] Indexados: ${result.indexed} | Duracao: ${result.durationMs}ms`,
      );
    } else if (since) {
      console.log(
        `[CLI] Iniciando reindexacao incremental desde ${since.toISOString()}...`,
      );
      const result = await indexer.incremental(since);
      console.log("[CLI] Reindexacao incremental finalizada.");
      console.log(
        `[CLI] Indexados: ${result.indexed} | Duracao: ${result.durationMs}ms`,
      );
    } else {
      console.error("[CLI] Erro: Especifique --force ou --since=<ISO_DATE>");
      console.error("[CLI] Uso: tsx reindex-pep.ts --force");
      console.error(
        "[CLI] Uso: tsx reindex-pep.ts --since=2024-01-01T00:00:00Z",
      );
      process.exit(1);
    }
  } catch (err) {
    console.error("[CLI] Erro durante reindexacao:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
