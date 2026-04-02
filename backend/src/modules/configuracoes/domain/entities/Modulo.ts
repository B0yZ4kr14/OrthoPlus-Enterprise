export interface ModuloDependency {
  moduleKey: string;
  required: boolean;
}

export class Modulo {
  constructor(
    public readonly id: string,
    public readonly clinicId: string,
    public moduleKey: string,
    public nome: string,
    public descricao: string,
    public categoria: 'CLINICA' | 'FINANCEIRO' | 'MARKETING' | 'COMPLIANCE' | 'INOVACAO',
    public isActive: boolean,
    public dependencies: ModuloDependency[],
    public configuracoes: Record<string, any>,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}

  static create(props: Omit<Modulo, 'ativar' | 'desativar' | 'atualizarConfiguracao' | 'temDependencia'>): Modulo {
    return new Modulo(
      props.id,
      props.clinicId,
      props.moduleKey,
      props.nome,
      props.descricao,
      props.categoria,
      props.isActive,
      props.dependencies,
      props.configuracoes,
      props.createdAt,
      props.updatedAt
    );
  }

  ativar(): void {
    this.isActive = true;
    this.updatedAt = new Date();
  }

  desativar(): void {
    this.isActive = false;
    this.updatedAt = new Date();
  }

  atualizarConfiguracao(config: Record<string, any>): void {
    this.configuracoes = { ...this.configuracoes, ...config };
    this.updatedAt = new Date();
  }

  temDependencia(moduleKey: string): boolean {
    return this.dependencies.some(dep => dep.moduleKey === moduleKey);
  }
}
