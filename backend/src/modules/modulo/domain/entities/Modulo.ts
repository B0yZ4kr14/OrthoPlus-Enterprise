// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class Modulo {
  constructor(
    public readonly id: string,
    public nome: string,
    public descricao: string,
    public icone: string,
    public cor: string,
    public ordem: number,
    public categoria: string,
    public status: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public permissoes: any,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static create(props: Omit<Modulo, 'ativar' | 'desativar'>): Modulo {
    return new Modulo(
      props.id,
      props.nome,
      props.descricao,
      props.icone,
      props.cor,
      props.ordem,
      props.categoria,
      props.status,
      props.permissoes,
      props.createdAt,
      props.updatedAt
    );
  }

  ativar(): void {
    this.status = 'ATIVO';
    this.updatedAt = new Date();
  }

  desativar(): void {
    this.status = 'INATIVO';
    this.updatedAt = new Date();
  }
}
