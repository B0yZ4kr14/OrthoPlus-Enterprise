import { DomainEvent } from '@/shared/events/DomainEvent';
import { Venda } from '../entities/Venda';

export class VendaRegistradaEvent extends DomainEvent {
  constructor(public readonly venda: Venda) {
    super('PDV.VendaRegistrada', venda.id);
  }
}
