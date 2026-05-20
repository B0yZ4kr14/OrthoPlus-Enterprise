import { prisma, VisibilidadeArquivo } from "@/infrastructure/database/prismaClient";
import { logger } from "@/infrastructure/logger";

export { VisibilidadeArquivo };

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
        visibilidade: parseVisibilidade(data.visibilidade) ?? VisibilidadeArquivo.RESTRITO,
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
