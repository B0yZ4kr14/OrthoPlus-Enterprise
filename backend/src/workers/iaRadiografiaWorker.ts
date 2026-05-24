import { Queue, Worker } from "bullmq"
import { redisInstance } from "@/infrastructure/redis/redisClient"
import { prisma } from "@/infrastructure/database/prismaClient"
import { LocalAIService } from "@/modules/ia_radiografia/domain/services/LocalAIService"
import { IAAuditService } from "@/modules/ia_radiografia/domain/services/IAAuditService"
import { IAEncryptionService } from "@/modules/ia_radiografia/domain/services/IAEncryptionService"
import { AcaoAuditIA } from "@prisma/client"
import fs from "fs"

const aiService = new LocalAIService()
const auditService = new IAAuditService()
const encryptionService = new IAEncryptionService()

export const iaRadiografiaQueue = new Queue("ia-radiografia-analysis", {
  connection: redisInstance,
})

export const iaRadiografiaWorker = new Worker(
  "ia-radiografia-analysis",
  async (job) => {
    const { analiseId, storagePath, tipoRadiografia } = job.data as {
      analiseId: string
      storagePath: string
      tipoRadiografia: string
    }

    const analise = await prisma.ia_radiografia_analise.findUnique({
      where: { id: analiseId },
    })
    if (!analise) throw new Error("Analysis not found")

    await prisma.ia_radiografia_analise.update({
      where: { id: analiseId },
      data: { status: "PROCESSANDO" },
    })

    const imageBuffer = fs.readFileSync(storagePath)

    // Load clinic model config for A/B testing support (T045)
    const modelConfig = await prisma.ia_modelo_config.findUnique({
      where: { clinic_id: analise.clinic_id },
    })

    const startTime = Date.now()
    const { resultado, confidence, processingTimeMs, modelUsed, modelVersion } =
      await aiService.analyzeRadiografia(imageBuffer, tipoRadiografia, modelConfig ? {
        endpoint: process.env.AI_LOCAL_ENDPOINT || "http://localhost:11434",
        model: modelConfig.modelo_ativo,
      } : undefined)
    const durationMs = Date.now() - startTime

    const encrypted = encryptionService.encrypt(resultado, analiseId)

    await prisma.ia_radiografia_analise.update({
      where: { id: analiseId },
      data: {
        status: "CONCLUIDA",
        resultado_ia: encrypted as unknown as never,
        confidence_score: confidence,
        processamento_ms: processingTimeMs ?? durationMs,
        modelo_usado: modelUsed,
        modelo_version: modelVersion,
      },
    })

    // Normalize detected problems into problema_radiografico table (T044)
    if (resultado.problemas_detectados?.length > 0) {
      await prisma.problema_radiografico.createMany({
        data: resultado.problemas_detectados.map((p) => ({
          analise_id: analiseId,
          tipo_problema: mapTipoProblema(p.tipo_problema),
          dente_codigo: p.dente_codigo ?? null,
          localizacao: p.localizacao ?? null,
          severidade: mapSeveridade(p.severidade),
          confianca: p.confianca ?? confidence,
          descricao: p.descricao ?? null,
          sugestao_tratamento: p.sugestao_tratamento ?? null,
          urgente: p.urgente ?? false,
        })),
      })
    }

    await auditService.registrarAcao({
      analiseId,
      clinicId: analise.clinic_id,
      pacienteId: analise.paciente_id,
      dentistaId: analise.dentista_id,
      acao: AcaoAuditIA.ANALISAR,
      detalhes: { confidence, model: analise.modelo_usado, durationMs },
    })
  },
  { connection: redisInstance, concurrency: 2 },
)

type TipoProblema = "CARIE" | "FRATURA" | "PERIODONTAL" | "IMPLANTE_NECESSARIO" | "TARTARO" | "MAL_POSICAO" | "OUTRO"
type Severidade = "LEVE" | "MODERADA" | "GRAVE" | "CRITICA"

function mapTipoProblema(tipo: string): TipoProblema {
  const map: Record<string, TipoProblema> = {
    carie: "CARIE",
    fratura: "FRATURA",
    periodontal: "PERIODONTAL",
    implante_necessario: "IMPLANTE_NECESSARIO",
    tartaro: "TARTARO",
    mal_posicao: "MAL_POSICAO",
    canal: "OUTRO",
    lesao_periapical: "OUTRO",
    outros: "OUTRO",
  }
  return map[tipo.toLowerCase()] || "OUTRO"
}

function mapSeveridade(sev: string): Severidade {
  const map: Record<string, Severidade> = {
    leve: "LEVE",
    moderada: "MODERADA",
    grave: "GRAVE",
    critica: "CRITICA",
  }
  return map[sev.toLowerCase()] || "LEVE"
}

iaRadiografiaWorker.on("completed", (job) => {
  console.log(`[Worker] Job ${job.id} completed for analysis ${job.data.analiseId}`)
})

iaRadiografiaWorker.on("failed", async (job, err) => {
  console.error(`[Worker] Job ${job?.id} failed:`, err)
  if (job?.data.analiseId) {
    await prisma.ia_radiografia_analise
      .update({
        where: { id: job.data.analiseId },
        data: { status: "ERRO", erro_processamento: err.message },
      })
      .catch(console.error)
  }
})
