import { Request, Response } from 'express';
import { CreateProdutoCommandHandler, CreateProdutoCommand } from '../application/commands/CreateProdutoCommand';
import { UpdateEstoqueCommandHandler, UpdateEstoqueCommand } from '../application/commands/UpdateEstoqueCommand';
import { logger } from '@/infrastructure/logger';

export class ProdutoCommandController {
  constructor(
    private createHandler: CreateProdutoCommandHandler,
    private updateEstoqueHandler: UpdateEstoqueCommandHandler
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;
      
      const command: CreateProdutoCommand = {
        ...req.body,
        clinicId: user.clinicId,
        createdBy: user.id
      };

      const result = await this.createHandler.execute(command);

      res.status(201).json({
        success: true,
        data: result,
        message: 'Produto criado com sucesso'
      });
    } catch (error: any) {
      logger.error('Erro no controller create produto', { error });
      res.status(400).json({
        success: false,
        error: "Erro ao criar produto"
      });
    }
  }

  async updateEstoque(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;
      const { id } = req.params;
      
      const command: UpdateEstoqueCommand = {
        ...req.body,
        produtoId: id,
        clinicId: user.clinicId,
        updatedBy: user.id
      };

      await this.updateEstoqueHandler.execute(command);

      res.status(200).json({
        success: true,
        message: 'Estoque atualizado com sucesso'
      });
    } catch (error: any) {
      logger.error('Erro no controller update estoque', { error });
      res.status(400).json({
        success: false,
        error: "Erro ao atualizar estoque"
      });
    }
  }
}
