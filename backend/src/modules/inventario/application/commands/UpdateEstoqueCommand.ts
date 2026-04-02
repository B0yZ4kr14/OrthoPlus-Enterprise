import { IProdutoRepository } from '../../domain/repositories/IProdutoRepository';
import { logger } from '@/infrastructure/logger';
import { EventBus } from '@/shared/events/EventBus';
import { EstoqueAlteradoEvent } from '../../domain/events/EstoqueAlteradoEvent';

export interface UpdateEstoqueCommand {
  produtoId: string;
  clinicId: string;
  quantidade: number;
  tipo: 'ENTRADA' | 'SAIDA' | 'AJUSTE';
  motivo?: string;
  updatedBy: string;
}

export class UpdateEstoqueCommandHandler {
  constructor(
    private produtoRepository: IProdutoRepository,
    private eventBus: EventBus
  ) {}

  async execute(command: UpdateEstoqueCommand): Promise<void> {
    try {
      const produto = await this.produtoRepository.findById(command.produtoId);
      
      if (!produto || produto.clinicId !== command.clinicId) {
        throw new Error('Produto não encontrado');
      }

      const quantidadeAnterior = produto.quantidadeAtual;
      
      // Atualizar estoque baseado no tipo
      switch (command.tipo) {
        case 'ENTRADA':
          produto.adicionarEstoque(command.quantidade);
          break;
        case 'SAIDA':
          produto.removerEstoque(command.quantidade);
          break;
        case 'AJUSTE':
          produto.ajustarEstoque(command.quantidade);
          break;
      }

      await this.produtoRepository.update(produto);
      
      // Publicar evento
      await this.eventBus.publish(new EstoqueAlteradoEvent(
        produto,
        quantidadeAnterior,
        produto.quantidadeAtual,
        command.tipo,
        command.motivo
      ));
      
      logger.info('Estoque atualizado', { 
        produtoId: produto.id,
        quantidadeAnterior,
        quantidadeNova: produto.quantidadeAtual,
        tipo: command.tipo
      });
    } catch (error) {
      logger.error('Erro ao atualizar estoque', { error, command });
      throw error;
    }
  }
}
