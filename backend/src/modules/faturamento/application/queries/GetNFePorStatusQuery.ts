import { INFeRepository } from '../../domain/repositories/INFeRepository';
import { NFeDTO } from '../dto/NFeDTO';

export interface GetNFePorStatusQuery {
  clinicId: string;
  status: 'RASCUNHO' | 'EMITIDA' | 'AUTORIZADA' | 'CANCELADA' | 'DENEGADA';
}

export interface NFePorStatusResult {
  status: string;
  quantidade: number;
  valorTotal: number;
  items: NFeDTO[];
}

export class GetNFePorStatusQueryHandler {
  constructor(private nfeRepository: INFeRepository) {}

  async execute(query: GetNFePorStatusQuery): Promise<NFePorStatusResult> {
    const { items } = await this.nfeRepository.findAll({
      clinicId: query.clinicId,
      status: query.status
    });

    const valorTotal = items.reduce((sum, nfe) => sum + nfe.valorTotal, 0);

    return {
      status: query.status,
      quantidade: items.length,
      valorTotal,
      items: items.map(NFeDTO.fromEntity)
    };
  }
}
