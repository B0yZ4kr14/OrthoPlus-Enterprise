import { DomainEvent } from '@/shared/events/DomainEvent';
import { Produto } from '../entities/Produto';

export class EstoqueAlteradoEvent extends DomainEvent {
  constructor(
    public readonly produto: Produto,
    public readonly quantidadeAnterior: number,
    public readonly quantidadeNova: number,
    public readonly tipo: 'ENTRADA' | 'SAIDA' | 'AJUSTE',
    public readonly motivo?: string
  ) {
    super('Inventario.EstoqueAlterado', produto.id);
  }
}
