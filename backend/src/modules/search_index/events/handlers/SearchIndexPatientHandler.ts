import { EventHandler } from "@/shared/events/EventHandler";
import { DomainEvent } from "@/shared/events/DomainEvent";
import { PatientCreatedEvent } from "@/modules/pacientes/domain/events/PatientCreatedEvent";
import { PatientUpdatedEvent } from "@/modules/pacientes/domain/events/PatientUpdatedEvent";
import { PatientDeletedEvent } from "@/modules/pacientes/domain/events/PatientDeletedEvent";
import { prisma } from "@/infrastructure/database/prismaClient";
import { logger } from "@/infrastructure/logger";
import { PatientSearchIndexEntry } from "@/modules/search_index/services/PacienteIndexer";

export class SearchIndexPatientHandler implements EventHandler<DomainEvent> {
  private readonly entityType = "paciente";
  private readonly module = "pacientes";

  async handle(event: DomainEvent): Promise<void> {
    try {
      const patientEvent = event as
        | PatientCreatedEvent
        | PatientUpdatedEvent
        | PatientDeletedEvent;
      const { patientId } = patientEvent;

      if (event.eventType === "Pacientes.PatientDeleted") {
        await prisma.search_index.deleteMany({
          where: {
            entity_type: this.entityType,
            entity_id: patientId,
          },
        });

        logger.debug("SearchIndex: paciente removido do índice", {
          patientId,
        });
        return;
      }

      const patient = await prisma.patients.findUnique({
        where: { id: patientId },
      });

      if (!patient) {
        logger.warn("SearchIndex: paciente não encontrado para indexação", {
          patientId,
        });
        return;
      }

      const entry = this.toEntry(patient);

      await prisma.search_index.deleteMany({
        where: {
          entity_type: this.entityType,
          entity_id: patientId,
        },
      });

      await prisma.search_index.create({
        data: entry as unknown as Parameters<
          typeof prisma.search_index.create
        >[0]["data"],
      });

      logger.debug("SearchIndex: paciente indexado com sucesso", {
        patientId,
        eventType: event.eventType,
      });
    } catch (error) {
      logger.error("SearchIndex: erro ao processar evento de paciente", {
        error,
        eventType: event.eventType,
        aggregateId: event.aggregateId,
      });
    }
  }

  private toEntry(p: {
    id: string;
    clinic_id: string;
    full_name: string;
    cpf: string | null;
    email: string | null;
    phone_primary: string | null;
    phone_secondary: string | null;
    phone_emergency: string | null;
    clinical_observations: string | null;
  }): PatientSearchIndexEntry {
    const contentParts = [
      p.full_name,
      p.cpf,
      p.email,
      p.phone_primary,
      p.phone_secondary,
      p.phone_emergency,
      p.clinical_observations,
    ].filter(Boolean);

    return {
      entity_type: this.entityType,
      entity_id: p.id,
      clinic_id: p.clinic_id,
      title: p.full_name,
      content: contentParts.join(" "),
      module: this.module,
    };
  }
}
