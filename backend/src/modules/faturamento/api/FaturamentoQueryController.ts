import { Request, Response } from 'express';
import { GetNFeQueryHandler, GetNFeQuery } from '../application/queries/GetNFeQuery';
import { ListNFeQueryHandler, ListNFeQuery } from '../application/queries/ListNFeQuery';
import { GetNFePorStatusQueryHandler, GetNFePorStatusQuery } from '../application/queries/GetNFePorStatusQuery';
import { logger } from '@/infrastructure/logger';

export class FaturamentoQueryController {
  constructor(
    private getHandler: GetNFeQueryHandler,
    private listHandler: ListNFeQueryHandler,
    private porStatusHandler: GetNFePorStatusQueryHandler
  ) {}

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;
      const { id } = req.params;
      
      const query: GetNFeQuery = {
        id,
        clinicId: user.clinicId
      };

      const result = await this.getHandler.execute(query);

      if (!result) {
        res.status(404).json({
          success: false,
          error: 'NFe não encontrada'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      logger.error('Erro no controller get NFe', { error });
      res.status(500).json({
        success: false,
        error: "Erro ao buscar NFe"
      });
    }
  }

  async list(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;
      const { page = '1', limit = '10', status, clienteId, startDate, endDate } = req.query;
      
      const query: ListNFeQuery = {
        clinicId: user.clinicId,
        status: status as string,
        clienteId: clienteId as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10)
      };

      const result = await this.listHandler.execute(query);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      logger.error('Erro no controller list NFe', { error });
      res.status(500).json({
        success: false,
        error: "Erro ao listar NFe"
      });
    }
  }

  async getPorStatus(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;
      const { status } = req.params;
      
      const query: GetNFePorStatusQuery = {
        clinicId: user.clinicId,
        status: status as any
      };

      const result = await this.porStatusHandler.execute(query);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      logger.error('Erro no controller get NFe por status', { error });
      res.status(500).json({
        success: false,
        error: "Erro ao buscar NFe por status"
      });
    }
  }
}
