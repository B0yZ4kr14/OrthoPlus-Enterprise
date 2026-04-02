import { EventHandler } from '../EventHandler';
import { EstoqueAlteradoEvent } from '@/modules/inventario/domain/events/EstoqueAlteradoEvent';
import { logger } from '@/infrastructure/logger';
import { prisma } from '@/infrastructure/database/prismaClient';

export class VerificarEstoqueMinimoHandler implements EventHandler<EstoqueAlteradoEvent> {
  async handle(event: EstoqueAlteradoEvent): Promise<void> {
    try {
      if (event.produto.estaEmEstoqueBaixo()) {
        logger.warn('Estoque abaixo do mínimo detectado', {
          produtoId: event.produto.id,
          produtoNome: event.produto.nome,
          quantidadeAtual: event.produto.quantidadeAtual,
          quantidadeMinima: event.produto.quantidadeMinima
        });
        
        // Create notification for low stock
        const clinicId = event.produto.clinicId;
        const isCritical = event.produto.quantidadeAtual === 0;
        const titulo = isCritical ? '🚨 Estoque Crítico' : '⚠️ Estoque Baixo';
        const mensagem = isCritical
          ? `CRÍTICO: ${event.produto.nome} sem estoque!`
          : `Estoque mínimo: ${event.produto.nome} (${event.produto.quantidadeAtual}/${event.produto.quantidadeMinima} un)`;

        await prisma.$queryRaw`
          INSERT INTO notifications (clinic_id, tipo, titulo, mensagem, link_acao)
          VALUES (${clinicId}, 'ALERTA', ${titulo}, ${mensagem}, '/estoque')
        `;
      }
    } catch (error) {
      logger.error('Erro ao verificar estoque mínimo', { error, event });
    }
  }
}
