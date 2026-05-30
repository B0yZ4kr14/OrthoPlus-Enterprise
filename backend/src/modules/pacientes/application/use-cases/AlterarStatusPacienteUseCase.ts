/**
 * AlterarStatusPacienteUseCase - Altera status do paciente
 *
 * Use Case que orquestra mudança de status com validações,
 * histórico e eventos.
 */

import { Errors } from "@/middleware/errorHandler";
import { IPatientRepository } from "../../domain/repositories/IPatientRepository";
import { PatientStatus } from "../../domain/value-objects/PatientStatus";
import { eventBus } from "@/shared/events/EventBus";
import { PatientUpdatedEvent } from "../../domain/events/PatientUpdatedEvent";
import { logger } from "@/infrastructure/logger";
import { pacientesMetrics } from "@/infrastructure/metrics/PacientesMetrics";

export interface AlterarStatusPacienteDTO {
  patientId: string;
  clinicId: string;
  novoStatusCode: string;
  reason: string;
  changedBy: string;
  metadata?: Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export class AlterarStatusPacienteUseCase {
  constructor(private patientRepository: IPatientRepository) {}

  async execute(dto: AlterarStatusPacienteDTO): Promise<void> {
    logger.info("AlterarStatusPacienteUseCase: Starting", {
      patientId: dto.patientId,
      novoStatus: dto.novoStatusCode,
    });

    // Buscar paciente
    const patient = await this.patientRepository.findById(
      dto.patientId,
      dto.clinicId,
    );

    if (!patient) {
      throw Errors.notFound("Paciente");
    }

    if (!patient.isActive) {
      throw Errors.validation(
        "Não é possível alterar status de paciente inativo",
      );
    }

    // Validar novo status
    const novoStatus = PatientStatus.fromCode(dto.novoStatusCode);
    const statusAnterior = patient.status;

    // Business rule: Alterar status (validação de transição dentro do aggregate)
    patient.alterarStatus(novoStatus, dto.reason, dto.changedBy);

    // Persistir mudança
    await this.patientRepository.update(patient);

    // Registrar no histórico
    await this.patientRepository.saveStatusHistory(
      dto.patientId,
      statusAnterior.code,
      novoStatus.code,
      dto.reason,
      dto.changedBy,
      dto.metadata,
    );

    // Atualizar métricas: decrementar status anterior, incrementar novo (TD004)
    pacientesMetrics.decPatientsTotal(statusAnterior.code, dto.clinicId);
    pacientesMetrics.incPatientsTotal(novoStatus.code, dto.clinicId);

    // Publicar eventos de domínio em paralelo
    const events = patient.getDomainEvents();
    await Promise.all([
      eventBus.publish(new PatientUpdatedEvent(patient.id, dto.clinicId)),
      ...events.map((event) => eventBus.publish(event)),
    ]);
    patient.clearDomainEvents();

    logger.info("AlterarStatusPacienteUseCase: Success", {
      patientId: dto.patientId,
      fromStatus: statusAnterior.code,
      toStatus: novoStatus.code,
    });
  }
}
