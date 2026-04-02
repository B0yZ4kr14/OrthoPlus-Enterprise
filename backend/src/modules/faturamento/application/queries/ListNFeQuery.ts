import { INFeRepository } from '../../domain/repositories/INFeRepository';
import { NFeDTO } from '../dto/NFeDTO';

export interface ListNFeQuery {
  clinicId: string;
  status?: string;
  clienteId?: string;
  startDate?: Date;
  endDate?: Date;
  page: number;
  limit: number;
}

export interface ListNFeResult {
  items: NFeDTO[];
  total: number;
  page: number;
  totalPages: number;
}

export class ListNFeQueryHandler {
  constructor(private nfeRepository: INFeRepository) {}

  async execute(query: ListNFeQuery): Promise<ListNFeResult> {
    const { items, total } = await this.nfeRepository.findAll({
      clinicId: query.clinicId,
      status: query.status,
      clienteId: query.clienteId,
      startDate: query.startDate,
      endDate: query.endDate,
      skip: (query.page - 1) * query.limit,
      take: query.limit
    });

    return {
      items: items.map(NFeDTO.fromEntity),
      total,
      page: query.page,
      totalPages: Math.ceil(total / query.limit)
    };
  }
}
