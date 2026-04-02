import { DomainEvent } from '@/shared/events/DomainEvent';
import { Produto } from '../entities/Produto';

export class ProdutoCriadoEvent extends DomainEvent {
  constructor(public readonly produto: Produto) {
    super('Inventario.ProdutoCriado', produto.id);
  }
}
