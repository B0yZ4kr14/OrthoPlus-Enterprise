import { IVendaRepository } from '../../domain/repositories/IVendaRepository';
import { VendaDTO } from '../dto/VendaDTO';

export interface ListVendasQuery {
  clinicId: string;
  caixaId?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
  page: number;
  limit: number;
}

export interface ListVendasResult {
  items: VendaDTO[];
  total: number;
  page: number;
  totalPages: number;
}

export class ListVendasQueryHandler {
  constructor(private vendaRepository: IVendaRepository) {}

  async execute(query: ListVendasQuery): Promise<ListVendasResult> {
    const { items, total } = await this.vendaRepository.findAll({
      clinicId: query.clinicId,
      caixaId: query.caixaId,
      status: query.status,
      startDate: query.startDate,
      endDate: query.endDate,
      skip: (query.page - 1) * query.limit,
      take: query.limit
    });

    return {
      items: items.map(VendaDTO.fromEntity),
      total,
      page: query.page,
      totalPages: Math.ceil(total / query.limit)
    };
  }
}
