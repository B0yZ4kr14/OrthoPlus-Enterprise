import { IVendaRepository } from '../../domain/repositories/IVendaRepository';
import { VendaDTO } from '../dto/VendaDTO';

export interface GetVendaQuery {
  id: string;
  clinicId: string;
}

export class GetVendaQueryHandler {
  constructor(private vendaRepository: IVendaRepository) {}

  async execute(query: GetVendaQuery): Promise<VendaDTO | null> {
    const venda = await this.vendaRepository.findById(query.id);
    
    if (!venda || venda.clinicId !== query.clinicId) {
      return null;
    }

    return VendaDTO.fromEntity(venda);
  }
}
