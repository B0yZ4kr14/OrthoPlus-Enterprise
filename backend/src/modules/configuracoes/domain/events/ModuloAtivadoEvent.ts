import { DomainEvent } from '@/shared/events/DomainEvent';
import { Modulo } from '../entities/Modulo';

export class ModuloAtivadoEvent extends DomainEvent {
  constructor(public readonly modulo: Modulo) {
    super('Configuracoes.ModuloAtivado', modulo.id);
  }
}
