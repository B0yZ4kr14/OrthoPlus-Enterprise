import { Request, Response } from 'express';
import { CreateVendaCommandHandler, CreateVendaCommand } from '../application/commands/CreateVendaCommand';
import { ConcluirVendaCommandHandler, ConcluirVendaCommand } from '../application/commands/ConcluirVendaCommand';
import { logger } from '@/infrastructure/logger';

export class PdvCommandController {
  constructor(
    private createHandler: CreateVendaCommandHandler,
    private concluirHandler: ConcluirVendaCommandHandler
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;
      
      const command: CreateVendaCommand = {
        caixaId: req.body.caixaId,
        items: req.body.items,
        clienteId: req.body.clienteId,
        observacoes: req.body.observacoes,
        clinicId: user.clinicId,
        createdBy: user.id
      };

      const result = await this.createHandler.execute(command);

      res.status(201).json({
        success: true,
        data: result,
        message: 'Venda criada com sucesso'
      });
    } catch (error: unknown) {
      logger.error('Erro no controller create venda', { error });
      res.status(400).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async concluir(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;
      const { id } = req.params;
      
      const command: ConcluirVendaCommand = {
        vendaId: id,
        formaPagamento: req.body.formaPagamento,
        clinicId: user.clinicId,
        updatedBy: user.id
      };

      await this.concluirHandler.execute(command);

      res.status(200).json({
        success: true,
        message: 'Venda concluída com sucesso'
      });
    } catch (error: unknown) {
      logger.error('Erro no controller concluir venda', { error });
      res.status(400).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}
