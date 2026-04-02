import { DomainEvent } from '@/shared/events/DomainEvent';
import { Transaction } from '../entities/Transaction';

export class TransactionCreatedEvent extends DomainEvent {
  constructor(public readonly transaction: Transaction) {
    super('Financeiro.TransactionCreated', transaction.id);
  }
}
