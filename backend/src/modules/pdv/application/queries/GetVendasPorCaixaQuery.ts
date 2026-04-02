import { IVendaRepository } from '../../domain/repositories/IVendaRepository';
import { VendaDTO } from '../dto/VendaDTO';

export interface GetVendasPorCaixaQuery {
  caixaId: string;
  clinicId: string;
  status?: string;
}

export interface ResumoCaixa {
  vendas: VendaDTO[];
  totalVendas: number;
  totalDinheiro: number;
  totalCartao: number;
  totalPix: number;
  totalCrypto: number;
}

export class GetVendasPorCaixaQueryHandler {
  constructor(private vendaRepository: IVendaRepository) {}

  async execute(query: GetVendasPorCaixaQuery): Promise<ResumoCaixa> {
    const { items } = await this.vendaRepository.findAll({
      clinicId: query.clinicId,
      caixaId: query.caixaId,
      status: query.status || 'CONCLUIDA'
    });

    const vendas = items.map(VendaDTO.fromEntity);
    
    const totalDinheiro = items
      .filter(v => v.formaPagamento === 'DINHEIRO')
      .reduce((sum, v) => sum + v.totalFinal, 0);
    
    const totalCartao = items
      .filter(v => v.formaPagamento === 'CARTAO_CREDITO' || v.formaPagamento === 'CARTAO_DEBITO')
      .reduce((sum, v) => sum + v.totalFinal, 0);
    
    const totalPix = items
      .filter(v => v.formaPagamento === 'PIX')
      .reduce((sum, v) => sum + v.totalFinal, 0);
    
    const totalCrypto = items
      .filter(v => v.formaPagamento === 'CRYPTO')
      .reduce((sum, v) => sum + v.totalFinal, 0);

    return {
      vendas,
      totalVendas: items.reduce((sum, v) => sum + v.totalFinal, 0),
      totalDinheiro,
      totalCartao,
      totalPix,
      totalCrypto
    };
  }
}
