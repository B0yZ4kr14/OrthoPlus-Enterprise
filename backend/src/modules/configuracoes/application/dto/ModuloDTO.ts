import { Modulo } from '../../domain/entities/Modulo';

export class ModuloDTO {
  constructor(
    public readonly id: string,
    public moduleKey: string,
    public nome: string,
    public descricao: string,
    public categoria: string,
    public isActive: boolean,
    public dependencies: Array<{ moduleKey: string; required: boolean }>,
    public configuracoes: Record<string, any>
  ) {}

  static fromEntity(modulo: Modulo): ModuloDTO {
    return new ModuloDTO(
      modulo.id,
      modulo.moduleKey,
      modulo.nome,
      modulo.descricao,
      modulo.categoria,
      modulo.isActive,
      modulo.dependencies,
      modulo.configuracoes
    );
  }
}
