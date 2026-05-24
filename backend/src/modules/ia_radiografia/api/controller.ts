import { Request, Response } from "express"
import { prisma } from "@/infrastructure/database/prismaClient"
import { IAConsentimentoService } from "../domain/services/IAConsentimentoService"
import { IAAuditService } from "../domain/services/IAAuditService"
import { IAEncryptionService } from "../domain/services/IAEncryptionService"
import { DicomMetadataStripper } from "../domain/services/DicomMetadataStripper"
import { LocalAIService } from "../domain/services/LocalAIService"
import { AcaoAuditIA, TipoRadiografia } from "@prisma/client"
import { getMetricsCollector } from "@/infrastructure/metrics/MetricsCollector"
import { prometheusMetrics } from "@/infrastructure/metrics/PrometheusMetrics"
import crypto from "crypto"
import fs from "fs"
import path from "path"

const metrics = getMetricsCollector(prometheusMetrics.getRegistry())

const consentimentoService = new IAConsentimentoService()
const auditService = new IAAuditService()
const encryptionService = new IAEncryptionService()
const stripper = new DicomMetadataStripper()
const aiService = new LocalAIService()

export class IARadiografiaController {
  /**
   * POST /ia-radiografia/upload-e-analisar
   */
  async uploadEAnalisar(req: Request, res: Response) {
    try {
      const clinicId = req.clinicId as string
      const dentistaId = req.user?.id as string
      const { patient_id, prontuario_id, tipo_radiografia } = req.body

      if (!req.file) {
        return res.status(400).json({ error: "Nenhuma imagem enviada" })
      }

      // 1. Verificar consentimento LGPD
      const temConsentimento = await consentimentoService.verificarConsentimento(
        patient_id,
        clinicId,
      )
      if (!temConsentimento) {
        return res.status(403).json({
          error: "Consentimento LGPD necessario",
          code: "CONSENTIMENTO_AUSENTE",
        })
      }

      // 2. Strip metadados DICOM/EXIF
      const { cleanBuffer, originalHash, cleanHash } = await stripper.strip(req.file.buffer)
      const piiCheck = await stripper.validateNoPII(cleanBuffer)
      if (!piiCheck) {
        return res.status(400).json({ error: "Imagem contem possiveis metadados PII" })
      }

      // 3. Salvar arquivo em storage local
      const storageDir = path.join(process.cwd(), "uploads", "ia-radiografia", clinicId, patient_id)
      fs.mkdirSync(storageDir, { recursive: true })
      const storageFileName = `${Date.now()}.png`
      const storagePath = path.join(storageDir, storageFileName)
      fs.writeFileSync(storagePath, cleanBuffer)

      // 4. Criar registro de analise
      const analise = await prisma.ia_radiografia_analise.create({
        data: {
          clinic_id: clinicId,
          paciente_id: patient_id,
          prontuario_id: prontuario_id || null,
          dentista_id: dentistaId,
          imagem_hash: originalHash,
          imagem_storage_path: `uploads/ia-radiografia/${clinicId}/${patient_id}/${storageFileName}`,
          tipo_radiografia: tipo_radiografia as TipoRadiografia,
          status: "PENDENTE",
          modelo_usado: process.env.AI_LOCAL_MODEL || "local/llama-3.3",
        },
      })

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
      })

      // 5.1 Metrics
      metrics.iaRadiografia.uploadsTotal.inc({
        category: "pep",
        tipo_radiografia: tipo_radiografia as string,
        status: "success",
      })

      // 6. Processar analise IA (async — idealmente em worker)
      // Aqui processamos sincrono para simplificar; em producao usar fila
      await this.processarAnalise(analise.id, cleanBuffer, tipo_radiografia, clinicId, patient_id, dentistaId)

      return res.status(201).json({
        id: analise.id,
        status: analise.status,
        message: "Analise iniciada com sucesso",
      })
    } catch (error) {
      console.error("[IA-Radiografia] Upload error:", error)
      return res.status(500).json({ error: "Erro ao processar upload" })
    }
  }

  private async processarAnalise(
    analiseId: string,
    imageBuffer: Buffer,
    tipoRadiografia: string,
    clinicId: string,
    pacienteId: string,
    dentistaId: string,
  ) {
    try {
      await prisma.ia_radiografia_analise.update({
        where: { id: analiseId },
        data: { status: "PROCESSANDO" },
      })

      const startTime = Date.now()
      const { resultado, confidence, processingTimeMs } = await aiService.analyzeRadiografia(
        imageBuffer,
        tipoRadiografia,
      )
      const durationSeconds = (Date.now() - startTime) / 1000

      metrics.iaRadiografia.analysisDuration.observe(
        { category: "pep", modelo: process.env.AI_LOCAL_MODEL || "local/llama-3.3" },
        durationSeconds,
      )

      const encrypted = encryptionService.encrypt(resultado, analiseId)

      await prisma.ia_radiografia_analise.update({
        where: { id: analiseId },
        data: {
          status: "CONCLUIDA",
          resultado_ia: encrypted,
          confidence_score: confidence,
          processamento_ms: processingTimeMs,
        },
      })

      await auditService.registrarAcao({
        analiseId,
        clinicId,
        pacienteId,
        dentistaId,
        acao: AcaoAuditIA.ANALISAR,
        detalhes: { confidence, processingTimeMs, modelo: process.env.AI_LOCAL_MODEL },
      })
    } catch (error) {
      await prisma.ia_radiografia_analise.update({
        where: { id: analiseId },
        data: { status: "ERRO" },
      })
      await auditService.registrarAcao({
        analiseId,
        clinicId,
        pacienteId,
        dentistaId,
        acao: AcaoAuditIA.ANALISAR,
        detalhes: { erro: error instanceof Error ? error.message : "Erro desconhecido" },
      })
      metrics.iaRadiografia.analysisErrors.inc({
        category: "pep",
        error_type: error instanceof Error ? error.name : "unknown",
      })
    }
  }

  /**
   * GET /ia-radiografia/analises
   */
  async listarAnalises(req: Request, res: Response) {
    try {
      const clinicId = req.clinicId as string
      const analises = await prisma.ia_radiografia_analise.findMany({
        where: { clinic_id: clinicId },
        orderBy: { created_at: "desc" },
        select: {
          id: true,
          paciente_id: true,
          tipo_radiografia: true,
          status: true,
          confidence_score: true,
          revisada: true,
          created_at: true,
        },
      })
      return res.json(analises)
    } catch (error) {
      console.error("[IA-Radiografia] List error:", error)
      return res.status(500).json({ error: "Erro ao listar analises" })
    }
  }

  /**
   * GET /ia-radiografia/analises/:id
   */
  async obterAnalise(req: Request, res: Response) {
    try {
      const clinicId = req.clinicId as string
      const dentistaId = req.user?.id as string
      const { id } = req.params

      const analise = await prisma.ia_radiografia_analise.findFirst({
        where: { id, clinic_id: clinicId },
      })

      if (!analise) {
        return res.status(404).json({ error: "Analise nao encontrada" })
      }

      // Descriptografar resultado se existir
      let resultadoDecriptado = null
      if (analise.resultado_ia) {
        const encrypted = analise.resultado_ia as { iv: string; ciphertext: string; tag: string }
        resultadoDecriptado = encryptionService.decrypt(encrypted, analise.id)
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
      })

      return res.json({
        ...analise,
        resultado_ia: resultadoDecriptado,
      })
    } catch (error) {
      console.error("[IA-Radiografia] Get error:", error)
      return res.status(500).json({ error: "Erro ao obter analise" })
    }
  }

  /**
   * GET /ia-radiografia/analises/:id/audit
   */
  async obterAuditoriaAnalise(req: Request, res: Response) {
    try {
      const clinicId = req.clinicId as string
      const { id } = req.params

      const analise = await prisma.ia_radiografia_analise.findFirst({
        where: { id, clinic_id: clinicId },
      })

      if (!analise) {
        return res.status(404).json({ error: "Analise nao encontrada" })
      }

      const auditoria = await auditService.obterAuditoriaPorAnalise(id)

      return res.json(auditoria)
    } catch (error) {
      console.error("[IA-Radiografia] Audit get error:", error)
      return res.status(500).json({ error: "Erro ao obter auditoria" })
    }
  }

  /**
   * PATCH /ia-radiografia/analises/:id/revisar
   */
  async revisarAnalise(req: Request, res: Response) {
    try {
      const clinicId = req.clinicId as string
      const dentistaRevisorId = req.user?.id as string
      const { id } = req.params
      const { observacoes_dentista, assinatura_digital } = req.body

      if (!observacoes_dentista || !assinatura_digital) {
        return res.status(400).json({
          error: "Observacoes e assinatura digital sao obrigatorias",
        })
      }

      const analise = await prisma.ia_radiografia_analise.findFirst({
        where: { id, clinic_id: clinicId },
      })

      if (!analise) {
        return res.status(404).json({ error: "Analise nao encontrada" })
      }

      // Hash da assinatura para auditoria
      const assinaturaHash = crypto.createHash("sha256").update(assinatura_digital).digest("hex")

      await prisma.ia_radiografia_analise.update({
        where: { id },
        data: {
          revisada: true,
          dentista_revisor_id: dentistaRevisorId,
          observacoes_dentista,
          assinatura_digital: assinaturaHash,
        },
      })

      await auditService.registrarAcao({
        analiseId: analise.id,
        clinicId,
        pacienteId: analise.paciente_id,
        dentistaId: dentistaRevisorId,
        acao: AcaoAuditIA.REVISAR,
        detalhes: { assinaturaHash },
      })

      metrics.iaRadiografia.reviewsTotal.inc({ category: "pep" })

      return res.json({ message: "Analise revisada com sucesso" })
    } catch (error) {
      console.error("[IA-Radiografia] Review error:", error)
      return res.status(500).json({ error: "Erro ao revisar analise" })
    }
  }

  /**
   * POST /ia-radiografia/consentimento
   */
  async registrarConsentimento(req: Request, res: Response) {
    try {
      const clinicId = req.clinicId as string
      const { paciente_id, consentido, hash_termo } = req.body

      const result = await consentimentoService.registrarConsentimento({
        pacienteId: paciente_id,
        clinicId,
        consentido,
        ipAddress: req.ip || "unknown",
        hashTermo: hash_termo,
      })

      return res.status(201).json(result)
    } catch (error) {
      console.error("[IA-Radiografia] Consent error:", error)
      return res.status(500).json({ error: "Erro ao registrar consentimento" })
    }
  }

  /**
   * GET /ia-radiografia/consentimento/:pacienteId
   */
  async obterConsentimento(req: Request, res: Response) {
    try {
      const clinicId = req.clinicId as string
      const { pacienteId } = req.params

      const historico = await consentimentoService.obterHistoricoConsentimento(
        pacienteId,
        clinicId,
      )

      const ativo = await consentimentoService.verificarConsentimento(pacienteId, clinicId)

      return res.json({ ativo, historico })
    } catch (error) {
      console.error("[IA-Radiografia] Consent get error:", error)
      return res.status(500).json({ error: "Erro ao obter consentimento" })
    }
  }

  /**
   * GET /ia-radiografia/insights
   */
  async obterInsights(req: Request, res: Response) {
    try {
      const clinicId = req.clinicId as string
      const { from, to } = req.query as { from?: string; to?: string }

      const dateFilter: { gte?: Date; lte?: Date } = {}
      if (from) dateFilter.gte = new Date(from)
      if (to) dateFilter.lte = new Date(to)

      const where = {
        clinic_id: clinicId,
        ...(Object.keys(dateFilter).length > 0 ? { created_at: dateFilter } : {}),
      }

      const [
        totalAnalises,
        analisesConcluidas,
        analisesRevisadas,
        avgConfidence,
        avgProcessingTime,
      ] = await Promise.all([
        prisma.ia_radiografia_analise.count({ where }),
        prisma.ia_radiografia_analise.count({ where: { ...where, status: "CONCLUIDA" } }),
        prisma.ia_radiografia_analise.count({ where: { ...where, revisada: true } }),
        prisma.ia_radiografia_analise.aggregate({
          where: { ...where, confidence_score: { not: null } },
          _avg: { confidence_score: true },
        }),
        prisma.ia_radiografia_analise.aggregate({
          where: { ...where, processamento_ms: { not: null } },
          _avg: { processamento_ms: true },
        }),
      ])

      const taxaRevisao = totalAnalises > 0 ? (analisesRevisadas / totalAnalises) * 100 : 0

      return res.json({
        total_analises: totalAnalises,
        analises_concluidas: analisesConcluidas,
        taxa_sucesso: totalAnalises > 0 ? (analisesConcluidas / totalAnalises) * 100 : 0,
        taxa_revisao: taxaRevisao,
        precisao_media: Math.round(avgConfidence._avg.confidence_score || 0),
        tempo_medio_processamento_ms: Math.round(avgProcessingTime._avg.processamento_ms || 0),
        // Nota: distribuicao_problemas requer descriptografia individual (GAP-005)
        // sera implementado quando problema_radiografico table for criada
        distribuicao_problemas: [],
      })
    } catch (error) {
      console.error("[IA-Radiografia] Insights error:", error)
      return res.status(500).json({ error: "Erro ao obter insights" })
    }
  }

  /**
   * DELETE /ia-radiografia/consentimento/:pacienteId
   */
  async revogarConsentimento(req: Request, res: Response) {
    try {
      const clinicId = req.clinicId as string
      const { pacienteId } = req.params
      const { motivo } = req.body

      const result = await consentimentoService.revogarConsentimento({
        pacienteId,
        clinicId,
        motivo: motivo || "Revogacao pelo paciente",
      })

      await auditService.registrarAcao({
        clinicId,
        pacienteId,
        dentistaId: req.user?.id as string,
        acao: AcaoAuditIA.REVOGAR_CONSENTIMENTO,
        detalhes: { motivo },
      })

      metrics.iaRadiografia.consentRevocationsTotal.inc({ category: "pep" })

      return res.json(result)
    } catch (error) {
      console.error("[IA-Radiografia] Revoke error:", error)
      return res.status(500).json({ error: "Erro ao revogar consentimento" })
    }
  }
}
