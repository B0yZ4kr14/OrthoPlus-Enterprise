import { INFeRepository } from '../../domain/repositories/INFeRepository';
import { NFeDTO } from '../dto/NFeDTO';

export interface GetNFeQuery {
  id: string;
  clinicId: string;
}

export class GetNFeQueryHandler {
  constructor(private nfeRepository: INFeRepository) {}

  async execute(query: GetNFeQuery): Promise<NFeDTO | null> {
    const nfe = await this.nfeRepository.findById(query.id);
    
    if (!nfe || nfe.clinicId !== query.clinicId) {
      return null;
    }

    return NFeDTO.fromEntity(nfe);
  }
}
