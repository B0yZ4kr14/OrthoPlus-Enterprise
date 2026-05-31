import { logger } from "@/infrastructure/logger";
import { Errors } from "@/middleware/errorHandler";
import { ITeleodontoRepository } from "@/modules/teleodonto/domain/repositories/ITeleodontoRepository";

import { TeleodontoRepository } from "@/modules/teleodonto/infrastructure/TeleodontoRepository";

export interface CreateTeleconsultaInput {
  titulo: string;
  motivo: string;
  tipo: string;
  data_agendada: string;
  patient_id: string;
  dentist_id: string;
  link_sala?: string;
  duracao_minutos?: number;
  status?: string;
  observacoes?: string;
}

export interface UpdateTeleconsultaInput {
  titulo?: string;
  motivo?: string;
  tipo?: string;
  data_agendada?: string;
  patient_id?: string;
  dentist_id?: string;
  link_sala?: string;
  duracao_minutos?: number;
  status?: string;
  observacoes?: string;
}

export interface StartSessionInput {
  teleconsulta_id: string;
}

export interface EndSessionInput {
  teleconsulta_id: string;
  duration_minutes: number;
  notes?: string;
}

export interface AddNotesInput {
  teleconsulta_id: string;
  notes: string;
  diagnosis?: string;
  recommendations?: string;
}

export interface AddPrescriptionInput {
  teleconsulta_id: string;
  patient_id: string;
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
  }>;
  observations?: string;
}

export class TeleodontoService {
  private repo: ITeleodontoRepository;

  constructor(repo?: ITeleodontoRepository) {
    this.repo = repo ?? new TeleodontoRepository();
  }

  async listTeleconsultas(
    clinicId: string,
    filters?: { status?: string; dentist_id?: string },
  ) {
    const where: Record<string, unknown> = { clinic_id: clinicId };
    if (filters?.status) where.status = filters.status;
    if (filters?.dentist_id) where.dentist_id = filters.dentist_id;

    return this.repo.listTeleconsultas(clinicId);
  }

  async getById(id: string, clinicId: string) {
    const data = await this.repo.getTeleconsultaById(id, clinicId);
    if (!data) {
      throw Errors.notFound("Teleconsulta", id);
    }
    return data;
  }

  async create(
    input: CreateTeleconsultaInput,
    clinicId: string,
    userId?: string,
  ) {
    return this.repo.createTeleconsulta({
      ...input,
      clinic_id: clinicId,
      status: input.status || "AGENDADO",
      created_by: userId || "system",
    });
  }

  async update(id: string, input: UpdateTeleconsultaInput, clinicId: string) {
    await this.getById(id, clinicId);
    return this.repo.updateTeleconsulta(id, clinicId, input);
  }

  async delete(id: string, clinicId: string) {
    await this.getById(id, clinicId);
    return this.repo.deleteTeleconsultasByIdAndClinic(id, clinicId);
  }

  async startSession(input: StartSessionInput, clinicId: string) {
    await this.getById(input.teleconsulta_id, clinicId);

    const data = await this.repo.updateTeleconsulta(input.teleconsulta_id, clinicId, {
      status: "EM_ANDAMENTO",
      data_iniciada: new Date().toISOString(),
    });

    logger.info("Teleconsulta session started", {
      clinicId,
      teleconsultaId: input.teleconsulta_id,
    });

    return data;
  }

  async endSession(input: EndSessionInput, clinicId: string) {
    await this.getById(input.teleconsulta_id, clinicId);

    const updateData: Record<string, unknown> = {
      status: "CONCLUIDO",
      data_finalizada: new Date().toISOString(),
      duracao_minutos: input.duration_minutes,
    };
    if (input.notes) {
      updateData.observacoes = input.notes;
    }

    const data = await this.repo.updateTeleconsulta(
      input.teleconsulta_id,
      clinicId,
      updateData,
    );

    logger.info("Teleconsulta session ended", {
      clinicId,
      teleconsultaId: input.teleconsulta_id,
      durationMinutes: input.duration_minutes,
    });

    return data;
  }

  async addNotes(input: AddNotesInput, clinicId: string) {
    await this.getById(input.teleconsulta_id, clinicId);

    return this.repo.updateTeleconsulta(input.teleconsulta_id, clinicId, {
      observacoes: input.notes,
      diagnostico: input.diagnosis,
      conduta: input.recommendations,
    });
  }

  async addPrescription(
    input: AddPrescriptionInput,
    clinicId: string,
    userId?: string,
  ) {
    await this.getById(input.teleconsulta_id, clinicId);

    const prescription = {
      prescribed_at: new Date().toISOString(),
      prescribed_by: userId,
      patient_id: input.patient_id,
      medications: input.medications,
      observations: input.observations,
    };

    const data = await this.repo.updateTeleconsulta(input.teleconsulta_id, clinicId, {
      prescricao: JSON.stringify(prescription),
    });

    logger.info("Prescription added to teleconsulta", {
      clinicId,
      teleconsultaId: input.teleconsulta_id,
      medicationsCount: input.medications.length,
    });

    return { data, prescription };
  }
}
