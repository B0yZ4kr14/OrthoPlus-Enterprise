import { Request, Response } from "express";
import { asyncHandler } from "@/middleware/errorHandler";
import { IGamificationRepository } from "@/modules/faturamento/domain/repositories/IGamificationRepository";
import { GamificationRepository } from "@/modules/faturamento/infrastructure/GamificationRepository";

export class GamificationWorkerController {
  constructor(
    private repo: IGamificationRepository = new GamificationRepository(),
  ) {}

  processGoalsAndRankings = asyncHandler(
    async (_req: Request, res: Response): Promise<void> => {
      const clinics = await this.repo.findAllClinics();

      for (const clinic of clinics) {
        const metas = await this.repo.findActiveMetas(clinic.id);

        for (const meta of metas) {
          const vendas = await this.repo.findVendasByVendedor(
            clinic.id,
            meta.vendedor_id,
            meta.periodo_inicio,
            meta.periodo_fim,
          );

          const valor_atingido = vendas.reduce(
            (sum: number, v: Record<string, unknown>) => sum + (parseFloat(String(v.valor_total || 0)) || 0),
            0,
          );
          const quantidade_atingida = vendas.length;
          const percentual_atingido = (valor_atingido / meta.meta_valor) * 100;

          let status = "EM_ANDAMENTO";
          if (new Date() > new Date(meta.periodo_fim)) {
            if (percentual_atingido >= 100) {
              status = percentual_atingido >= 120 ? "SUPERADA" : "ATINGIDA";
            } else {
              status = "NAO_ATINGIDA";
            }
          }

          await this.repo.updateMeta(meta.id, {
            valor_atingido,
            quantidade_atingida,
            percentual_atingido,
            status,
          });

          if (
            (status === "ATINGIDA" || status === "SUPERADA") &&
            !meta.premiacao_paga
          ) {
            const premiacao = await this.repo.findPremiacao(
              clinic.id,
              percentual_atingido,
            );

            if (premiacao) {
              await this.repo.updateMeta(meta.id, {
                premiacao_id: premiacao.id,
                premiacao_paga: false,
              });

              await this.repo.createAuditLog({
                clinic_id: clinic.id,
                user_id: meta.vendedor_id,
                action: "META_ATINGIDA",
                details: {
                  meta_id: meta.id,
                  premiacao_id: premiacao.id,
                  percentual_atingido,
                  tipo_premiacao: premiacao.tipo,
                },
              });
            }
          }
        }

        const hoje = new Date();
        const periodos = [
          { nome: "DIA", data: hoje.toISOString().split("T")[0] },
          { nome: "SEMANA", data: hoje.toISOString().split("T")[0] },
          { nome: "MES", data: hoje.toISOString().split("T")[0] },
        ];

        for (const periodo of periodos) {
          const dataInicio = new Date(hoje);
          if (periodo.nome === "DIA") {
            dataInicio.setHours(0, 0, 0, 0);
          } else if (periodo.nome === "SEMANA") {
            dataInicio.setDate(hoje.getDate() - 7);
          } else if (periodo.nome === "MES") {
            dataInicio.setMonth(hoje.getMonth() - 1);
          }

          const vendasPeriodo = await this.repo.findVendasForRanking(
            clinic.id,
            dataInicio,
          );

          const vendedoresMap = new Map();
          vendasPeriodo.forEach((venda: Record<string, unknown>) => {
            const createdBy = venda.created_by as string;
            if (!vendedoresMap.has(createdBy)) {
              vendedoresMap.set(createdBy, {
                total_vendas: 0,
                quantidade_vendas: 0,
              });
            }
            const v = vendedoresMap.get(createdBy) as { total_vendas: number; quantidade_vendas: number };
            v.total_vendas += parseFloat(String(venda.valor_total || 0));
            v.quantidade_vendas += 1;
          });

          const ranking = Array.from(vendedoresMap.entries())
            .map(([vendedor_id, stats]) => ({
              vendedor_id,
              total_vendas: (stats as Record<string, unknown>).total_vendas as number,
              quantidade_vendas: (stats as Record<string, unknown>).quantidade_vendas as number,
              ticket_medio: stats.total_vendas / stats.quantidade_vendas,
            }))
            .sort((a, b) => b.total_vendas - a.total_vendas);

          for (let i = 0; i < ranking.length; i++) {
            const vendedor = ranking[i];
            const posicao = i + 1;
            let badge = null;
            if (posicao === 1) badge = "OURO";
            else if (posicao === 2) badge = "PRATA";
            else if (posicao === 3) badge = "BRONZE";

            const pontos =
              Math.floor(vendedor.total_vendas / 10) +
              vendedor.quantidade_vendas * 5;

            const existing = await this.repo.findRankingEntry(
              clinic.id,
              vendedor.vendedor_id,
              periodo.nome,
              periodo.data,
            );

            if (existing) {
              await this.repo.updateRanking(existing.id, {
                posicao,
                pontos,
                total_vendas: vendedor.total_vendas,
                quantidade_vendas: vendedor.quantidade_vendas,
                ticket_medio: vendedor.ticket_medio,
                badge,
              });
            } else {
              await this.repo.createRanking({
                clinic_id: clinic.id,
                vendedor_id: vendedor.vendedor_id,
                periodo: periodo.nome,
                data_referencia: periodo.data,
                posicao,
                pontos,
                total_vendas: vendedor.total_vendas,
                quantidade_vendas: vendedor.quantidade_vendas,
                ticket_medio: vendedor.ticket_medio,
                badge,
              });
            }
          }
        }
      }

      res
        .status(200)
        .json({ success: true, message: "Processamento concluído" });
    },
  );
}
