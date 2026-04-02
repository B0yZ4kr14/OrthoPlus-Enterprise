import { IModuloRepository } from '../../domain/repositories/IModuloRepository';
import { ModuloDTO } from '../dto/ModuloDTO';

export interface GetModuloQuery {
  moduleKey: string;
  clinicId: string;
}

export class GetModuloQueryHandler {
  constructor(private moduloRepository: IModuloRepository) {}

  async execute(query: GetModuloQuery): Promise<ModuloDTO | null> {
    const modulo = await this.moduloRepository.findByModuleKey(query.moduleKey, query.clinicId);
    
    if (!modulo) {
      return null;
    }

    return ModuloDTO.fromEntity(modulo);
  }
}
