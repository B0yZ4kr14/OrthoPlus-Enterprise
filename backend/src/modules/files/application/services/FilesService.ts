import { prisma, VisibilidadeArquivo } from "@/infrastructure/database/prismaClient";
import { logger } from "@/infrastructure/logger";
import { circuitBreakerRegistry } from "@/infrastructure/database/CategoryCircuitBreaker";
import type { CircuitBreakerConfig } from "@/infrastructure/database/CategoryCircuitBreaker";
import { Errors } from "@/middleware/errorHandler";

export { VisibilidadeArquivo };

const CB_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 3,
  successThreshold: 2,
  timeoutMs: 3000,
  recoveryTimeoutMs: 15000,
  halfOpenMaxCalls: 3,
};

const CATEGORY = "administrativo";

function parseVisibilidade(value: string | undefined): VisibilidadeArquivo | undefined {
  if (!value) return undefined
  const map: Record<string, VisibilidadeArquivo> = {
    PUBLICO: VisibilidadeArquivo.PUBLICO,
    RESTRITO: VisibilidadeArquivo.RESTRITO,
    CONFIDENCIAL: VisibilidadeArquivo.CONFIDENCIAL,
  }
  return map[value] ?? VisibilidadeArquivo.RESTRITO
}

export interface CreateFileInput {
  clinicId: string;
  pacienteId?: string;
  consultaId?: string;
  orcamentoId?: string;
  nomeOriginal: string;
  nomeStorage: string;
  mimeType: string;
  tamanhoBytes: number;
  categoria?: string;
  visibilidade?: string;
  uploadedBy: string;
}


export interface FileFilters {
  clinicId: string;
  pacienteId?: string;
  consultaId?: string;
  orcamentoId?: string;
  categoria?: string;
  visibilidade?: string;
  userRole?: string;
}

export interface VersionData {
  nomeStorage: string;
  tamanhoBytes: number;
  urlTemp?: string;
  createdBy: string;
}

export class FilesService {
  async create(data: CreateFileInput): Promise<{
    id: string;
    nomeOriginal: string;
    nomeStorage: string;
    mimeType: string;
    tamanhoBytes: number;
    categoria: string;
    visibilidade: string;
    createdAt: Date;
  }> {
    const cb = circuitBreakerRegistry.getBreaker(CATEGORY, CB_CONFIG);
    const record = await cb.execute(
      async () => prisma.arquivo.create({
        data: {
          clinic_id: data.clinicId,
          paciente_id: data.pacienteId ?? null,
          consulta_id: data.consultaId ?? null,
          orcamento_id: data.orcamentoId ?? null,
          nome_original: data.nomeOriginal,
          nome_storage: data.nomeStorage,
          mime_type: data.mimeType,
          tamanho_bytes: data.tamanhoBytes,
          categoria: data.categoria ?? "OUTRO",
          visibilidade: parseVisibilidade(data.visibilidade) ?? VisibilidadeArquivo.RESTRITO,
          uploaded_by: data.uploadedBy,
        },
      }),
      () => { throw Errors.externalService("Database"); }
    );

    return {
      id: record.id,
      nomeOriginal: record.nome_original,
      nomeStorage: record.nome_storage,
      mimeType: record.mime_type,
      tamanhoBytes: record.tamanho_bytes,
      categoria: record.categoria,
      visibilidade: record.visibilidade,
      createdAt: record.created_at,
    };
  }

  async list(filters: FileFilters): Promise<
    Array<{
      id: string;
      nomeOriginal: string;
      mimeType: string;
      tamanhoBytes: number;
      categoria: string;
      visibilidade: string;
      pacienteId: string | null;
      createdAt: Date;
    }>
  > {
    type ArquivoRecord = {
      id: string;
      nome_original: string;
      mime_type: string;
      tamanho_bytes: number;
      categoria: string;
      visibilidade: string;
      paciente_id: string | null;
      created_at: Date;
    };

    const cb = circuitBreakerRegistry.getBreaker(CATEGORY, CB_CONFIG);
    const records = await cb.execute<ArquivoRecord[]>(
      async () => {
        const where: Record<string, unknown> = {
          clinic_id: filters.clinicId,
        };

        if (filters.pacienteId) where.paciente_id = filters.pacienteId;
        if (filters.consultaId) where.consulta_id = filters.consultaId;
        if (filters.orcamentoId) where.orcamento_id = filters.orcamentoId;
        if (filters.categoria) where.categoria = filters.categoria;

        // Visibility filter based on user role (AP-1: clinic isolation + ACL)
        if (filters.visibilidade) {
          where.visibilidade = parseVisibilidade(filters.visibilidade);
        } else if (filters.userRole) {
          const role = filters.userRole;
          if (role === "PATIENT") {
            where.visibilidade = "PUBLICO";
          } else if (role === "MEMBER") {
            where.visibilidade = { in: ["PUBLICO", "RESTRITO"] };
          }
          // ADMIN sees all — no visibility filter needed
        }

        return prisma.arquivo.findMany({
          where,
          orderBy: { created_at: "desc" },
          take: 1000,
        }) as Promise<ArquivoRecord[]>;
      },
      () => []
    );

    return records.map((r) => ({
      id: r.id,
      nomeOriginal: r.nome_original,
      mimeType: r.mime_type,
      tamanhoBytes: r.tamanho_bytes,
      categoria: r.categoria,
      visibilidade: r.visibilidade,
      pacienteId: r.paciente_id,
      createdAt: r.created_at,
    }));
  }

  async getById(id: string, clinicId: string): Promise<{
    id: string;
    nomeOriginal: string;
    nomeStorage: string;
    mimeType: string;
    tamanhoBytes: number;
    categoria: string;
    visibilidade: string;
    pacienteId: string | null;
    consultaId: string | null;
    orcamentoId: string | null;
    uploadedBy: string;
    createdAt: Date;
  } | null> {
    const cb = circuitBreakerRegistry.getBreaker(CATEGORY, CB_CONFIG);
    const record = await cb.execute(
      async () => prisma.arquivo.findFirst({
        where: {
          id,
          clinic_id: clinicId,
        },
      }),
      () => null
    );

    if (!record) return null;

    return {
      id: record.id,
      nomeOriginal: record.nome_original,
      nomeStorage: record.nome_storage,
      mimeType: record.mime_type,
      tamanhoBytes: record.tamanho_bytes,
      categoria: record.categoria,
      visibilidade: record.visibilidade,
      pacienteId: record.paciente_id,
      consultaId: record.consulta_id,
      orcamentoId: record.orcamento_id,
      uploadedBy: record.uploaded_by,
      createdAt: record.created_at,
    };
  }

  async delete(id: string, clinicId: string): Promise<boolean> {
    const cb = circuitBreakerRegistry.getBreaker(CATEGORY, CB_CONFIG);
    try {
      const result = await cb.execute(
        async () => prisma.arquivo.deleteMany({
          where: {
            id,
            clinic_id: clinicId,
          },
        }),
        () => ({ count: 0 })
      );

      return result.count > 0;
    } catch (error) {
      logger.error("[FilesService] delete error:", { error });
      return false;
    }
  }

  async updateUrlTemp(
    id: string,
    clinicId: string,
    urlTemp: string,
    expiraEm: Date,
  ): Promise<boolean> {
    const cb = circuitBreakerRegistry.getBreaker(CATEGORY, CB_CONFIG);
    try {
      const result = await cb.execute(
        async () => prisma.arquivo.updateMany({
          where: {
            id,
            clinic_id: clinicId,
          },
          data: {
            url_temp: urlTemp,
            expira_em: expiraEm,
          },
        }),
        () => ({ count: 0 })
      );

      return result.count > 0;
    } catch (error) {
      logger.error("[FilesService] updateUrlTemp error:", { error });
      return false;
    }
  }

  // --------------------
  // OCR Methods (US3)
  // --------------------
  async extractOCR(arquivoId: string, clinicId: string): Promise<{
    id: string;
    arquivoId: string;
    textoExtraido: string | null;
    status: string;
    idioma: string | null;
    confidence: number | null;
    createdAt: Date;
    updatedAt: Date;
  }> {
    const cb = circuitBreakerRegistry.getBreaker(CATEGORY, CB_CONFIG);

    const file = await cb.execute(
      async () => prisma.arquivo.findFirst({
        where: { id: arquivoId, clinic_id: clinicId },
      }),
      () => null
    );

    if (!file) {
      throw Errors.notFound("File", arquivoId);
    }

    const record = await cb.execute(
      async () => prisma.arquivo_ocr.create({
        data: {
          arquivo_id: arquivoId,
          status: "PROCESSANDO",
          texto_extraido: null,
          idioma: "pt",
          confidence: null,
        },
      }),
      () => { throw Errors.externalService("Database"); }
    );

    await cb.execute(
      async () => prisma.arquivo.updateMany({
        where: { id: arquivoId, clinic_id: clinicId },
        data: { ocr_status: "PROCESSANDO" },
      }),
      () => { throw Errors.externalService("Database"); }
    );

    return {
      id: record.id,
      arquivoId: record.arquivo_id,
      textoExtraido: record.texto_extraido,
      status: record.status,
      idioma: record.idioma,
      confidence: record.confidence,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    };
  }

  async getOCRResult(arquivoId: string, clinicId: string): Promise<{
    id: string;
    arquivoId: string;
    textoExtraido: string | null;
    status: string;
    idioma: string | null;
    confidence: number | null;
    createdAt: Date;
    updatedAt: Date;
  } | null> {
    const cb = circuitBreakerRegistry.getBreaker(CATEGORY, CB_CONFIG);

    const file = await cb.execute(
      async () => prisma.arquivo.findFirst({
        where: { id: arquivoId, clinic_id: clinicId },
      }),
      () => null
    );

    if (!file) {
      throw Errors.notFound("File", arquivoId);
    }

    const record = await cb.execute(
      async () => prisma.arquivo_ocr.findFirst({
        where: { arquivo_id: arquivoId },
        orderBy: { created_at: "desc" },
      }),
      () => null
    );

    if (!record) return null;

    return {
      id: record.id,
      arquivoId: record.arquivo_id,
      textoExtraido: record.texto_extraido,
      status: record.status,
      idioma: record.idioma,
      confidence: record.confidence,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    };
  }

  async searchFilesByText(clinicId: string, searchTerm: string): Promise<
    Array<{
      id: string;
      nomeOriginal: string;
      mimeType: string;
      tamanhoBytes: number;
      categoria: string;
      visibilidade: string;
      pacienteId: string | null;
      createdAt: Date;
    }>
  > {
    const cb = circuitBreakerRegistry.getBreaker(CATEGORY, CB_CONFIG);

    const ocrRecords = await cb.execute(
      async () => prisma.arquivo_ocr.findMany({
        where: {
          texto_extraido: { contains: searchTerm, mode: "insensitive" },
        },
        select: { arquivo_id: true },
      }),
      () => []
    );

    const arquivoIds = ocrRecords.map((r) => r.arquivo_id);
    if (arquivoIds.length === 0) return [];

    const files = await cb.execute(
      async () => prisma.arquivo.findMany({
        where: {
          id: { in: arquivoIds },
          clinic_id: clinicId,
        },
        orderBy: { created_at: "desc" },
        take: 1000,
      }),
      () => []
    );

    return files.map((f) => ({
      id: f.id,
      nomeOriginal: f.nome_original,
      mimeType: f.mime_type,
      tamanhoBytes: f.tamanho_bytes,
      categoria: f.categoria,
      visibilidade: f.visibilidade,
      pacienteId: f.paciente_id,
      createdAt: f.created_at,
    }));
  }

  // --------------------
  // Versioning Methods (US4)
  // --------------------
  async createVersion(
    arquivoId: string,
    data: VersionData,
    clinicId: string,
  ): Promise<{
    id: string;
    arquivoId: string;
    numeroVersao: number;
    nomeStorage: string;
    tamanhoBytes: number;
    urlTemp: string | null;
    createdBy: string;
    createdAt: Date;
  }> {
    const cb = circuitBreakerRegistry.getBreaker(CATEGORY, CB_CONFIG);

    const file = await cb.execute(
      async () => prisma.arquivo.findFirst({
        where: { id: arquivoId, clinic_id: clinicId },
      }),
      () => null
    );

    if (!file) {
      throw Errors.notFound("File", arquivoId);
    }

    const lastVersion = await cb.execute(
      async () => prisma.arquivo_versao.findFirst({
        where: { arquivo_id: arquivoId },
        orderBy: { numero_versao: "desc" },
      }),
      () => null
    );

    const nextVersionNumber = (lastVersion?.numero_versao ?? 0) + 1;

    const record = await cb.execute(
      async () => prisma.arquivo_versao.create({
        data: {
          arquivo_id: arquivoId,
          numero_versao: nextVersionNumber,
          nome_storage: data.nomeStorage,
          tamanho_bytes: data.tamanhoBytes,
          url_temp: data.urlTemp ?? null,
          created_by: data.createdBy,
        },
      }),
      () => { throw Errors.externalService("Database"); }
    );

    await cb.execute(
      async () => prisma.arquivo.updateMany({
        where: { id: arquivoId, clinic_id: clinicId },
        data: { versao_atual_id: record.id },
      }),
      () => { throw Errors.externalService("Database"); }
    );

    return {
      id: record.id,
      arquivoId: record.arquivo_id,
      numeroVersao: record.numero_versao,
      nomeStorage: record.nome_storage,
      tamanhoBytes: record.tamanho_bytes,
      urlTemp: record.url_temp,
      createdBy: record.created_by,
      createdAt: record.created_at,
    };
  }

  async listVersions(arquivoId: string, clinicId: string): Promise<
    Array<{
      id: string;
      arquivoId: string;
      numeroVersao: number;
      nomeStorage: string;
      tamanhoBytes: number;
      urlTemp: string | null;
      createdBy: string;
      createdAt: Date;
    }>
  > {
    const cb = circuitBreakerRegistry.getBreaker(CATEGORY, CB_CONFIG);

    const file = await cb.execute(
      async () => prisma.arquivo.findFirst({
        where: { id: arquivoId, clinic_id: clinicId },
      }),
      () => null
    );

    if (!file) {
      throw Errors.notFound("File", arquivoId);
    }

    const records = await cb.execute(
      async () => prisma.arquivo_versao.findMany({
        where: { arquivo_id: arquivoId },
        orderBy: { numero_versao: "desc" },
      }),
      () => []
    );

    return records.map((r) => ({
      id: r.id,
      arquivoId: r.arquivo_id,
      numeroVersao: r.numero_versao,
      nomeStorage: r.nome_storage,
      tamanhoBytes: r.tamanho_bytes,
      urlTemp: r.url_temp,
      createdBy: r.created_by,
      createdAt: r.created_at,
    }));
  }

  async restoreVersion(
    arquivoId: string,
    versionId: string,
    clinicId: string,
  ): Promise<{
    id: string;
    nomeOriginal: string;
    nomeStorage: string;
    mimeType: string;
    tamanhoBytes: number;
    categoria: string;
    visibilidade: string;
    pacienteId: string | null;
    consultaId: string | null;
    orcamentoId: string | null;
    uploadedBy: string;
    createdAt: Date;
  }> {
    const cb = circuitBreakerRegistry.getBreaker(CATEGORY, CB_CONFIG);

    const file = await cb.execute(
      async () => prisma.arquivo.findFirst({
        where: { id: arquivoId, clinic_id: clinicId },
      }),
      () => null
    );

    if (!file) {
      throw Errors.notFound("File", arquivoId);
    }

    const version = await cb.execute(
      async () => prisma.arquivo_versao.findFirst({
        where: { id: versionId, arquivo_id: arquivoId },
      }),
      () => null
    );

    if (!version) {
      throw Errors.notFound("Version", versionId);
    }

    const updated = await cb.execute(
      async () => prisma.arquivo.updateMany({
        where: { id: arquivoId, clinic_id: clinicId },
        data: {
          nome_storage: version.nome_storage,
          tamanho_bytes: version.tamanho_bytes,
          versao_atual_id: version.id,
        },
      }),
      () => ({ count: 0 })
    );

    if (updated.count === 0) {
      throw Errors.internal("Failed to restore version");
    }

    const refreshed = await cb.execute(
      async () => prisma.arquivo.findFirst({
        where: { id: arquivoId, clinic_id: clinicId },
      }),
      () => null
    );

    if (!refreshed) {
      throw Errors.internal("Failed to retrieve updated file after restore");
    }

    return {
      id: refreshed.id,
      nomeOriginal: refreshed.nome_original,
      nomeStorage: refreshed.nome_storage,
      mimeType: refreshed.mime_type,
      tamanhoBytes: refreshed.tamanho_bytes,
      categoria: refreshed.categoria,
      visibilidade: refreshed.visibilidade,
      pacienteId: refreshed.paciente_id,
      consultaId: refreshed.consulta_id,
      orcamentoId: refreshed.orcamento_id,
      uploadedBy: refreshed.uploaded_by,
      createdAt: refreshed.created_at,
    };
  }
}
