import { EventHandler } from '../EventHandler';
import { VendaRegistradaEvent } from '@/modules/pdv/domain/events/VendaRegistradaEvent';
import { IProdutoRepository } from '@/modules/inventario/domain/repositories/IProdutoRepository';
import { logger } from '@/infrastructure/logger';

export class AtualizarEstoqueHandler implements EventHandler<VendaRegistradaEvent> {
  constructor(private produtoRepository: IProdutoRepository) {}

  async handle(event: VendaRegistradaEvent): Promise<void> {
    try {
      for (const item of event.venda.items) {
        const produto = await this.produtoRepository.findById(item.produtoId);
        
        if (produto) {
          produto.removerEstoque(item.quantidade);
          await this.produtoRepository.update(produto);
          
          logger.info('Estoque atualizado após venda', {
            produtoId: produto.id,
            quantidadeRemovida: item.quantidade,
            vendaId: event.venda.id
          });
        }
      }
    } catch (error) {
      logger.error('Erro ao atualizar estoque após venda', { error, event });
      // Não lançar erro para não interromper o fluxo principal
    }
  }
}
