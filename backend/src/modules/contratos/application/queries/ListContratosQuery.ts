import { IContratoRepository } from '../../domain/repositories/IContratoRepository';
import { ContratoDTO } from '../dto/ContratoDTO';

export interface ListContratosQuery {
  clinicId: string;
  pacienteId?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
  page: number;
  limit: number;
}

export interface ListContratosResult {
  items: ContratoDTO[];
  total: number;
  page: number;
  totalPages: number;
}

export class ListContratosQueryHandler {
  constructor(private contratoRepository: IContratoRepository) {}

  async execute(query: ListContratosQuery): Promise<ListContratosResult> {
    const { items, total } = await this.contratoRepository.findAll({
      clinicId: query.clinicId,
      pacienteId: query.pacienteId,
      status: query.status,
      startDate: query.startDate,
      endDate: query.endDate,
      skip: (query.page - 1) * query.limit,
      take: query.limit
    });

    return {
      items: items.map(ContratoDTO.fromEntity),
      total,
      page: query.page,
      totalPages: Math.ceil(total / query.limit)
    };
  }
}
