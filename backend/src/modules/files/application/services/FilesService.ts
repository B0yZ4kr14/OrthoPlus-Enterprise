import { prisma } from "@/infrastructure/database/prismaClient";
import { logger } from "@/infrastructure/logger";

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
    const record = await prisma.arquivo.create({
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
        visibilidade: data.visibilidade ?? "RESTRITO",
        uploaded_by: data.uploadedBy,
      },
    });

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
    const where: Record<string, unknown> = {
      clinic_id: filters.clinicId,
    };

    if (filters.pacienteId) where.paciente_id = filters.pacienteId;
    if (filters.consultaId) where.consulta_id = filters.consultaId;
    if (filters.orcamentoId) where.orcamento_id = filters.orcamentoId;
    if (filters.categoria) where.categoria = filters.categoria;
    if (filters.visibilidade) where.visibilidade = filters.visibilidade;

    const records = await prisma.arquivo.findMany({
      where,
      orderBy: { created_at: "desc" },
      take: 1000,
    });

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
    const record = await prisma.arquivo.findFirst({
      where: {
        id,
        clinic_id: clinicId,
      },
    });

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
    try {
      const result = await prisma.arquivo.deleteMany({
        where: {
          id,
          clinic_id: clinicId,
        },
      });

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
    try {
      const result = await prisma.arquivo.updateMany({
        where: {
          id,
          clinic_id: clinicId,
        },
        data: {
          url_temp: urlTemp,
          expira_em: expiraEm,
        },
      });

      return result.count > 0;
    } catch (error) {
      logger.error("[FilesService] updateUrlTemp error:", { error });
      return false;
    }
  }
}
