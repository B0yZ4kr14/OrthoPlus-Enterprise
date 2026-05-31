import { Request, Response } from "express";
import { asyncHandler, Errors } from "@/middleware/errorHandler";
import { eventBus } from "@/shared/events/EventBus";
import { ProntuarioCreatedEvent } from "@/modules/pep/domain/events/ProntuarioCreatedEvent";
import { ProntuarioUpdatedEvent } from "@/modules/pep/domain/events/ProntuarioUpdatedEvent";
import { ProntuarioDeletedEvent } from "@/modules/pep/domain/events/ProntuarioDeletedEvent";
import { TratamentoCreatedEvent } from "@/modules/pep/domain/events/TratamentoCreatedEvent";
import { TratamentoUpdatedEvent } from "@/modules/pep/domain/events/TratamentoUpdatedEvent";
import { TratamentoDeletedEvent } from "@/modules/pep/domain/events/TratamentoDeletedEvent";
import { IPepRepository } from "@/modules/pep/domain/repositories/IPepRepository";
import { PepRepository } from "@/modules/pep/infrastructure/PepRepository";
import { logger } from "@/infrastructure/logger";
import {
  createProntuarioSchema,
  odontogramaCreateSchema,
  odontogramaHistoryCreateSchema,
  odontogramaUpdateSchema,
} from "./schemas";

export class PepController {
  constructor(private repo: IPepRepository = new PepRepository()) {}

  // -------------------------------------------------------------------------
  // Prontuarios
  // -------------------------------------------------------------------------

  createProntuario = asyncHandler(async (req: Request, res: Response) => {
    const parsed = createProntuarioSchema.safeParse(req.body);
    if (!parsed.success) {
      throw Errors.validation("Invalid input", parsed.error.errors as any);
    }

    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Clinic ID not found in token");
    }

    const prontuario = await this.repo.createProntuario({
      clinic_id: clinicId,
      patient_id: parsed.data.patientId,
      patient_name: `Paciente ${parsed.data.patientId}`,
      created_by: req.user?.id || "system",
    });

    eventBus
      .publish(
        new ProntuarioCreatedEvent(
          (prontuario as any).id,
          clinicId,
          parsed.data.patientId,
        ),
      )
      .catch((err) => logger.error("EventBus publish failed", { error: err }));

    logger.info("Prontuario created", {
      clinicId,
      patientId: parsed.data.patientId,
      prontuarioId: (prontuario as any).id,
    });

    res
      .status(201)
      .json({ message: "Prontuario created successfully", prontuario });
  });

  listProntuariosByPatient = asyncHandler(
    async (req: Request, res: Response) => {
      const { patientId } = req.params;
      const clinicId = req.user?.clinicId;

      if (!clinicId) {
        throw Errors.unauthorized("Clinic ID not found in token");
      }

      const prontuarios = await this.repo.findProntuariosByPatientAndClinic(
        patientId,
        clinicId,
      );

      logger.info("Listing prontuarios", { clinicId, patientId });
      res.status(200).json({ prontuarios });
    },
  );

  assinarDigitalmente = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { hash } = req.body;

    if (!hash) {
      throw Errors.validation("Hash is required");
    }

    const assinatura = await this.repo.createAssinatura({
      prontuario_id: id,
      assinatura_base64: hash,
      signed_at: new Date().toISOString(),
      signed_by: req.user?.id || "system",
      tipo_documento: "PRONTUARIO_EVOLUCAO",
      ip_address: req.ip || "",
      user_agent: req.headers["user-agent"] || "",
    });

    logger.info("Prontuario digitally signed", {
      id,
      assinaturaId: (assinatura as any).id,
    });
    res
      .status(200)
      .json({ message: "Prontuario signed successfully", assinatura });
  });

  updateProntuario = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }

    const existing = await this.repo.findProntuarioByIdAndClinic(
      req.params.id,
      clinicId,
    );
    if (!existing) {
      throw Errors.notFound("Prontuario", req.params.id);
    }

    const data = await this.repo.updateProntuario(req.params.id, req.body);

    eventBus
      .publish(new ProntuarioUpdatedEvent(req.params.id, clinicId))
      .catch((err) => logger.error("EventBus publish failed", { error: err }));

    res.json(data);
  });

  deleteProntuario = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }

    const existing = await this.repo.findProntuarioByIdAndClinic(
      req.params.id,
      clinicId,
    );
    if (!existing) {
      throw Errors.notFound("Prontuario", req.params.id);
    }

    await this.repo.deleteProntuario(req.params.id, clinicId);

    eventBus
      .publish(new ProntuarioDeletedEvent(req.params.id, clinicId))
      .catch((err) => logger.error("EventBus publish failed", { error: err }));

    res.status(204).send();
  });

  // -------------------------------------------------------------------------
  // Odontogramas
  // -------------------------------------------------------------------------

  getOdontogramaByPatient = asyncHandler(
    async (req: Request, res: Response) => {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        throw Errors.unauthorized("Missing clinic context");
      }

      const data = await this.repo.findOdontogramaByPatient(
        req.params.patientId,
        clinicId,
      );
      if (!data) {
        throw Errors.notFound("Odontograma for this patient");
      }

      res.json(data);
    },
  );

  getOdontogramaById = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }

    const data = await this.repo.findOdontogramaById(req.params.id, clinicId);
    if (!data) {
      throw Errors.notFound("Odontograma", req.params.id);
    }

    res.json(data);
  });

  upsertOdontograma = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }

    const parsed = odontogramaCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      throw Errors.validation("Invalid input", parsed.error.errors as any);
    }

    const existing = await this.repo.findOdontogramaByPatientAndClinic(
      parsed.data.patient_id,
      clinicId,
    );

    let data;
    if (existing) {
      data = await this.repo.updateOdontograma((existing as any).id, {
        odontograma_data: parsed.data.odontograma_data,
        observacoes: parsed.data.observacoes,
      });
    } else {
      data = await this.repo.createOdontograma({
        ...parsed.data,
        clinic_id: clinicId,
      });
    }

    await this.repo.createOdontogramaHistory({
      patient_id: parsed.data.patient_id,
      clinic_id: clinicId,
      odontograma_data: parsed.data.odontograma_data,
      observacoes: parsed.data.observacoes,
    });

    res.status(existing ? 200 : 201).json(data);
  });

  updateOdontograma = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }

    const existing = await this.repo.findOdontogramaById(
      req.params.id,
      clinicId,
    );
    if (!existing) {
      throw Errors.notFound("Odontograma", req.params.id);
    }

    const parsed = odontogramaUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      throw Errors.validation("Invalid input", parsed.error.errors as any);
    }

    const data = await this.repo.updateOdontograma(req.params.id, parsed.data);
    res.json(data);
  });

  deleteOdontograma = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }

    const existing = await this.repo.findOdontogramaById(
      req.params.id,
      clinicId,
    );
    if (!existing) {
      throw Errors.notFound("Odontograma", req.params.id);
    }

    await this.repo.deleteOdontograma(req.params.id, clinicId);
    res.status(204).send();
  });

  // -------------------------------------------------------------------------
  // Odontograma history
  // -------------------------------------------------------------------------

  getOdontogramaHistory = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }

    const { prontuario_id, patient_id } = req.query;
    const prontuarioFilter = prontuario_id || patient_id;
    const where: Record<string, unknown> = {};
    if (prontuarioFilter) where.prontuario_id = String(prontuarioFilter);

    const data = await this.repo.findOdontogramaHistory(where);
    res.json(data);
  });

  createOdontogramaHistory = asyncHandler(
    async (req: Request, res: Response) => {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        throw Errors.unauthorized("Missing clinic context");
      }

      const parsed = odontogramaHistoryCreateSchema.safeParse(req.body);
      if (!parsed.success) {
        throw Errors.validation("Invalid input", parsed.error.errors as any);
      }

      const data = await this.repo.createOdontogramaHistory({
        ...parsed.data,
        clinic_id: clinicId,
      });

      res.status(201).json(data);
    },
  );

  // -------------------------------------------------------------------------
  // Anexos
  // -------------------------------------------------------------------------

  createAnexo = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }

    const data = await this.repo.createAnexo({
      ...req.body,
      clinic_id: clinicId,
    });
    res.status(201).json(data);
  });

  updateAnexo = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }

    const data = await this.repo.updateAnexo(req.params.id, req.body);
    res.json(data);
  });

  deleteAnexo = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }

    await this.repo.deleteAnexo(req.params.id, clinicId);
    res.status(204).send();
  });

  // -------------------------------------------------------------------------
  // Evolucoes
  // -------------------------------------------------------------------------

  createEvolucao = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }

    const data = await this.repo.createEvolucao({
      ...req.body,
      created_by: req.user?.id || "system",
    });
    res.status(201).json(data);
  });

  updateEvolucao = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }

    const data = await this.repo.updateEvolucao(req.params.id, req.body);
    res.json(data);
  });

  deleteEvolucao = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }

    await this.repo.deleteEvolucao(req.params.id, clinicId);
    res.status(204).send();
  });

  // -------------------------------------------------------------------------
  // Tratamentos
  // -------------------------------------------------------------------------

  listTratamentos = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }

    const { prontuario_id, status } = req.query;
    const where: Record<string, unknown> = {};
    if (prontuario_id) where.prontuario_id = String(prontuario_id);
    if (status) where.status = String(status);

    const data = await this.repo.findManyTratamentos(where);
    res.json(data);
  });

  getTratamentoById = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }

    const data = await this.repo.findTratamentoById(req.params.id);
    if (!data) {
      throw Errors.notFound("Tratamento", req.params.id);
    }

    res.json(data);
  });

  createTratamento = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }

    const data = await this.repo.createTratamento({
      ...req.body,
      created_by: req.user?.id || "system",
    });

    eventBus
      .publish(
        new TratamentoCreatedEvent(
          (data as any).id,
          (data as any).prontuario_id,
          clinicId,
        ),
      )
      .catch((err) => logger.error("EventBus publish failed", { error: err }));

    res.status(201).json(data);
  });

  updateTratamento = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }

    const existing = await this.repo.findTratamentoById(req.params.id);
    if (!existing) {
      throw Errors.notFound("Tratamento", req.params.id);
    }

    const data = await this.repo.updateTratamento(req.params.id, req.body);

    eventBus
      .publish(
        new TratamentoUpdatedEvent(
          req.params.id,
          (existing as any).prontuario_id,
          clinicId,
        ),
      )
      .catch((err) => logger.error("EventBus publish failed", { error: err }));

    res.json(data);
  });

  deleteTratamento = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }

    const existing = await this.repo.findTratamentoById(req.params.id);
    if (!existing) {
      throw Errors.notFound("Tratamento", req.params.id);
    }

    await this.repo.deleteTratamento(req.params.id, clinicId);

    eventBus
      .publish(
        new TratamentoDeletedEvent(
          req.params.id,
          (existing as any).prontuario_id,
          clinicId,
        ),
      )
      .catch((err) => logger.error("EventBus publish failed", { error: err }));

    res.status(204).send();
  });

  // -------------------------------------------------------------------------
  // Odontograma data
  // -------------------------------------------------------------------------

  upsertOdontogramaDataTooth = asyncHandler(
    async (req: Request, res: Response) => {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        throw Errors.unauthorized("Missing clinic context");
      }

      const {
        prontuario_id,
        tooth_number,
        status: toothStatus,
        notes,
      } = req.body;

      const existing = await this.repo.findOdontogramaDataByTooth(
        prontuario_id,
        tooth_number,
      );

      let data;
      if (existing) {
        data = await this.repo.updateOdontogramaData((existing as any).id, {
          status: toothStatus,
          notes,
          updated_by: req.user?.id || "system",
        });
      } else {
        data = await this.repo.createOdontogramaData({
          prontuario_id,
          tooth_number,
          status: toothStatus,
          notes,
          created_by: req.user?.id || "system",
        });
      }

      res.json(data);
    },
  );

  upsertOdontogramaDataSurface = asyncHandler(
    async (req: Request, res: Response) => {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        throw Errors.unauthorized("Missing clinic context");
      }

      const { odontograma_data_id, surface, status: surfaceStatus } = req.body;

      const existing =
        await this.repo.findToothSurfaceByOdontogramaDataAndSurface(
          odontograma_data_id,
          surface,
        );

      let data;
      if (existing) {
        data = await this.repo.updateToothSurface((existing as any).id, {
          status: surfaceStatus,
        });
      } else {
        data = await this.repo.createToothSurface({
          odontograma_data_id,
          surface,
          status: surfaceStatus,
        });
      }

      res.json(data);
    },
  );

  deleteOdontogramaData = asyncHandler(async (req: Request, res: Response) => {
    const clinicId = req.user?.clinicId;
    if (!clinicId) {
      throw Errors.unauthorized("Missing clinic context");
    }

    const { id } = req.body;
    await this.repo.deleteOdontogramaData(id, clinicId);
    res.status(204).send();
  });
}
