import { Produto } from '../../domain/entities/Produto';

export class ProdutoDTO {
  constructor(
    public readonly id: string,
    public readonly nome: string,
    public readonly codigo: string,
    public readonly descricao: string | null,
    public readonly categoria: string,
    public readonly unidadeMedida: string,
    public readonly precoCusto: number,
    public readonly precoVenda: number,
    public readonly quantidadeMinima: number,
    public readonly quantidadeAtual: number,
    public readonly status: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  static fromEntity(produto: Produto): ProdutoDTO {
    return new ProdutoDTO(
      produto.id,
      produto.nome,
      produto.codigo,
      produto.descricao,
      produto.categoria,
      produto.unidadeMedida,
      produto.precoCusto,
      produto.precoVenda,
      produto.quantidadeMinima,
      produto.quantidadeAtual,
      produto.status,
      produto.createdAt,
      produto.updatedAt
    );
  }
}
