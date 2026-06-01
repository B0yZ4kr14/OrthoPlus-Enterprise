import { z } from "zod";
import { IFaturamentoRepository } from "@/modules/faturamento/domain/repositories/IFaturamentoRepository";
import { logger } from "@/infrastructure/logger";

import { FaturamentoRepository } from "@/modules/faturamento/infrastructure/FaturamentoRepository";

const createNFeSchema = z.object({
  vendaId: z.string().uuid().optional(),
  tipoNota: z.enum(["NFE", "NFCE", "NFSE"]),
  numero: z.number().int().positive(),
  serie: z.number().int().positive().default(1),
  chaveAcesso: z.string().length(44),
  valorTotal: z.number().positive(),
  dataEmissao: z.string().datetime(),
});

export class FaturamentoControllerService {
  private repo: IFaturamentoRepository;

  constructor(repo?: IFaturamentoRepository) {
    this.repo = repo ?? new FaturamentoRepository();
  }

  async createNFe(clinicId: string, body: unknown) {
    const validatedData = createNFeSchema.parse(body);

    await this.repo
      .createNFe({
        clinic_id: clinicId,
        chave_acesso: validatedData.chaveAcesso,
        valor_total: validatedData.valorTotal,
        tipo_nota: validatedData.tipoNota,
        status: "PROCESSANDO",
      })
      .catch((err) => logger.debug("NFE create error", err));

    logger.info("NFe created", {
      clinicId,
      chaveAcesso: validatedData.chaveAcesso,
    });
    return validatedData;
  }

  async listNFes(clinicId: string) {
    let nfes: unknown[] = [];
    try {
      nfes = await this.repo.findNFesByClinic(clinicId);
    } catch (err) {
      logger.debug("NFE findMany error", err);
    }
    logger.info("Listing NFes", { clinicId, count: nfes.length });
    return nfes;
  }

  async autorizarNFe(id: string, clinicId: string, protocolo: string, xml: string) {
    await this.repo
      .updateNFeStatus(id, clinicId, {
        status: "AUTORIZADA",
        protocolo,
        xml_autorizacao: xml,
      })
      .catch((err) => logger.debug("NFE autorizar error", err));

    logger.info("NFe authorized", { id, protocolo });
  }

  async cancelarNFe(id: string, clinicId: string, motivo: string) {
    await this.repo
      .updateNFeStatus(id, clinicId, {
        status: "CANCELADA",
        motivo_cancelamento: motivo,
        data_cancelamento: new Date(),
      })
      .catch((err) => logger.debug("NFE cancelar error", err));

    logger.info("NFe canceled", { id, motivo });
  }

  async getConfig(clinicId: string) {
    return this.repo.getConfig(clinicId);
  }

  async upsertConfig(clinicId: string, data: unknown) {
    return this.repo.upsertConfig(clinicId, data as Record<string, unknown>);
  }

  async getRelatorio(
    clinicId: string,
    filters: { dataInicio?: string; dataFim?: string; tipo?: string },
  ) {
    const notas = await this.repo.getRelatorio(clinicId, filters);
    const totais = {
      valorTotal: notas.reduce(
        (acc: number, n: Record<string, unknown>) => acc + ((n.valor_total as number) || 0),
        0,
      ),
      valorIcms: notas.reduce(
        (acc: number, n: Record<string, unknown>) => acc + ((n.valor_icms as number) || 0),
        0,
      ),
      valorIss: notas.reduce(
        (acc: number, n: Record<string, unknown>) => acc + ((n.valor_iss as number) || 0),
        0,
      ),
      valorIpi: 0,
      valorPis: 0,
      valorCofins: 0,
      quantidade: notas.length,
    };
    return { notas, totais };
  }
}
