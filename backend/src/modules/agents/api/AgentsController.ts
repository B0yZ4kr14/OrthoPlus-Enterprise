/**
 * AgentsController - API para o Agno Agent Service
 * 
 * Endpoints:
 * - GET  /api/agents/health      - Health check do agent service
 * - POST /api/agents/crud        - Gerar CRUD completo
 * - POST /api/agents/crud/simple - Gerar CRUD (versão simples)
 * - POST /api/agents/bugfix      - Analisar e corrigir bug
 * - POST /api/agents/refactor    - Refatorar código
 * - POST /api/agents/review      - Code review
 */

import { Request, Response } from 'express';
import { z } from 'zod';
import { logger } from '@/infrastructure/logger';
import { 
  AgentProxyService,
  CRUDRequest,
  BugfixRequest,
  RefactorRequest,
  CodeReviewRequest 
} from '../services/AgentProxyService';

// ============================================================================
// SCHEMAS DE VALIDAÇÃO (Zod)
// ============================================================================

const FieldDefinitionSchema = z.object({
  name: z.string().min(1, 'Nome do campo é obrigatório'),
  type: z.string().min(1, 'Tipo do campo é obrigatório'),
  required: z.boolean().default(true),
  description: z.string().optional(),
});

const CRUDRequestSchema = z.object({
  entity_name: z.string().min(1, 'Nome da entidade é obrigatório'),
  fields: z.array(FieldDefinitionSchema).min(1, 'Pelo menos um campo é obrigatório'),
  clinica_relationship: z.boolean().default(true),
});

const BugfixRequestSchema = z.object({
  bug_report: z.string().min(10, 'Descrição do bug deve ter pelo menos 10 caracteres'),
  file_path: z.string().optional(),
  error_message: z.string().optional(),
});

const RefactorRequestSchema = z.object({
  target: z.string().min(1, 'Alvo da refatoração é obrigatório'),
  from_pattern: z.string().min(1, 'Padrão atual é obrigatório'),
  to_pattern: z.string().min(1, 'Novo padrão é obrigatório'),
  scope: z.enum(['file', 'module', 'project']).default('module'),
});

const CodeReviewRequestSchema = z.object({
  file_path: z.string().min(1, 'Caminho do arquivo é obrigatório'),
  code: z.string().optional(),
});

// ============================================================================
// CONTROLLER
// ============================================================================

export class AgentsController {
  private agentService: AgentProxyService;

  constructor() {
    this.agentService = new AgentProxyService();
  }

  // ==========================================================================
  // HELPER: Verificar permissão
  // ==========================================================================

  private checkPermission(req: Request, res: Response, allowedRoles: string[]): boolean {
    const userRole = req.user?.role;
    
    if (!userRole || !allowedRoles.includes(userRole)) {
      res.status(403).json({
        error: 'Permissão negada',
        message: `Esta operação requer uma das permissões: ${allowedRoles.join(', ')}`,
        currentRole: userRole || 'none',
      });
      return false;
    }
    return true;
  }

  // ==========================================================================
  // HEALTH CHECK
  // ==========================================================================

  async health(_req: Request, res: Response): Promise<void> {
    try {
      const health = await this.agentService.health();
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        agent_service: health,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      res.status(503).json({
        status: 'error',
        message: 'Agent Service indisponível',
        error: errorMessage,
        hint: 'Verifique se o serviço Python está rodando em localhost:8000',
      });
    }
  }

  // ==========================================================================
  // CRUD - VERSÃO COMPLETA
  // ==========================================================================

  async createCRUD(req: Request, res: Response): Promise<void> {
    try {
      // Verificar permissão (apenas ADMIN e DEV)
      if (!this.checkPermission(req, res, ['ADMIN', 'DEV'])) {
        return;
      }

      // Validar schema
      const validationResult = CRUDRequestSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          error: 'Dados inválidos',
          details: validationResult.error.errors,
        });
        return;
      }

      const data = validationResult.data;

      // Chamar agent service
      const result = await this.agentService.createCRUD(data as CRUDRequest);

      // Adicionar metadados da requisição
      res.json({
        success: true,
        request: {
          entity: data.entity_name,
          fields_count: data.fields.length,
          clinic_relationship: data.clinica_relationship,
        },
        result,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      logger.error('[AgentsController.createCRUD] Error:', errorMessage);
      res.status(500).json({
        error: 'Erro ao gerar CRUD',
        message: errorMessage,
      });
    }
  }

  // ==========================================================================
  // CRUD - VERSÃO SIMPLES
  // ==========================================================================

  async createCRUDSimple(req: Request, res: Response): Promise<void> {
    try {
      // Verificar permissão
      if (!this.checkPermission(req, res, ['ADMIN', 'DEV'])) {
        return;
      }

      // Validar parâmetros
      const { entity_name, fields } = req.body;
      
      if (!entity_name || typeof entity_name !== 'string') {
        res.status(400).json({ error: 'entity_name é obrigatório' });
        return;
      }
      if (!fields || typeof fields !== 'string') {
        res.status(400).json({ error: 'fields é obrigatório (ex: nome:String,ativo:Boolean)' });
        return;
      }

      // Chamar agent service
      const result = await this.agentService.createCRUDSimple(entity_name, fields);

      res.json({
        success: true,
        request: { entity: entity_name, fields },
        result,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      logger.error('[AgentsController.createCRUDSimple] Error:', errorMessage);
      res.status(500).json({
        error: 'Erro ao gerar CRUD simples',
        message: errorMessage,
      });
    }
  }

  // ==========================================================================
  // BUGFIX
  // ==========================================================================

  async fixBug(req: Request, res: Response): Promise<void> {
    try {
      // Verificar permissão
      if (!this.checkPermission(req, res, ['ADMIN', 'DEV', 'SUPPORT'])) {
        return;
      }

      // Validar schema
      const validationResult = BugfixRequestSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          error: 'Dados inválidos',
          details: validationResult.error.errors,
        });
        return;
      }

      const data = validationResult.data;

      // Chamar agent service
      const result = await this.agentService.fixBug(data as BugfixRequest);

      res.json({
        success: true,
        request: {
          bug_report: data.bug_report.substring(0, 100) + '...',
          file_path: data.file_path,
        },
        result,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      logger.error('[AgentsController.fixBug] Error:', errorMessage);
      res.status(500).json({
        error: 'Erro ao analisar bug',
        message: errorMessage,
      });
    }
  }

  // ==========================================================================
  // REFACTOR
  // ==========================================================================

  async refactor(req: Request, res: Response): Promise<void> {
    try {
      // Verificar permissão
      if (!this.checkPermission(req, res, ['ADMIN', 'DEV'])) {
        return;
      }

      // Validar schema
      const validationResult = RefactorRequestSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          error: 'Dados inválidos',
          details: validationResult.error.errors,
        });
        return;
      }

      const data = validationResult.data;

      // Chamar agent service
      const result = await this.agentService.refactor(data as RefactorRequest);

      res.json({
        success: true,
        request: {
          target: data.target,
          from_pattern: data.from_pattern,
          to_pattern: data.to_pattern,
          scope: data.scope,
        },
        result,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      logger.error('[AgentsController.refactor] Error:', errorMessage);
      res.status(500).json({
        error: 'Erro ao gerar plano de refatoração',
        message: errorMessage,
      });
    }
  }

  // ==========================================================================
  // CODE REVIEW
  // ==========================================================================

  async codeReview(req: Request, res: Response): Promise<void> {
    try {
      // Verificar permissão (mais permissivo - DEVs podem revisar)
      if (!this.checkPermission(req, res, ['ADMIN', 'DEV', 'REVIEWER'])) {
        return;
      }

      // Validar schema
      const validationResult = CodeReviewRequestSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          error: 'Dados inválidos',
          details: validationResult.error.errors,
        });
        return;
      }

      const data = validationResult.data;

      // Chamar agent service
      const result = await this.agentService.codeReview(data as CodeReviewRequest);

      res.json({
        success: true,
        request: {
          file_path: data.file_path,
          has_code: !!data.code,
        },
        result,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      logger.error('[AgentsController.codeReview] Error:', errorMessage);
      res.status(500).json({
        error: 'Erro ao realizar code review',
        message: errorMessage,
      });
    }
  }
}
