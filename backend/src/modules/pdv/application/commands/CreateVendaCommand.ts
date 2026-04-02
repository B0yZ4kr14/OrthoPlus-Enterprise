import { IVendaRepository } from '../../domain/repositories/IVendaRepository';
import { Venda, ItemVenda } from '../../domain/entities/Venda';
import { logger } from '@/infrastructure/logger';
import { EventBus } from '@/shared/events/EventBus';
import { VendaRegistradaEvent } from '../../domain/events/VendaRegistradaEvent';

export interface CreateVendaCommand {
  caixaId: string;
  items: ItemVenda[];
  clienteId?: string;
  observacoes?: string;
  clinicId: string;
  createdBy: string;
}

export class CreateVendaCommandHandler {
  constructor(
    private vendaRepository: IVendaRepository,
    private eventBus: EventBus
  ) {}

  async execute(command: CreateVendaCommand): Promise<Venda> {
    try {
      const total = command.items.reduce((sum, item) => sum + item.total, 0);
      
      const venda = Venda.create({
        id: crypto.randomUUID(),
        clinicId: command.clinicId,
        caixaId: command.caixaId,
        items: command.items,
        total,
        desconto: 0,
        totalFinal: total,
        formaPagamento: 'DINHEIRO',
        status: 'PENDENTE',
        clienteId: command.clienteId || null,
        observacoes: command.observacoes || null,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await this.vendaRepository.save(venda);
      await this.eventBus.publish(new VendaRegistradaEvent(venda));
      
      logger.info('Venda criada', { vendaId: venda.id, total: venda.total });
      return venda;
    } catch (error) {
      logger.error('Erro ao criar venda', { error, command });
      throw error;
    }
  }
}
