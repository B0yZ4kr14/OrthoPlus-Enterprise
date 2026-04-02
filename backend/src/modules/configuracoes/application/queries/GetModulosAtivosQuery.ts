import { IModuloRepository } from '../../domain/repositories/IModuloRepository';
import { ModuloDTO } from '../dto/ModuloDTO';

export interface GetModulosAtivosQuery {
  clinicId: string;
}

export class GetModulosAtivosQueryHandler {
  constructor(private moduloRepository: IModuloRepository) {}

  async execute(query: GetModulosAtivosQuery): Promise<ModuloDTO[]> {
    const { items } = await this.moduloRepository.findAll({
      clinicId: query.clinicId,
      onlyActive: true
    });

    return items.map(ModuloDTO.fromEntity);
  }
}
