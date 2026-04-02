/**
 * MÓDULO INVENTÁRIO - Use Case: Cadastrar Produto
 */

import { randomUUID } from 'crypto';
import { Produto } from '../../domain/entities/Produto';
import { IProdutoRepository } from '../../domain/repositories/IProdutoRepository';

interface CadastrarProdutoDTO {
  clinicId: string;
  codigo: string;
  nome: string;
  descricao?: string;
  categoriaId?: string;
  fornecedorId?: string;
  unidadeMedida: string;
  quantidadeEstoque: number;
  quantidadeMinima: number;
  precoCusto?: number;
  precoVenda?: number;
  temNfe: boolean;
}

export class CadastrarProdutoUseCase {
  constructor(private produtoRepository: IProdutoRepository) {}

  async execute(dto: CadastrarProdutoDTO): Promise<Produto> {
    // Verificar duplicação por código
    const produtoExistente = await this.produtoRepository.findByCodigo(dto.codigo, dto.clinicId);
    if (produtoExistente) {
      throw new Error(`Já existe um produto com o código ${dto.codigo}`);
    }

    // Criar entidade
    const produto = Produto.create({
      id: randomUUID(),
      clinicId: dto.clinicId,
      codigo: dto.codigo,
      nome: dto.nome,
      descricao: dto.descricao ?? null,
      categoria: dto.categoriaId ?? 'GERAL',
      unidadeMedida: dto.unidadeMedida,
      quantidadeMinima: dto.quantidadeMinima,
      quantidadeAtual: dto.quantidadeEstoque,
      precoCusto: dto.precoCusto ?? 0,
      precoVenda: dto.precoVenda ?? 0,
      status: dto.temNfe ? 'ATIVO_NF' : 'ATIVO',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Calcular margem de lucro se preços informados
    if (dto.precoCusto && dto.precoVenda) {
      produto.atualizarPrecos(dto.precoCusto, dto.precoVenda);
    }

    // Persistir
    await this.produtoRepository.save(produto);

    return produto;
  }
}
