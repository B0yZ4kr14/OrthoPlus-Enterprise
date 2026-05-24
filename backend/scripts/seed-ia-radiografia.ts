/**
 * Seed script for IA Radiografia module testing.
 * Creates a clinic, user, patient, consent, and sample analysis.
 *
 * Usage:
 *   cd backend && npx tsx scripts/seed-ia-radiografia.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding IA Radiografia test data...\n");

  const clinic = await prisma.clinics.upsert({
    where: { id: "seed-clinic-ia-radiografia" },
    update: {},
    create: {
      id: "seed-clinic-ia-radiografia",
      name: "Clinica Teste IA Radiografia",
    },
  });
  console.log(`Clinic: ${clinic.name} (${clinic.id})`);

  const user = await prisma.users.upsert({
    where: { email: "dentista.ia@orthoplus.com" },
    update: {},
    create: {
      email: "dentista.ia@orthoplus.com",
      password_hash: "PLACEHOLDER",
      role: "DENTIST",
      clinic_id: clinic.id,
    },
  });
  console.log(`User: ${user.email} (${user.id})`);

  await prisma.profiles.upsert({
    where: { id: user.id },
    update: {},
    create: {
      id: user.id,
      app_role: "DENTIST",
      clinic_id: clinic.id,
      full_name: "Dr. Teste IA",
      is_active: true,
    },
  });
  console.log(`Profile created for ${user.email}`);

  const patient = await prisma.patients.upsert({
    where: { id: "seed-patient-ia-radiografia" },
    update: {},
    create: {
      id: "seed-patient-ia-radiografia",
      full_name: "Paciente Teste IA",
      email: "paciente.ia@example.com",
      phone_primary: "11999999999",
      birth_date: "1990-01-01",
      clinic_id: clinic.id,
    },
  });
  console.log(`Patient: ${patient.full_name} (${patient.id})`);

  const consent = await prisma.paciente_consentimento_ia.upsert({
    where: { id: "seed-consent-ia-radiografia" },
    update: {},
    create: {
      id: "seed-consent-ia-radiografia",
      paciente_id: patient.id,
      clinic_id: clinic.id,
      tipo_consentimento: "IA_RADIOGRAFIA",
      consentido: true,
      data_consentimento: new Date(),
      hash_termo: "seed-term-hash-abc123",
    },
  });
  console.log(`Consent registered: ${consent.id}`);

  const analise = await prisma.ia_radiografia_analise.create({
    data: {
      clinic_id: clinic.id,
      paciente_id: patient.id,
      dentista_id: user.id,
      imagem_hash: "seed-hash-" + Date.now(),
      imagem_storage_path: "/uploads/seed/sample.png",
      tipo_radiografia: "PANORAMICA",
      status: "CONCLUIDA",
      resultado_ia: {
        problemas: [
          { tipo: "caries", regiao: "14", severidade: "moderada" },
          { tipo: "tartaro", regiao: "inferior", severidade: "leve" },
        ],
        observacoes: "Analise de exemplo gerada pelo seed script.",
      },
      confidence_score: 0.92,
      processamento_ms: 1250,
      modelo_usado: "local/llama-3.3",
    },
  });
  console.log(`Analysis created: ${analise.id}`);

  await prisma.ia_radiografia_audit_log.create({
    data: {
      analise_id: analise.id,
      clinic_id: clinic.id,
      paciente_id: patient.id,
      dentista_id: user.id,
      acao: "ANALISAR",
      detalhes: { confidence: 0.92, processingTimeMs: 1250 },
    },
  });
  console.log(`Audit log entry created`);

  console.log("\nSeed complete!");
  console.log("\nUse these IDs for API testing:");
  console.log(`  Clinic ID:    ${clinic.id}`);
  console.log(`  User ID:      ${user.id}`);
  console.log(`  Patient ID:   ${patient.id}`);
  console.log(`  Analysis ID:  ${analise.id}`);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
