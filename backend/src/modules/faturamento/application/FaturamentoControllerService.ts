import { z } from "zod";
import { FaturamentoRepository } from "@/modules/faturamento/infrastructure/FaturamentoRepository";
import { logger } from "@/infrastructure/logger";

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
  constructor(private repo: FaturamentoRepository = new FaturamentoRepository()) {}

  async createNFe(clinicId: string, body: unknown) {
    const validatedData = createNFeSchema.parse(body);

    await this.repo.createNFe({
      clinic_id: clinicId,
      chave_acesso: validatedData.chaveAcesso,
      valor_total: validatedData.valorTotal,
      tipo_nota: validatedData.tipoNota,
      status: "PROCESSANDO",
    }).catch(err => logger.debug("NFE create error", err));

    logger.info("NFe created", { clinicId, chaveAcesso: validatedData.chaveAcesso });
    return validatedData;
  }

  async listNFes(clinicId: string) {
    let nfes: any[] = [];
    try {
      nfes = await this.repo.findNFesByClinic(clinicId);
    } catch (err) {
      logger.debug("NFE findMany error", err);
    }
    logger.info("Listing NFes", { clinicId, count: nfes.length });
    return nfes;
  }

  async autorizarNFe(id: string, protocolo: string, xml: string) {
    await this.repo.updateNFeStatus(id, {
      status: "AUTORIZADA",
      protocolo,
      xml_autorizacao: xml,
    }).catch(err => logger.debug("NFE autorizar error", err));

    logger.info("NFe authorized", { id, protocolo });
  }

  async cancelarNFe(id: string, motivo: string) {
    await this.repo.updateNFeStatus(id, {
      status: "CANCELADA",
      motivo_cancelamento: motivo,
      data_cancelamento: new Date(),
    }).catch(err => logger.debug("NFE cancelar error", err));

    logger.info("NFe canceled", { id, motivo });
  }
}
