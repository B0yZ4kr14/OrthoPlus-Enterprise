/**
 * LGPD Purge Script - Implementação do Direito ao Esquecimento
 *
 * Art. 18, inciso VI da LGPD: Direito à eliminação dos dados pessoais
 *
 * Uso:
 *   npm run lgpd:purge -- --patientId=<id>
 *   npm run lgpd:purge -- --clinicId=<id> --days=365
 *
 * Atenção: Este script deve ser executado com EXTREMA CAUTELA
 */

import { PrismaClient } from "@prisma/client";
import { logger } from "../infrastructure/logger";

const prisma = new PrismaClient();

interface PurgeOptions {
  patientId?: string;
  clinicId?: string;
  days?: number;
  dryRun?: boolean;
}

/**
 * Anonimiza dados de um paciente (soft delete LGPD)
 */
async function anonymizePatient(
  patientId: string,
  dryRun: boolean = false,
): Promise<void> {
  logger.info(`LGPD PURGE: Starting anonymization for patient ${patientId}`, {
    dryRun,
  });

  if (dryRun) {
    logger.info("[DRY RUN] Would anonymize patient data");
    return;
  }

  try {
    // 1. Anonimizar dados principais do paciente
    await prisma.patients.update({
      where: { id: patientId },
      data: {
        full_name: "ANONIMIZADO",
        email: `anonimizado_${patientId.slice(0, 8)}@deleted.local`,
        phone_primary: "00000000000",
        phone_secondary: null,
        phone_emergency: null,
        cpf: "00000000000",
        rg: null,
        address_street: null,
        address_number: null,
        address_complement: null,
        address_neighborhood: null,
        address_city: null,
        address_state: null,
        address_zipcode: null,
        address_country: null,
        birth_date: "1900-01-01",
        status: "ANONIMIZADO",
      },
    });

    // 2. Anonimizar prontuários (PEP) - atualiza apenas patient_name
    await prisma.prontuarios.updateMany({
      where: { patient_id: patientId },
      data: {
        patient_name: "ANONIMIZADO",
      },
    });

    // 3. Anonimizar agendamentos
    await prisma.appointments.updateMany({
      where: { patient_id: patientId },
      data: {
        description: "[ANONIMIZADO - LGPD]",
        title: "ANONIMIZADO",
      },
    });

    // 4. Registrar log de purge
    logger.info(`LGPD PURGE: Successfully anonymized patient ${patientId}`);
  } catch (error) {
    logger.error(`LGPD PURGE: Error anonymizing patient ${patientId}`, {
      error,
    });
    throw error;
  }
}

/**
 * Main function
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const options: PurgeOptions = {
    dryRun: args.includes("--dry-run"),
  };

  // Parse arguments
  args.forEach((arg) => {
    if (arg.startsWith("--patientId=")) {
      options.patientId = arg.split("=")[1];
    }
    if (arg.startsWith("--clinicId=")) {
      options.clinicId = arg.split("=")[1];
    }
    if (arg.startsWith("--days=")) {
      options.days = parseInt(arg.split("=")[1], 10);
    }
  });

  try {
    if (options.patientId) {
      await anonymizePatient(options.patientId, options.dryRun);
    } else {
      console.error(
        "Usage: npx ts-node src/scripts/lgpd-purge.ts --patientId=<id> [--dry-run]",
      );
      process.exit(1);
    }

    console.log("✅ LGPD purge completed successfully");
  } catch (error) {
    console.error("❌ LGPD purge failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
