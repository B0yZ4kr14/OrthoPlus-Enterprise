import { INFeRepository } from '../../domain/repositories/INFeRepository';
import { NFe, NFeItem } from '../../domain/entities/NFe';
import { logger } from '@/infrastructure/logger';
import { EventBus } from '@/shared/events/EventBus';
import { NFeEmitidaEvent } from '../../domain/events/NFeEmitidaEvent';
import { randomUUID } from 'crypto';

export interface EmitirNFeCommand {
  serie: string;
  clienteId: string;
  clienteNome: string;
  clienteCpfCnpj: string;
  items: NFeItem[];
  observacoes?: string;
  clinicId: string;
  createdBy: string;
}

export class EmitirNFeCommandHandler {
  constructor(
    private nfeRepository: INFeRepository,
    private eventBus: EventBus
  ) {}

  async execute(command: EmitirNFeCommand): Promise<NFe> {
    try {
      const numero = await this.gerarNumeroNFe(command.clinicId, command.serie);
      const valorTotal = command.items.reduce((sum, item) => sum + item.valorTotal, 0);
      
      const nfe = NFe.create({
        id: randomUUID(),
        clinicId: command.clinicId,
        numero,
        serie: command.serie,
        chaveAcesso: null,
        status: 'EMITIDA',
        clienteId: command.clienteId,
        clienteNome: command.clienteNome,
        clienteCpfCnpj: command.clienteCpfCnpj,
        items: command.items,
        valorTotal,
        valorIcms: valorTotal * 0.18, // Simplificado
        valorIpi: 0,
        dataEmissao: new Date(),
        dataAutorizacao: null,
        protocoloAutorizacao: null,
        observacoes: command.observacoes || null,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await this.nfeRepository.save(nfe);
      await this.eventBus.publish(new NFeEmitidaEvent(nfe));
      
      logger.info('NFe emitida', { nfeId: nfe.id, numero: nfe.numero });
      return nfe;
    } catch (error) {
      logger.error('Erro ao emitir NFe', { error, command });
      throw error;
    }
  }

  private async gerarNumeroNFe(_clinicId: string, _serie: string): Promise<string> {
    // TODO: Em produção, usar sequence do PostgreSQL para garantir unicidade
    const timestamp = Date.now();
    return String(timestamp);
  }
}
