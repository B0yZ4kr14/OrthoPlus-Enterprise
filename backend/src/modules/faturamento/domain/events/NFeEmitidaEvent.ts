import { DomainEvent } from '@/shared/events/DomainEvent';
import { NFe } from '../entities/NFe';

export class NFeEmitidaEvent extends DomainEvent {
  constructor(public readonly nfe: NFe) {
    super('Faturamento.NFeEmitida', nfe.id);
  }
}
