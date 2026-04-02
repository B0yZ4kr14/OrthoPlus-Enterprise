import { Request, Response } from 'express';
import { GetProdutoQueryHandler, GetProdutoQuery } from '../application/queries/GetProdutoQuery';
import { ListProdutosQueryHandler, ListProdutosQuery } from '../application/queries/ListProdutosQuery';
import { GetEstoqueBaixoQueryHandler, GetEstoqueBaixoQuery } from '../application/queries/GetEstoqueBaixoQuery';
import { logger } from '@/infrastructure/logger';

export class ProdutoQueryController {
  constructor(
    private getHandler: GetProdutoQueryHandler,
    private listHandler: ListProdutosQueryHandler,
    private estoqueBaixoHandler: GetEstoqueBaixoQueryHandler
  ) {}

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;
      const { id } = req.params;
      
      const query: GetProdutoQuery = {
        id,
        clinicId: user.clinicId
      };

      const result = await this.getHandler.execute(query);

      if (!result) {
        res.status(404).json({
          success: false,
          error: 'Produto não encontrado'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      logger.error('Erro no controller get produto', { error });
      res.status(500).json({
        success: false,
        error: "Erro ao buscar produto"
      });
    }
  }

  async list(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;
      const { page = '1', limit = '10', categoria, status, search } = req.query;
      
      const query: ListProdutosQuery = {
        clinicId: user.clinicId,
        categoria: categoria as string,
        status: status as string,
        searchTerm: search as string,
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10)
      };

      const result = await this.listHandler.execute(query);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      logger.error('Erro no controller list produtos', { error });
      res.status(500).json({
        success: false,
        error: "Erro ao listar produtos"
      });
    }
  }

  async getEstoqueBaixo(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;
      const { limite } = req.query;
      
      const query: GetEstoqueBaixoQuery = {
        clinicId: user.clinicId,
        limiteMinimo: limite ? parseInt(limite as string, 10) : undefined
      };

      const result = await this.estoqueBaixoHandler.execute(query);

      res.status(200).json({
        success: true,
        data: result,
        count: result.length
      });
    } catch (error: any) {
      logger.error('Erro no controller estoque baixo', { error });
      res.status(500).json({
        success: false,
        error: "Erro ao buscar estoque baixo"
      });
    }
  }
}
