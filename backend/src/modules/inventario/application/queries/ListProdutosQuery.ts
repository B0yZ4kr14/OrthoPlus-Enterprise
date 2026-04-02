import { IProdutoRepository } from '../../domain/repositories/IProdutoRepository';
import { ProdutoDTO } from '../dto/ProdutoDTO';

export interface ListProdutosQuery {
  clinicId: string;
  categoria?: string;
  status?: string;
  searchTerm?: string;
  page: number;
  limit: number;
}

export interface ListProdutosResult {
  items: ProdutoDTO[];
  total: number;
  page: number;
  totalPages: number;
}

export class ListProdutosQueryHandler {
  constructor(private produtoRepository: IProdutoRepository) {}

  async execute(query: ListProdutosQuery): Promise<ListProdutosResult> {
    const { items, total } = await this.produtoRepository.findAll({
      clinicId: query.clinicId,
      categoria: query.categoria,
      status: query.status,
      searchTerm: query.searchTerm,
      skip: (query.page - 1) * query.limit,
      take: query.limit
    });

    return {
      items: items.map(ProdutoDTO.fromEntity),
      total,
      page: query.page,
      totalPages: Math.ceil(total / query.limit)
    };
  }
}
