import { Request, Response } from "express";
import { Errors, ApiError, ErrorCodes } from "@/middleware/errorHandler";
import { IAConsentimentoService } from "../domain/services/IAConsentimentoService";
import { IAAuditService } from "../domain/services/IAAuditService";
import { IAEncryptionService } from "../domain/services/IAEncryptionService";
import { DicomMetadataStripper } from "../domain/services/DicomMetadataStripper";
import { IIARadiografiaRepository } from "../domain/repositories/IIARadiografiaRepository";
import { IARadiografiaRepository } from "../infrastructure/IARadiografiaRepository";

import { AcaoAuditIA, TipoRadiografia } from "@prisma/client";
import { getMetricsCollector } from "@/infrastructure/metrics/MetricsCollector";
import { prometheusMetrics } from "@/infrastructure/metrics/PrometheusMetrics";
import { iaRadiografiaQueue } from "@/workers/iaRadiografiaWorker";
import crypto from "crypto";
import fs from "fs";
import path from "path";

const metrics = getMetricsCollector(prometheusMetrics.getRegistry());

const consentimentoService = new IAConsentimentoService();
const auditService = new IAAuditService();
const encryptionService = new IAEncryptionService();
const stripper = new DicomMetadataStripper();

export class IARadiografiaController {
  constructor(
    private repo: IIARadiografiaRepository = new IARadiografiaRepository(),
  ) {}

  /**
   * POST /ia-radiografia/upload-e-analisar
   */
  async uploadEAnalisar(req: Request, res: Response) {
    const clinicId = req.clinicId as string;
    const dentistaId = req.user?.id as string;
    const { patient_id, prontuario_id, tipo_radiografia } = req.body;

    if (!req.file) {
      throw Errors.validation("Nenhuma imagem enviada");
    }

    // 1. Verificar consentimento LGPD
    const temConsentimento = await consentimentoService.verificarConsentimento(
      patient_id,
      clinicId,
    );
    if (!temConsentimento) {
      throw new ApiError(
        403,
        ErrorCodes.FORBIDDEN,
        "Forbidden",
        "Consentimento LGPD necessario",
      );
    }

    // 2. Strip metadados DICOM/EXIF
    const { cleanBuffer, originalHash, cleanHash } = await stripper.strip(
      req.file.buffer,
    );
    const piiCheck = await stripper.validateNoPII(cleanBuffer);
    if (!piiCheck) {
      throw Errors.validation("Imagem contem possiveis metadados PII");
    }

    // 3. Salvar arquivo em storage local
    const storageDir = path.join(
      process.cwd(),
      "uploads",
      "ia-radiografia",
      clinicId,
      patient_id,
    );
    fs.mkdirSync(storageDir, { recursive: true });
    const storageFileName = `${Date.now()}.png`;
    const storagePath = path.join(storageDir, storageFileName);
    fs.writeFileSync(storagePath, cleanBuffer);

    // 4. Criar registro de analise
    const analise = await this.repo.createAnalise({
      clinic_id: clinicId,
      paciente_id: patient_id,
      prontuario_id: prontuario_id || null,
      dentista_id: dentistaId,
      imagem_hash: originalHash,
      imagem_storage_path: `uploads/ia-radiografia/${clinicId}/${patient_id}/${storageFileName}`,
      tipo_radiografia: tipo_radiografia as TipoRadiografia,
      status: "PENDENTE",
      modelo_usado: process.env.AI_LOCAL_MODEL || "local/llama-3.3",
    });

    // 5. Audit log
    await auditService.registrarAcao({
      analiseId: analise.id,
      clinicId,
      pacienteId: patient_id,
      dentistaId,
      acao: AcaoAuditIA.UPLOAD,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      detalhes: { originalHash, cleanHash, tipoRadiografia: tipo_radiografia },
    });

    // 5.1 Metrics
    metrics.iaRadiografia.uploadsTotal.inc({
      category: "pep",
      tipo_radiografia: tipo_radiografia as string,
      status: "success",
    });

    // 6. Enfileirar analise IA para worker async
    await iaRadiografiaQueue.add(
      "analyze",
      {
        analiseId: analise.id,
        storagePath,
        tipoRadiografia: tipo_radiografia as string,
      },
      {
        delay: 0,
        attempts: 2,
        backoff: { type: "exponential", delay: 5000 },
      },
    );

    res.status(202).json({
      id: analise.id,
      status: "PENDENTE",
      message: "Analise enfileirada para processamento",
    });
  }

  /**
   * GET /ia-radiografia/analises
   */
  async listarAnalises(req: Request, res: Response) {
    const clinicId = req.clinicId as string;
    const analises = await this.repo.findAnalisesByClinic(clinicId);
    res.json(analises);
  }

  /**
   * GET /ia-radiografia/analises/:id
   */
  async obterAnalise(req: Request, res: Response) {
    const clinicId = req.clinicId as string;
    const dentistaId = req.user?.id as string;
    const { id } = req.params;

    const analise = await this.repo.findAnaliseById(id, clinicId);

    if (!analise) {
      throw Errors.notFound("Analise", id);
    }

    // Descriptografar resultado se existir
    let resultadoDecriptado = null;
    if (analise.resultado_ia) {
      const encrypted = analise.resultado_ia as {
        iv: string;
        ciphertext: string;
        tag: string;
      };
      resultadoDecriptado = encryptionService.decrypt(encrypted, analise.id);
    }

    // Audit log
    await auditService.registrarAcao({
      analiseId: analise.id,
      clinicId,
      pacienteId: analise.paciente_id,
      dentistaId,
      acao: AcaoAuditIA.VISUALIZAR,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    res.json({
      ...analise,
      resultado_ia: resultadoDecriptado,
    });
  }

  /**
   * GET /ia-radiografia/analises/:id/audit
   */
  async obterAuditoriaAnalise(req: Request, res: Response) {
    const clinicId = req.clinicId as string;
    const { id } = req.params;

    const analise = await this.repo.findAnaliseById(id, clinicId);

    if (!analise) {
      throw Errors.notFound("Analise", id);
    }

    const auditoria = await auditService.obterAuditoriaPorAnalise(id);

    res.json(auditoria);
  }

  /**
   * PATCH /ia-radiografia/analises/:id/revisar
   */
  async revisarAnalise(req: Request, res: Response) {
    const clinicId = req.clinicId as string;
    const dentistaRevisorId = req.user?.id as string;
    const { id } = req.params;
    const { observacoes_dentista, assinatura_digital } = req.body;

    if (!observacoes_dentista || !assinatura_digital) {
      throw Errors.validation(
        "Observacoes e assinatura digital sao obrigatorias",
      );
    }

    const analise = await this.repo.findAnaliseById(id, clinicId);

    if (!analise) {
      throw Errors.notFound("Analise", id);
    }

    // Hash da assinatura para auditoria
    const assinaturaHash = crypto
      .createHash("sha256")
      .update(assinatura_digital)
      .digest("hex");

    await this.repo.updateAnalise(id, clinicId, {
      revisada: true,
      dentista_revisor_id: dentistaRevisorId,
      observacoes_dentista,
      assinatura_digital: assinaturaHash,
    });

    await auditService.registrarAcao({
      analiseId: analise.id,
      clinicId,
      pacienteId: analise.paciente_id,
      dentistaId: dentistaRevisorId,
      acao: AcaoAuditIA.REVISAR,
      detalhes: { assinaturaHash },
    });

    metrics.iaRadiografia.reviewsTotal.inc({ category: "pep" });

    res.json({ message: "Analise revisada com sucesso" });
  }

  /**
   * POST /ia-radiografia/consentimento
   */
  async registrarConsentimento(req: Request, res: Response) {
    const clinicId = req.clinicId as string;
    const { paciente_id, consentido, hash_termo } = req.body;

    const result = await consentimentoService.registrarConsentimento({
      pacienteId: paciente_id,
      clinicId,
      consentido,
      ipAddress: req.ip || "unknown",
      hashTermo: hash_termo,
    });

    res.status(201).json(result);
  }

  /**
   * GET /ia-radiografia/consentimento/:pacienteId
   */
  async obterConsentimento(req: Request, res: Response) {
    const clinicId = req.clinicId as string;
    const { pacienteId } = req.params;

    const historico = await consentimentoService.obterHistoricoConsentimento(
      pacienteId,
      clinicId,
    );

    const ativo = await consentimentoService.verificarConsentimento(
      pacienteId,
      clinicId,
    );

    res.json({ ativo, historico });
  }

  /**
   * GET /ia-radiografia/insights
   */
  async obterInsights(req: Request, res: Response) {
    const clinicId = req.clinicId as string;
    const { from, to } = req.query as { from?: string; to?: string };

    const dateFilter: { gte?: Date; lte?: Date } = {};
    if (from) dateFilter.gte = new Date(from);
    if (to) dateFilter.lte = new Date(to);

    const where = {
      clinic_id: clinicId,
      ...(Object.keys(dateFilter).length > 0 ? { created_at: dateFilter } : {}),
    };

    const [
      totalAnalises,
      analisesConcluidas,
      analisesRevisadas,
      avgConfidence,
      avgProcessingTime,
    ] = await Promise.all([
      this.repo.countAnalises(where),
      this.repo.countAnalises({ ...where, status: "CONCLUIDA" }),
      this.repo.countAnalises({ ...where, revisada: true }),
      this.repo.aggregateConfidence(where),
      this.repo.aggregateProcessingTime(where),
    ]);

    const taxaRevisao =
      totalAnalises > 0 ? (analisesRevisadas / totalAnalises) * 100 : 0;

    res.json({
      total_analises: totalAnalises,
      analises_concluidas: analisesConcluidas,
      taxa_sucesso:
        totalAnalises > 0 ? (analisesConcluidas / totalAnalises) * 100 : 0,
      taxa_revisao: taxaRevisao,
      precisao_media: Math.round(avgConfidence._avg.confidence_score || 0),
      tempo_medio_processamento_ms: Math.round(
        avgProcessingTime._avg.processamento_ms || 0,
      ),
      // Nota: distribuicao_problemas requer descriptografia individual (GAP-005)
      // sera implementado quando problema_radiografico table for criada
      distribuicao_problemas: [],
    });
  }

  /**
   * DELETE /ia-radiografia/consentimento/:pacienteId
   */
  async revogarConsentimento(req: Request, res: Response) {
    const clinicId = req.clinicId as string;
    const { pacienteId } = req.params;
    const { motivo } = req.body;

    const result = await consentimentoService.revogarConsentimento({
      pacienteId,
      clinicId,
      motivo: motivo || "Revogacao pelo paciente",
    });

    await auditService.registrarAcao({
      clinicId,
      pacienteId,
      dentistaId: req.user?.id as string,
      acao: AcaoAuditIA.REVOGAR_CONSENTIMENTO,
      detalhes: { motivo },
    });

    metrics.iaRadiografia.consentRevocationsTotal.inc({ category: "pep" });

    res.json(result);
  }
}
