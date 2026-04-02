import { IVendaRepository } from '../../domain/repositories/IVendaRepository';
import { logger } from '@/infrastructure/logger';

export interface ConcluirVendaCommand {
  vendaId: string;
  formaPagamento: 'DINHEIRO' | 'CARTAO_CREDITO' | 'CARTAO_DEBITO' | 'PIX' | 'CRYPTO';
  clinicId: string;
  updatedBy: string;
}

export class ConcluirVendaCommandHandler {
  constructor(private vendaRepository: IVendaRepository) {}

  async execute(command: ConcluirVendaCommand): Promise<void> {
    try {
      const venda = await this.vendaRepository.findById(command.vendaId);
      
      if (!venda || venda.clinicId !== command.clinicId) {
        throw new Error('Venda não encontrada');
      }

      venda.concluir(command.formaPagamento);
      await this.vendaRepository.update(venda);
      
      logger.info('Venda concluída', { vendaId: venda.id, formaPagamento: command.formaPagamento });
    } catch (error) {
      logger.error('Erro ao concluir venda', { error, command });
      throw error;
    }
  }
}
