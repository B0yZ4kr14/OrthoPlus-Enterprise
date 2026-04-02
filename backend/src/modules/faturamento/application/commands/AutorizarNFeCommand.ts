import { INFeRepository } from '../../domain/repositories/INFeRepository';
import { logger } from '@/infrastructure/logger';
import { EventBus } from '@/shared/events/EventBus';
import { NFeAutorizadaEvent } from '../../domain/events/NFeAutorizadaEvent';

export interface AutorizarNFeCommand {
  nfeId: string;
  protocolo: string;
  chaveAcesso: string;
  clinicId: string;
  updatedBy: string;
}

export class AutorizarNFeCommandHandler {
  constructor(
    private nfeRepository: INFeRepository,
    private eventBus: EventBus
  ) {}

  async execute(command: AutorizarNFeCommand): Promise<void> {
    try {
      const nfe = await this.nfeRepository.findById(command.nfeId);
      
      if (!nfe || nfe.clinicId !== command.clinicId) {
        throw new Error('NFe não encontrada');
      }

      nfe.autorizar(command.protocolo, command.chaveAcesso);
      await this.nfeRepository.update(nfe);
      
      await this.eventBus.publish(new NFeAutorizadaEvent(nfe, command.protocolo));
      
      logger.info('NFe autorizada', { nfeId: nfe.id, protocolo: command.protocolo });
    } catch (error) {
      logger.error('Erro ao autorizar NFe', { error, command });
      throw error;
    }
  }
}
