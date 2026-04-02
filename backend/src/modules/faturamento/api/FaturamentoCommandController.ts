import { Request, Response } from 'express';
import { EmitirNFeCommandHandler, EmitirNFeCommand } from '../application/commands/EmitirNFeCommand';
import { AutorizarNFeCommandHandler, AutorizarNFeCommand } from '../application/commands/AutorizarNFeCommand';
import { logger } from '@/infrastructure/logger';

export class FaturamentoCommandController {
  constructor(
    private emitirHandler: EmitirNFeCommandHandler,
    private autorizarHandler: AutorizarNFeCommandHandler
  ) {}

  async emitir(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;
      
      const command: EmitirNFeCommand = {
        ...req.body,
        clinicId: user.clinicId,
        createdBy: user.id
      };

      const result = await this.emitirHandler.execute(command);

      res.status(201).json({
        success: true,
        data: result,
        message: 'NFe emitida com sucesso'
      });
    } catch (error: any) {
      logger.error('Erro no controller emitir NFe', { error });
      res.status(400).json({
        success: false,
        error: "Erro ao emitir NFe"
      });
    }
  }

  async autorizar(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;
      const { id } = req.params;
      
      const command: AutorizarNFeCommand = {
        ...req.body,
        nfeId: id,
        clinicId: user.clinicId,
        updatedBy: user.id
      };

      await this.autorizarHandler.execute(command);

      res.status(200).json({
        success: true,
        message: 'NFe autorizada com sucesso'
      });
    } catch (error: any) {
      logger.error('Erro no controller autorizar NFe', { error });
      res.status(400).json({
        success: false,
        error: "Erro ao autorizar NFe"
      });
    }
  }
}
