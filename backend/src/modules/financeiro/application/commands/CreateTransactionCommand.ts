import { randomUUID } from 'crypto';
import { ITransactionRepository } from '../../domain/repositories/ITransactionRepository';
import { Transaction } from '../../domain/entities/Transaction';
import { logger } from '@/infrastructure/logger';
import { EventBus } from '@/shared/events/EventBus';
import { TransactionCreatedEvent } from '../../domain/events/TransactionCreatedEvent';

export interface CreateTransactionCommand {
  type: 'RECEITA' | 'DESPESA';
  category: string;
  amount: number;
  description: string;
  dueDate: Date;
  patientId?: string;
  appointmentId?: string;
  paymentMethod?: string;
  clinicId: string;
  createdBy: string;
}

export class CreateTransactionCommandHandler {
  constructor(
    private transactionRepository: ITransactionRepository,
    private eventBus: EventBus
  ) {}

  async execute(command: CreateTransactionCommand): Promise<Transaction> {
    try {
      const transaction = Transaction.create({
        id: randomUUID(),
        ...command,
        patientId: command.patientId ?? null,
        appointmentId: command.appointmentId ?? null,
        paymentMethod: command.paymentMethod ?? null,
        status: 'PENDENTE',
        paidAt: null,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await this.transactionRepository.save(transaction);
      
      await this.eventBus.publish(new TransactionCreatedEvent(transaction));
      
      logger.info('Transação criada', { 
        transactionId: transaction.id,
        type: command.type,
        amount: command.amount,
        clinicId: command.clinicId 
      });

      return transaction;
    } catch (error) {
      logger.error('Erro ao criar transação', { error, command });
      throw error;
    }
  }
}
