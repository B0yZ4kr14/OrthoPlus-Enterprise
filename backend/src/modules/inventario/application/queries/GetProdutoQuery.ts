import { IProdutoRepository } from '../../domain/repositories/IProdutoRepository';
import { ProdutoDTO } from '../dto/ProdutoDTO';

export interface GetProdutoQuery {
  id: string;
  clinicId: string;
}

export class GetProdutoQueryHandler {
  constructor(private produtoRepository: IProdutoRepository) {}

  async execute(query: GetProdutoQuery): Promise<ProdutoDTO | null> {
    const produto = await this.produtoRepository.findById(query.id);
    
    if (!produto || produto.clinicId !== query.clinicId) {
      return null;
    }

    return ProdutoDTO.fromEntity(produto);
  }
}
