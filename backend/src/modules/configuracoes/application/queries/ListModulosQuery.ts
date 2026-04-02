import { IModuloRepository } from '../../domain/repositories/IModuloRepository';
import { ModuloDTO } from '../dto/ModuloDTO';

export interface ListModulosQuery {
  clinicId: string;
  categoria?: string;
  onlyActive?: boolean;
}

export interface ListModulosResult {
  items: ModuloDTO[];
  total: number;
  ativos: number;
  inativos: number;
}

export class ListModulosQueryHandler {
  constructor(private moduloRepository: IModuloRepository) {}

  async execute(query: ListModulosQuery): Promise<ListModulosResult> {
    const { items } = await this.moduloRepository.findAll({
      clinicId: query.clinicId,
      categoria: query.categoria,
      onlyActive: query.onlyActive
    });

    const modulos = items.map(ModuloDTO.fromEntity);

    return {
      items: modulos,
      total: items.length,
      ativos: items.filter(m => m.isActive).length,
      inativos: items.filter(m => !m.isActive).length
    };
  }
}
