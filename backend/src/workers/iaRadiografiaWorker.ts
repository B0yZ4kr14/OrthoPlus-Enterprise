import { Queue, Worker } from "bullmq";
import { redisInstance } from "@/infrastructure/redis/redisClient";
import { LocalAIService } from "@/modules/ia_radiografia/domain/services/LocalAIService";
import { IAAuditService } from "@/modules/ia_radiografia/domain/services/IAAuditService";
import { IAEncryptionService } from "@/modules/ia_radiografia/domain/services/IAEncryptionService";
import { AcaoAuditIA } from "@prisma/client";
import { logger } from "@/infrastructure/logger";
import fs from "fs";
import { IIARadiografiaRepository } from "@/modules/ia_radiografia/domain/repositories/IIARadiografiaRepository";
import { IARadiografiaRepository } from "@/modules/ia_radiografia/infrastructure/IARadiografiaRepository";

const aiService = new LocalAIService();
const auditService = new IAAuditService();
const encryptionService = new IAEncryptionService();

export const iaRadiografiaQueue = new Queue("ia-radiografia-analysis", {
  connection: redisInstance,
});

export const iaRadiografiaWorker = new Worker(
  "ia-radiografia-analysis",
  async (job) => {
    const repo: IIARadiografiaRepository = new IARadiografiaRepository();
    const { analiseId, storagePath, tipoRadiografia } = job.data as {
      analiseId: string;
      storagePath: string;
      tipoRadiografia: string;
    };

    const analise = await repo.findAnaliseByIdOnly(analiseId);
    if (!analise) throw new Error("Analysis not found");

    await repo.updateAnalise(analiseId, analise.clinic_id, { status: "PROCESSANDO" });

    const imageBuffer = fs.readFileSync(storagePath);

    // Load clinic model config for A/B testing support (T045)
    const modelConfig = await repo.findModelConfigByClinic(analise.clinic_id);

    const startTime = Date.now();
    const { resultado, confidence, processingTimeMs, modelUsed, modelVersion } =
      await aiService.analyzeRadiografia(
        imageBuffer,
        tipoRadiografia,
        modelConfig
          ? {
              endpoint:
                process.env.AI_LOCAL_ENDPOINT || "http://localhost:11434",
              model: modelConfig.modelo_ativo,
            }
          : undefined,
      );
    const durationMs = Date.now() - startTime;

    const encrypted = encryptionService.encrypt(resultado, analiseId);

    await repo.updateAnalise(analiseId, analise.clinic_id, {
      status: "CONCLUIDA",
      resultado_ia: encrypted as unknown as never,
      confidence_score: confidence,
      processamento_ms: processingTimeMs ?? durationMs,
      modelo_usado: modelUsed,
      modelo_version: modelVersion,
    });

    // Normalize detected problems into problema_radiografico table (T044)
    if (resultado.problemas_detectados?.length > 0) {
      await repo.createProblemasRadiograficos(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resultado.problemas_detectados.map((p: any) => ({
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
      );
    }

    await auditService.registrarAcao({
      analiseId,
      clinicId: analise.clinic_id,
      pacienteId: analise.paciente_id,
      dentistaId: analise.dentista_id,
      acao: AcaoAuditIA.ANALISAR,
      detalhes: { confidence, model: analise.modelo_usado, durationMs },
    });
  },
  { connection: redisInstance, concurrency: 2 },
);

type TipoProblema =
  | "CARIE"
  | "FRATURA"
  | "PERIODONTAL"
  | "IMPLANTE_NECESSARIO"
  | "TARTARO"
  | "MAL_POSICAO"
  | "OUTRO";
type Severidade = "LEVE" | "MODERADA" | "GRAVE" | "CRITICA";

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
  };
  return map[tipo.toLowerCase()] || "OUTRO";
}

function mapSeveridade(sev: string): Severidade {
  const map: Record<string, Severidade> = {
    leve: "LEVE",
    moderada: "MODERADA",
    grave: "GRAVE",
    critica: "CRITICA",
  };
  return map[sev.toLowerCase()] || "LEVE";
}

iaRadiografiaWorker.on("completed", (job) => {
  logger.info(
    `[Worker] Job ${job.id} completed for analysis ${job.data.analiseId}`,
  );
});

iaRadiografiaWorker.on("failed", async (job, err) => {
  logger.error(`[Worker] Job ${job?.id} failed:`, err);
  if (job?.data.analiseId) {
    const repo: IIARadiografiaRepository = new IARadiografiaRepository();
    const analise = await repo.findAnaliseByIdOnly(job.data.analiseId);
    if (analise) {
      await repo
        .updateAnalise(job.data.analiseId, analise.clinic_id, {
          status: "ERRO",
          erro_processamento: err.message,
        })
        .catch((e) => logger.error("[Worker] Failed to update error status:", e));
    }
  }
});
