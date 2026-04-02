import { IProdutoRepository } from '../../domain/repositories/IProdutoRepository';
import { randomUUID } from 'crypto';
import { Produto } from '../../domain/entities/Produto';
import { logger } from '@/infrastructure/logger';
import { EventBus } from '@/shared/events/EventBus';
import { ProdutoCriadoEvent } from '../../domain/events/ProdutoCriadoEvent';

export interface CreateProdutoCommand {
  nome: string;
  codigo: string;
  descricao?: string;
  categoria: string;
  unidadeMedida: string;
  precoCusto: number;
  precoVenda: number;
  quantidadeMinima: number;
  quantidadeAtual: number;
  clinicId: string;
  createdBy: string;
}

export class CreateProdutoCommandHandler {
  constructor(
    private produtoRepository: IProdutoRepository,
    private eventBus: EventBus
  ) {}

  async execute(command: CreateProdutoCommand): Promise<Produto> {
    try {
      // Validar se código já existe
      const existingProduto = await this.produtoRepository.findByCodigo(command.codigo, command.clinicId);
      if (existingProduto) {
        throw new Error('Produto com este código já existe');
      }

      const produto = Produto.create({
        ...command,
        descricao: command.descricao ?? null,
        id: randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'ATIVO'
      });

      await this.produtoRepository.save(produto);
      
      // Publicar evento de domínio
      await this.eventBus.publish(new ProdutoCriadoEvent(produto));
      
      logger.info('Produto criado com sucesso', { 
        produtoId: produto.id,
        codigo: command.codigo,
        clinicId: command.clinicId 
      });

      return produto;
    } catch (error: unknown) {
      logger.error('Erro ao criar produto', { error, command });
      throw error;
    }
  }
}
