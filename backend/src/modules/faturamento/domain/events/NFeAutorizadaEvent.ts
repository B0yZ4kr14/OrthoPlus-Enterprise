import { DomainEvent } from '@/shared/events/DomainEvent';
import { NFe } from '../entities/NFe';

export class NFeAutorizadaEvent extends DomainEvent {
  constructor(
    public readonly nfe: NFe,
    public readonly protocolo: string
  ) {
    super('Faturamento.NFeAutorizada', nfe.id);
  }
}
