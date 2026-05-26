/**
 * Seed / validation script for search_index full-text search.
 *
 * Usage:
 *   cd backend && npx tsx scripts/seed-search-index.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding search_index test data...\n");

  // Clean up previous seed data
  await prisma.$executeRaw`
    DELETE FROM "core"."search_index"
    WHERE "clinic_id" = 'seed-clinic-search-index'
  `;

  const records = [
    {
      id: "seed-search-001",
      entity_type: "paciente",
      entity_id: "paciente-001",
      clinic_id: "seed-clinic-search-index",
      title: "Paciente João Silva",
      content: "João Silva, 35 anos, queixa de dor de dente no molar superior direito. Histórico de cárie. Tratamento indicado: restauração.",
      tokens: null,
      module: "pacientes",
    },
    {
      id: "seed-search-002",
      entity_type: "agendamento",
      entity_id: "agendamento-001",
      clinic_id: "seed-clinic-search-index",
      title: "Agendamento Consulta João Silva",
      content: "Consulta de retorno agendada para próxima semana. Paciente relatou melhora após tratamento de canal.",
      tokens: null,
      module: "agenda",
    },
    {
      id: "seed-search-003",
      entity_type: "prontuario",
      entity_id: "prontuario-001",
      clinic_id: "seed-clinic-search-index",
      title: "Prontuário Maria Oliveira",
      content: "Maria Oliveira, 28 anos, gestante, relata sensibilidade nos dentes anteriores. Exame clínico indicou gengivite leve.",
      tokens: null,
      module: "pep",
    },
  ];

  for (const rec of records) {
    await prisma.$executeRaw`
      INSERT INTO "core"."search_index" (
        "id", "entity_type", "entity_id", "clinic_id",
        "title", "content", "tokens", "module",
        "updated_at", "created_at"
      ) VALUES (
        ${rec.id}, ${rec.entity_type}, ${rec.entity_id}, ${rec.clinic_id},
        ${rec.title}, ${rec.content}, ${rec.tokens}, ${rec.module},
        NOW(), NOW()
      )
      ON CONFLICT ("id") DO UPDATE SET
        "entity_type" = EXCLUDED."entity_type",
        "entity_id"   = EXCLUDED."entity_id",
        "clinic_id"   = EXCLUDED."clinic_id",
        "title"       = EXCLUDED."title",
        "content"     = EXCLUDED."content",
        "tokens"      = EXCLUDED."tokens",
        "module"      = EXCLUDED."module",
        "updated_at"  = NOW()
    `;
    console.log(`Inserted: ${rec.title}`);
  }

  console.log("\n--- Full-text search queries ---\n");

  // Query 1: search for "dor de dente"
  const q1 = await prisma.$queryRaw`
    SELECT "id", "title", "content"
    FROM "core"."search_index"
    WHERE "content_tsv" @@ websearch_to_tsquery('portuguese', 'dor de dente')
    ORDER BY ts_rank("content_tsv", websearch_to_tsquery('portuguese', 'dor de dente')) DESC
  `;
  console.log("Query 'dor de dente':", q1);

  // Query 2: search for "gestante"
  const q2 = await prisma.$queryRaw`
    SELECT "id", "title", "content"
    FROM "core"."search_index"
    WHERE "content_tsv" @@ plainto_tsquery('portuguese', 'gestante')
    ORDER BY ts_rank("content_tsv", plainto_tsquery('portuguese', 'gestante')) DESC
  `;
  console.log("Query 'gestante':", q2);

  // Query 3: search for "canal"
  const q3 = await prisma.$queryRaw`
    SELECT "id", "title", "content"
    FROM "core"."search_index"
    WHERE "content_tsv" @@ to_tsquery('portuguese', 'canal')
    ORDER BY ts_rank("content_tsv", to_tsquery('portuguese', 'canal')) DESC
  `;
  console.log("Query 'canal':", q3);

  console.log("\nSeed & validation completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
