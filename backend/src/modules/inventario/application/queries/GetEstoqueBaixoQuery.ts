import { IProdutoRepository } from '../../domain/repositories/IProdutoRepository';
import { ProdutoDTO } from '../dto/ProdutoDTO';

export interface GetEstoqueBaixoQuery {
  clinicId: string;
  limiteMinimo?: number;
}

export class GetEstoqueBaixoQueryHandler {
  constructor(private produtoRepository: IProdutoRepository) {}

  async execute(query: GetEstoqueBaixoQuery): Promise<ProdutoDTO[]> {
    const produtos = await this.produtoRepository.findEstoqueBaixo(
      query.clinicId,
      query.limiteMinimo
    );

    return produtos.map(ProdutoDTO.fromEntity);
  }
}
