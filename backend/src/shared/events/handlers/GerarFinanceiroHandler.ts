import { EventHandler } from '../EventHandler';
import { VendaRegistradaEvent } from '@/modules/pdv/domain/events/VendaRegistradaEvent';
import { ITransactionRepository } from '@/modules/financeiro/domain/repositories/ITransactionRepository';
import { Transaction } from '@/modules/financeiro/domain/entities/Transaction';
import { logger } from '@/infrastructure/logger';

export class GerarFinanceiroHandler implements EventHandler<VendaRegistradaEvent> {
  constructor(private transactionRepository: ITransactionRepository) {}

  async handle(event: VendaRegistradaEvent): Promise<void> {
    try {
      const transaction = Transaction.create({
        id: crypto.randomUUID(),
        clinicId: event.venda.clinicId,
        type: 'RECEITA',
        category: 'VENDA',
        amount: event.venda.totalFinal,
        description: 'Venda PDV - ' + event.venda.id,
        dueDate: new Date(),
        status: 'PENDENTE',
        patientId: event.venda.clienteId,
        appointmentId: null,
        paymentMethod: event.venda.formaPagamento,
        paidAt: null,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await this.transactionRepository.save(transaction);
      
      logger.info('Transação financeira criada após venda', {
        transactionId: transaction.id,
        vendaId: event.venda.id,
        amount: transaction.amount
      });
    } catch (error) {
      logger.error('Erro ao criar transação financeira', { error, event });
    }
  }
}
