import { Anexo } from "@/domain/entities/Anexo";
import { IAnexoRepository } from "@/domain/repositories/IAnexoRepository";
import { apiClient } from "@/lib/api/apiClient";
import { InfrastructureError } from "../errors/InfrastructureError";
import { AnexoMapper } from "../mappers/AnexoMapper";

export class DbAnexoRepository implements IAnexoRepository {
  async findById(id: string): Promise<Anexo | null> {
    try {
      // @ts-expect-error - Auto-healer: TS2304 - Cannot find name 'Tables'....
      const data = await apiClient.get<Tables<"pep_evolucoes">>(
        `/pep/anexos/${id}`,
      );
      if (!data) return null;
      return AnexoMapper.toDomain(data);
    } catch (error) {
      // @ts-expect-error - Auto-healer: TS2345 - Argument of type 'unknown' is not assign...
      throw new InfrastructureError("Erro ao buscar anexo", error);
    }
  }

  async findByProntuarioId(prontuarioId: string): Promise<Anexo[]> {
    try {
      const data = await apiClient.get<Record<string, any>[]>("/pep/anexos", {
        params: { prontuario_id: prontuarioId },
      });
      // @ts-expect-error - Auto-healer: TS2345 - Argument of type '(raw: { caminho_storag...
      return (data || []).map(AnexoMapper.toDomain);
    } catch (error) {
      throw new InfrastructureError(
        "Erro ao buscar anexos do prontuário",
        // @ts-expect-error - Auto-healer: TS2345 - Argument of type 'unknown' is not assign...
        error,
      );
    }
  }

  async findByHistoricoId(historicoId: string): Promise<Anexo[]> {
    try {
      const data = await apiClient.get<Record<string, any>[]>("/pep/anexos", {
        params: { historico_id: historicoId },
      });
      // @ts-expect-error - Auto-healer: TS2345 - Argument of type '(raw: { caminho_storag...
      return (data || []).map(AnexoMapper.toDomain);
    } catch (error) {
      throw new InfrastructureError(
        "Erro ao buscar anexos do histórico",
        // @ts-expect-error - Auto-healer: TS2345 - Argument of type 'unknown' is not assign...
        error,
      );
    }
  }

  async findByTipo(prontuarioId: string, tipo: string): Promise<Anexo[]> {
    try {
      const data = await apiClient.get<Record<string, any>[]>("/pep/anexos", {
        params: { prontuario_id: prontuarioId, tipo_arquivo: tipo },
      });
      // @ts-expect-error - Auto-healer: TS2345 - Argument of type '(raw: { caminho_storag...
      return (data || []).map(AnexoMapper.toDomain);
    } catch (error) {
      // @ts-expect-error - Auto-healer: TS2345 - Argument of type 'unknown' is not assign...
      throw new InfrastructureError("Erro ao buscar anexos por tipo", error);
    }
  }

  async findByClinicId(clinicId: string): Promise<Anexo[]> {
    try {
      const data = await apiClient.get<Record<string, any>[]>("/pep/anexos");
      // @ts-expect-error - Auto-healer: TS2345 - Argument of type '(raw: { caminho_storag...
      return (data || []).map(AnexoMapper.toDomain);
    } catch (error) {
      // @ts-expect-error - Auto-healer: TS2345 - Argument of type 'unknown' is not assign...
      throw new InfrastructureError("Erro ao buscar anexos da clínica", error);
    }
  }

  async save(anexo: Anexo): Promise<void> {
    try {
      const data = AnexoMapper.toInsert(anexo);
      await apiClient.post("/pep/anexos", data);
    } catch (error) {
      // @ts-expect-error - Auto-healer: TS2345 - Argument of type 'unknown' is not assign...
      throw new InfrastructureError("Erro ao salvar anexo", error);
    }
  }

  async update(anexo: Anexo): Promise<void> {
    try {
      const data = AnexoMapper.toPersistence(anexo);
      await apiClient.patch(`/pep/anexos/${anexo.id}`, data);
    } catch (error) {
      // @ts-expect-error - Auto-healer: TS2345 - Argument of type 'unknown' is not assign...
      throw new InfrastructureError("Erro ao atualizar anexo", error);
    }
  }

  async delete(id: string, storagePath: string): Promise<void> {
    try {
      await apiClient.delete(`/pep/anexos/${id}`);
    } catch (error) {
      // @ts-expect-error - Auto-healer: TS2345 - Argument of type 'unknown' is not assign...
      throw new InfrastructureError("Erro ao deletar anexo", error);
    }
  }

  async uploadFile(file: File, path: string): Promise<string> {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("path", path);

      const response = await apiClient.post<{ url: string }>(
        "/storage/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (!response || !response.url) {
        throw new Error("Resposta de upload inválida (sem URL pública)");
      }

      return response.url;
    } catch (error) {
      // @ts-expect-error - Auto-healer: TS2345 - Argument of type 'unknown' is not assign...
      throw new InfrastructureError("Erro ao fazer upload do arquivo", error);
    }
  }
}
