import { logger } from '@/infrastructure/logger';
/**
 * TerminalController
 * API para terminal web shell seguro
 */

import { Request, Response } from 'express';
import { TerminalSession } from '../domain/entities/TerminalSession';

export class TerminalController {

  async createSession(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const clinicId = req.user?.clinicId;
      const role = req.user?.role;

      if (!userId || !clinicId || role !== 'ADMIN') {
        res.status(403).json({ error: 'Acesso negado - apenas administradores' });
        return;
      }

      const session = new TerminalSession({
        id: crypto.randomUUID(),
        userId,
        clinicId,
        status: 'ACTIVE',
        startedAt: new Date(),
        lastActivityAt: new Date(),
        terminatedAt: null,
        commandsExecuted: 0,
        ipAddress: req.ip || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
      });

      res.status(201).json({
        session: session.toJSON(),
        message: 'Sessão de terminal criada com sucesso',
      });
    } catch (error) {
      logger.error('Error creating terminal session:', { error });
      res.status(500).json({ error: 'Erro ao criar sessão de terminal' });
    }
  }

  async executeCommand(_req: Request, res: Response): Promise<void> {
    res.status(501).json({
      error: "Terminal feature is disabled",
      message:
        "Web terminal execution is disabled for security compliance (LGPD). Use SSH for server access.",
    });
  }

  async getCommandHistory(_req: Request, res: Response): Promise<void> {
    res.status(501).json({
      error: "Terminal feature is disabled",
      message:
        "Web terminal history is disabled for security compliance (LGPD).",
    });
  }

  async terminateSession(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const userId = req.user?.id;

      if (!userId || req.user?.role !== 'ADMIN') {
        res.status(403).json({ error: 'Acesso negado' });
        return;
      }

      res.json({
        sessionId,
        terminatedAt: new Date(),
        message: 'Sessão encerrada com sucesso',
      });
    } catch (error) {
      logger.error('Error terminating session:', { error });
      res.status(500).json({ error: 'Erro ao encerrar sessão' });
    }
  }
}
