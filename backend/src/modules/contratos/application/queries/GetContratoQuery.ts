import { IContratoRepository } from '../../domain/repositories/IContratoRepository';
import { ContratoDTO } from '../dto/ContratoDTO';

export interface GetContratoQuery {
  id: string;
  clinicId: string;
}

export class GetContratoQueryHandler {
  constructor(private contratoRepository: IContratoRepository) {}

  async execute(query: GetContratoQuery): Promise<ContratoDTO | null> {
    const contrato = await this.contratoRepository.findById(query.id);
    
    if (!contrato || contrato.clinicId !== query.clinicId) {
      return null;
    }

    return ContratoDTO.fromEntity(contrato);
  }
}
