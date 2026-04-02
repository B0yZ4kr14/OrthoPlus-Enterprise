import { Request, Response } from 'express';
import { GetVendaQueryHandler, GetVendaQuery } from '../application/queries/GetVendaQuery';
import { ListVendasQueryHandler, ListVendasQuery } from '../application/queries/ListVendasQuery';
import { GetVendasPorCaixaQueryHandler, GetVendasPorCaixaQuery } from '../application/queries/GetVendasPorCaixaQuery';
import { logger } from '@/infrastructure/logger';

export class PdvQueryController {
  constructor(
    private getHandler: GetVendaQueryHandler,
    private listHandler: ListVendasQueryHandler,
    private porCaixaHandler: GetVendasPorCaixaQueryHandler
  ) {}

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;
      const { id } = req.params;
      
      const query: GetVendaQuery = {
        id,
        clinicId: user.clinicId
      };

      const result = await this.getHandler.execute(query);

      if (!result) {
        res.status(404).json({
          success: false,
          error: 'Venda não encontrada'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      logger.error('Erro no controller get venda', { error });
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async list(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;
      const { page = '1', limit = '10', caixaId, status, startDate, endDate } = req.query;
      
      const query: ListVendasQuery = {
        clinicId: user.clinicId,
        caixaId: caixaId as string,
        status: status as string,
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
      logger.error('Erro no controller list vendas', { error });
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async getPorCaixa(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;
      const { caixaId } = req.params;
      const { status } = req.query;
      
      const query: GetVendasPorCaixaQuery = {
        caixaId,
        clinicId: user.clinicId,
        status: status as string
      };

      const result = await this.porCaixaHandler.execute(query);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      logger.error('Erro no controller get vendas por caixa', { error });
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}
