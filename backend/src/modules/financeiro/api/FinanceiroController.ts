import { prisma } from "@/infrastructure/database/prismaClient";
import { logger } from "@/infrastructure/logger";

import { Request, Response } from "express";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Validation schemas — only whitelisted fields are accepted
// ---------------------------------------------------------------------------

const createTransactionSchema = z.object({
  type: z.string().max(50),
  status: z.string().max(50).optional(),
  amount: z.number().nonnegative(),
  description: z.string().max(1000).optional().nullable(),
  category_id: z.string().uuid().optional().nullable(),
  due_date: z.string().optional().nullable(),
  paid_date: z.string().optional().nullable(),
  related_entity_type: z.string().max(100).optional().nullable(),
  related_entity_id: z.string().uuid().optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  payment_method: z.string().max(100).optional().nullable(),
});

const updateTransactionSchema = z.object({
  type: z.string().max(50).optional(),
  status: z.string().max(50).optional(),
  amount: z.number().nonnegative().optional(),
  description: z.string().max(1000).optional().nullable(),
  category_id: z.string().uuid().optional().nullable(),
  due_date: z.string().optional().nullable(),
  paid_date: z.string().optional().nullable(),
  related_entity_type: z.string().max(100).optional().nullable(),
  related_entity_id: z.string().uuid().optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  payment_method: z.string().max(100).optional().nullable(),
});

const createCategorySchema = z.object({
  name: z.string().min(1).max(200),
  type: z.string().max(50).optional(),
  is_active: z.boolean().optional(),
  description: z.string().max(1000).optional().nullable(),
});

const updateCategorySchema = z.object({
  name: z.string().min(1).max(200).optional(),
  type: z.string().max(50).optional(),
  is_active: z.boolean().optional(),
  description: z.string().max(1000).optional().nullable(),
});

const createCashRegisterSchema = z.object({
  status: z.string().max(50).optional(),
  opened_at: z.string().optional().nullable(),
  closed_at: z.string().optional().nullable(),
  saldo_inicial: z.number().optional(),
  saldo_final: z.number().optional().nullable(),
  opened_by: z.string().max(200).optional().nullable(),
  observacoes: z.string().max(1000).optional().nullable(),
});

const updateCashRegisterSchema = z.object({
  status: z.string().max(50).optional(),
  closed_at: z.string().optional().nullable(),
  saldo_final: z.number().optional().nullable(),
  observacoes: z.string().max(1000).optional().nullable(),
});

const createMovimentoSchema = z.object({
  cash_register_id: z.string().uuid().optional().nullable(),
  tipo: z.string().max(50),
  valor: z.number(),
  descricao: z.string().max(1000).optional().nullable(),
  status: z.string().max(50).optional(),
  payment_method: z.string().max(100).optional().nullable(),
  reference_id: z.string().uuid().optional().nullable(),
  reference_type: z.string().max(100).optional().nullable(),
});

const updateMovimentoSchema = z.object({
  tipo: z.string().max(50).optional(),
  valor: z.number().optional(),
  descricao: z.string().max(1000).optional().nullable(),
  status: z.string().max(50).optional(),
  payment_method: z.string().max(100).optional().nullable(),
});

const createIncidenteSchema = z.object({
  cash_register_id: z.string().uuid().optional().nullable(),
  tipo_incidente: z.string().max(100),
  descricao: z.string().max(2000).optional().nullable(),
  valor_perdido: z.number().nonnegative().optional().nullable(),
  data_incidente: z.string().optional().nullable(),
  acoes_tomadas: z.string().max(2000).optional().nullable(),
});

const updateIncidenteSchema = z.object({
  tipo_incidente: z.string().max(100).optional(),
  descricao: z.string().max(2000).optional().nullable(),
  valor_perdido: z.number().nonnegative().optional().nullable(),
  data_incidente: z.string().optional().nullable(),
  acoes_tomadas: z.string().max(2000).optional().nullable(),
});

const createContaReceberSchema = z.object({
  patient_id: z.string().uuid().optional().nullable(),
  descricao: z.string().max(1000).optional().nullable(),
  valor: z.number().nonnegative(),
  data_vencimento: z.string().optional().nullable(),
  status: z.string().max(50).optional(),
  metodo_pagamento: z.string().max(100).optional().nullable(),
  parcelas: z.number().int().positive().optional(),
  observacoes: z.string().max(2000).optional().nullable(),
});

const updateContaReceberSchema = z.object({
  descricao: z.string().max(1000).optional().nullable(),
  valor: z.number().nonnegative().optional(),
  data_vencimento: z.string().optional().nullable(),
  status: z.string().max(50).optional(),
  data_pagamento: z.string().optional().nullable(),
  metodo_pagamento: z.string().max(100).optional().nullable(),
  observacoes: z.string().max(2000).optional().nullable(),
});

const createContaPagarSchema = z.object({
  fornecedor: z.string().max(200).optional().nullable(),
  descricao: z.string().max(1000).optional().nullable(),
  valor: z.number().nonnegative(),
  data_vencimento: z.string().optional().nullable(),
  status: z.string().max(50).optional(),
  category_id: z.string().uuid().optional().nullable(),
  observacoes: z.string().max(2000).optional().nullable(),
});

const updateContaPagarSchema = z.object({
  fornecedor: z.string().max(200).optional().nullable(),
  descricao: z.string().max(1000).optional().nullable(),
  valor: z.number().nonnegative().optional(),
  data_vencimento: z.string().optional().nullable(),
  status: z.string().max(50).optional(),
  data_pagamento: z.string().optional().nullable(),
  category_id: z.string().uuid().optional().nullable(),
  observacoes: z.string().max(2000).optional().nullable(),
});

const createNotaFiscalSchema = z.object({
  patient_id: z.string().uuid().optional().nullable(),
  numero_nota: z.string().max(100).optional().nullable(),
  serie: z.string().max(50).optional().nullable(),
  valor_total: z.number().nonnegative(),
  status: z.string().max(50).optional(),
  data_emissao: z.string().optional().nullable(),
  chave_acesso: z.string().max(500).optional().nullable(),
  descricao: z.string().max(2000).optional().nullable(),
});

const updateExtratoSchema = z.object({
  conciliado: z.boolean().optional(),
  transaction_id: z.string().uuid().optional().nullable(),
  observacoes: z.string().max(2000).optional().nullable(),
});

const updateNotaFiscalSchema = z.object({
  numero_nota: z.string().max(100).optional().nullable(),
  serie: z.string().max(50).optional().nullable(),
  valor_total: z.number().nonnegative().optional(),
  status: z.string().max(50).optional(),
  data_emissao: z.string().optional().nullable(),
  chave_acesso: z.string().max(500).optional().nullable(),
  descricao: z.string().max(2000).optional().nullable(),
});

export class FinanceiroController {
  // ═══════════════════ TRANSACTIONS ═══════════════════

  async listTransactions(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) { res.status(401).json({ error: "Clinic ID not found" }); return; }

      const { type, status, category_id, start_date, end_date, related_entity_type, related_entity_id } = req.query;

      const where: any = { clinic_id: clinicId }; // eslint-disable-line @typescript-eslint/no-explicit-any
      if (type) where.type = type;
      if (status) where.status = status;
      if (category_id) where.category_id = category_id;
      if (related_entity_type) where.related_entity_type = related_entity_type;
      if (related_entity_id) where.related_entity_id = related_entity_id;
      if (start_date || end_date) {
        where.due_date = {};
        if (start_date) where.due_date.gte = new Date(start_date as string);
        if (end_date) where.due_date.lte = new Date(end_date as string);
      }

      const data = await (prisma as any).financial_transactions.findMany({ // eslint-disable-line @typescript-eslint/no-explicit-any
        where, orderBy: { due_date: "desc" },
      });
      res.json(data);
    } catch (error) {
      logger.error("Error listing transactions", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async getTransaction(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) { res.status(401).json({ error: "Clinic ID not found" }); return; }
      const data = await (prisma as any).financial_transactions.findFirst({ where: { id: req.params.id, clinic_id: clinicId } }); // eslint-disable-line @typescript-eslint/no-explicit-any
      if (!data) { res.status(404).json({ error: "Not found" }); return; }
      res.json(data);
    } catch (error) {
      logger.error("Error getting transaction", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async createTransaction(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;
      const userId = req.user?.id;
      if (!clinicId || !userId) { res.status(401).json({ error: "Auth required" }); return; }

      const parsed = createTransactionSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
        return;
      }

      const data = await (prisma as any).financial_transactions.create({ // eslint-disable-line @typescript-eslint/no-explicit-any
        data: { ...parsed.data, clinic_id: clinicId, created_by: userId },
      });
      res.status(201).json(data);
    } catch (error) {
      logger.error("Error creating transaction", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async updateTransaction(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) { res.status(401).json({ error: "Clinic ID not found" }); return; }
      const existing = await (prisma as any).financial_transactions.findFirst({ where: { id: req.params.id, clinic_id: clinicId } }); // eslint-disable-line @typescript-eslint/no-explicit-any
      if (!existing) { res.status(404).json({ error: "Not found" }); return; }

      const parsed = updateTransactionSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
        return;
      }

      const data = await (prisma as any).financial_transactions.update({ // eslint-disable-line @typescript-eslint/no-explicit-any
        where: { id: req.params.id }, data: parsed.data,
      });
      res.json(data);
    } catch (error) {
      logger.error("Error updating transaction", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async deleteTransaction(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) { res.status(401).json({ error: "Clinic ID not found" }); return; }
      const existing = await (prisma as any).financial_transactions.findFirst({ where: { id: req.params.id, clinic_id: clinicId } }); // eslint-disable-line @typescript-eslint/no-explicit-any
      if (!existing) { res.status(404).json({ error: "Not found" }); return; }
      await (prisma as any).financial_transactions.delete({ where: { id: req.params.id } }); // eslint-disable-line @typescript-eslint/no-explicit-any
      res.status(204).send();
    } catch (error) {
      logger.error("Error deleting transaction", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async markTransactionAsPaid(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) { res.status(401).json({ error: "Clinic ID not found" }); return; }
      const existing = await (prisma as any).financial_transactions.findFirst({ where: { id: req.params.id, clinic_id: clinicId } }); // eslint-disable-line @typescript-eslint/no-explicit-any
      if (!existing) { res.status(404).json({ error: "Not found" }); return; }
      const data = await (prisma as any).financial_transactions.update({ // eslint-disable-line @typescript-eslint/no-explicit-any
        where: { id: req.params.id },
        data: { status: "PAGO", paid_date: new Date().toISOString() },
      });
      res.json(data);
    } catch (error) {
      logger.error("Error marking transaction as paid", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // ═══════════════════ CATEGORIES ═══════════════════

  async listCategories(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) { res.status(401).json({ error: "Clinic ID not found" }); return; }

      const { type, is_active, name } = req.query;
      const where: any = { clinic_id: clinicId }; // eslint-disable-line @typescript-eslint/no-explicit-any
      if (type) where.type = type;
      if (is_active !== undefined) where.is_active = is_active === "true";
      if (name) where.name = name;

      const data = await prisma.financial_categories.findMany({
        where, orderBy: { name: "asc" },
      });
      res.json(data);
    } catch (error) {
      logger.error("Error listing categories", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async getCategory(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) { res.status(401).json({ error: "Clinic ID not found" }); return; }
      const data = await prisma.financial_categories.findFirst({ where: { id: req.params.id, clinic_id: clinicId } });
      if (!data) { res.status(404).json({ error: "Not found" }); return; }
      res.json(data);
    } catch (error) {
      logger.error("Error getting category", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async createCategory(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) { res.status(401).json({ error: "Clinic ID not found" }); return; }

      const parsed = createCategorySchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
        return;
      }

      const data = await (prisma as any).financial_categories.create({ // eslint-disable-line @typescript-eslint/no-explicit-any
        data: { ...parsed.data, clinic_id: clinicId },
      });
      res.status(201).json(data);
    } catch (error) {
      logger.error("Error creating category", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async updateCategory(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) { res.status(401).json({ error: "Clinic ID not found" }); return; }
      const existing = await prisma.financial_categories.findFirst({ where: { id: req.params.id, clinic_id: clinicId } });
      if (!existing) { res.status(404).json({ error: "Not found" }); return; }

      const parsed = updateCategorySchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
        return;
      }

      const data = await (prisma as any).financial_categories.update({ // eslint-disable-line @typescript-eslint/no-explicit-any
        where: { id: req.params.id }, data: parsed.data,
      });
      res.json(data);
    } catch (error) {
      logger.error("Error updating category", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async deleteCategory(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) { res.status(401).json({ error: "Clinic ID not found" }); return; }
      const existing = await prisma.financial_categories.findFirst({ where: { id: req.params.id, clinic_id: clinicId } });
      if (!existing) { res.status(404).json({ error: "Not found" }); return; }
      await prisma.financial_categories.delete({ where: { id: req.params.id } });
      res.status(204).send();
    } catch (error) {
      logger.error("Error deleting category", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // ═══════════════════ CASH REGISTERS ═══════════════════

  async listCashRegisters(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) { res.status(401).json({ error: "Clinic ID not found" }); return; }

      const { status, opened_by, start_date, end_date } = req.query;
      const where: any = { clinic_id: clinicId }; // eslint-disable-line @typescript-eslint/no-explicit-any
      if (status) where.status = status;
      if (opened_by) where.opened_by = opened_by;
      if (start_date || end_date) {
        where.opened_at = {};
        if (start_date) where.opened_at.gte = new Date(start_date as string);
        if (end_date) where.opened_at.lte = new Date(end_date as string);
      }

      const data = await (prisma as any).cash_registers.findMany({ // eslint-disable-line @typescript-eslint/no-explicit-any
        where, orderBy: { opened_at: "desc" },
      });
      res.json(data);
    } catch (error) {
      logger.error("Error listing cash registers", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async getCashRegister(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) { res.status(401).json({ error: "Clinic ID not found" }); return; }
      const data = await (prisma as any).cash_registers.findFirst({ where: { id: req.params.id, clinic_id: clinicId } }); // eslint-disable-line @typescript-eslint/no-explicit-any
      if (!data) { res.status(404).json({ error: "Not found" }); return; }
      res.json(data);
    } catch (error) {
      logger.error("Error getting cash register", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async createCashRegister(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) { res.status(401).json({ error: "Clinic ID not found" }); return; }

      const parsed = createCashRegisterSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
        return;
      }

      const data = await (prisma as any).cash_registers.create({ // eslint-disable-line @typescript-eslint/no-explicit-any
        data: { ...parsed.data, clinic_id: clinicId },
      });
      res.status(201).json(data);
    } catch (error) {
      logger.error("Error creating cash register", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async updateCashRegister(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) { res.status(401).json({ error: "Clinic ID not found" }); return; }
      const existing = await (prisma as any).cash_registers.findFirst({ where: { id: req.params.id, clinic_id: clinicId } }); // eslint-disable-line @typescript-eslint/no-explicit-any
      if (!existing) { res.status(404).json({ error: "Not found" }); return; }

      const parsed = updateCashRegisterSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
        return;
      }

      const data = await (prisma as any).cash_registers.update({ // eslint-disable-line @typescript-eslint/no-explicit-any
        where: { id: req.params.id }, data: parsed.data,
      });
      res.json(data);
    } catch (error) {
      logger.error("Error updating cash register", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async deleteCashRegister(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) { res.status(401).json({ error: "Clinic ID not found" }); return; }
      const existing = await (prisma as any).cash_registers.findFirst({ where: { id: req.params.id, clinic_id: clinicId } }); // eslint-disable-line @typescript-eslint/no-explicit-any
      if (!existing) { res.status(404).json({ error: "Not found" }); return; }
      await (prisma as any).cash_registers.delete({ where: { id: req.params.id } }); // eslint-disable-line @typescript-eslint/no-explicit-any
      res.status(204).send();
    } catch (error) {
      logger.error("Error deleting cash register", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // ═══════════════════ CAIXA MOVIMENTOS ═══════════════════

  async listMovimentos(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) { res.status(401).json({ error: "Clinic ID not found" }); return; }

      const { status, tipo, start_date, end_date } = req.query;
      const where: any = { clinic_id: clinicId }; // eslint-disable-line @typescript-eslint/no-explicit-any
      if (status) where.status = status;
      if (tipo) where.tipo = tipo;
      if (start_date || end_date) {
        where.created_at = {};
        if (start_date) where.created_at.gte = new Date(start_date as string);
        if (end_date) where.created_at.lte = new Date(end_date as string);
      }

      const data = await prisma.caixa_movimentos.findMany({
        where, orderBy: { created_at: "desc" },
      });
      res.json(data);
    } catch (error) {
      logger.error("Error listing movimentos", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async getMovimento(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) { res.status(401).json({ error: "Clinic ID not found" }); return; }
      const data = await prisma.caixa_movimentos.findFirst({ where: { id: req.params.id, clinic_id: clinicId } });
      if (!data) { res.status(404).json({ error: "Not found" }); return; }
      res.json(data);
    } catch (error) {
      logger.error("Error getting movimento", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async createMovimento(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) { res.status(401).json({ error: "Clinic ID not found" }); return; }

      const parsed = createMovimentoSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
        return;
      }

      const data = await (prisma as any).caixa_movimentos.create({ // eslint-disable-line @typescript-eslint/no-explicit-any
        data: { ...parsed.data, clinic_id: clinicId },
      });
      res.status(201).json(data);
    } catch (error) {
      logger.error("Error creating movimento", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async updateMovimento(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) { res.status(401).json({ error: "Clinic ID not found" }); return; }
      const existing = await prisma.caixa_movimentos.findFirst({ where: { id: req.params.id, clinic_id: clinicId } });
      if (!existing) { res.status(404).json({ error: "Not found" }); return; }

      const parsed = updateMovimentoSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
        return;
      }

      const data = await (prisma as any).caixa_movimentos.update({ // eslint-disable-line @typescript-eslint/no-explicit-any
        where: { id: req.params.id }, data: parsed.data,
      });
      res.json(data);
    } catch (error) {
      logger.error("Error updating movimento", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async deleteMovimento(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) { res.status(401).json({ error: "Clinic ID not found" }); return; }
      const existing = await prisma.caixa_movimentos.findFirst({ where: { id: req.params.id, clinic_id: clinicId } });
      if (!existing) { res.status(404).json({ error: "Not found" }); return; }
      await prisma.caixa_movimentos.delete({ where: { id: req.params.id } });
      res.status(204).send();
    } catch (error) {
      logger.error("Error deleting movimento", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // ═══════════════════ CAIXA INCIDENTES ═══════════════════

  async listIncidentes(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) { res.status(401).json({ error: "Clinic ID not found" }); return; }

      const { tipo_incidente, start_date, end_date, graves } = req.query;
      const where: any = { clinic_id: clinicId }; // eslint-disable-line @typescript-eslint/no-explicit-any
      if (tipo_incidente) where.tipo_incidente = tipo_incidente;
      if (start_date || end_date) {
        where.data_incidente = {};
        if (start_date) where.data_incidente.gte = new Date(start_date as string);
        if (end_date) where.data_incidente.lte = new Date(end_date as string);
      }
      if (graves === "true") {
        where.OR = [
          { tipo_incidente: "ROUBO" },
          { valor_perdido: { gt: 1000 } },
        ];
      }

      const data = await prisma.caixa_incidentes.findMany({
        where, orderBy: { data_incidente: "desc" },
      });
      res.json(data);
    } catch (error) {
      logger.error("Error listing incidentes", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async getIncidente(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) { res.status(401).json({ error: "Clinic ID not found" }); return; }
      const data = await prisma.caixa_incidentes.findFirst({ where: { id: req.params.id, clinic_id: clinicId } });
      if (!data) { res.status(404).json({ error: "Not found" }); return; }
      res.json(data);
    } catch (error) {
      logger.error("Error getting incidente", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async createIncidente(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) { res.status(401).json({ error: "Clinic ID not found" }); return; }

      const parsed = createIncidenteSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
        return;
      }

      const data = await (prisma as any).caixa_incidentes.create({ // eslint-disable-line @typescript-eslint/no-explicit-any
        data: { ...parsed.data, clinic_id: clinicId },
      });
      res.status(201).json(data);
    } catch (error) {
      logger.error("Error creating incidente", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async updateIncidente(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) { res.status(401).json({ error: "Clinic ID not found" }); return; }
      const existing = await prisma.caixa_incidentes.findFirst({ where: { id: req.params.id, clinic_id: clinicId } });
      if (!existing) { res.status(404).json({ error: "Not found" }); return; }

      const parsed = updateIncidenteSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
        return;
      }

      const data = await (prisma as any).caixa_incidentes.update({ // eslint-disable-line @typescript-eslint/no-explicit-any
        where: { id: req.params.id }, data: parsed.data,
      });
      res.json(data);
    } catch (error) {
      logger.error("Error updating incidente", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async deleteIncidente(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) { res.status(401).json({ error: "Clinic ID not found" }); return; }
      const existing = await prisma.caixa_incidentes.findFirst({ where: { id: req.params.id, clinic_id: clinicId } });
      if (!existing) { res.status(404).json({ error: "Not found" }); return; }
      await prisma.caixa_incidentes.delete({ where: { id: req.params.id } });
      res.status(204).send();
    } catch (error) {
      logger.error("Error deleting incidente", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // ═══════════════════ CONTAS A RECEBER ═══════════════════

  async listContasReceber(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) { res.status(401).json({ error: "Clinic ID not found" }); return; }

      const data = await prisma.contas_receber.findMany({
        where: { clinic_id: clinicId },
        orderBy: { data_vencimento: "asc" },
      });
      res.json(data);
    } catch (error) {
      logger.error("Error listing contas a receber", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async createContaReceber(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;
      const userId = req.user?.id;
      if (!clinicId || !userId) { res.status(401).json({ error: "Auth required" }); return; }

      const parsed = createContaReceberSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
        return;
      }

      const data = await (prisma as any).contas_receber.create({ // eslint-disable-line @typescript-eslint/no-explicit-any
        data: { ...parsed.data, clinic_id: clinicId, created_by: userId },
      });
      res.status(201).json(data);
    } catch (error) {
      logger.error("Error creating conta a receber", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async updateContaReceber(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) { res.status(401).json({ error: "Clinic ID not found" }); return; }
      const existing = await prisma.contas_receber.findFirst({ where: { id: req.params.id, clinic_id: clinicId } });
      if (!existing) { res.status(404).json({ error: "Not found" }); return; }

      const parsed = updateContaReceberSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
        return;
      }

      const data = await (prisma as any).contas_receber.update({ // eslint-disable-line @typescript-eslint/no-explicit-any
        where: { id: req.params.id }, data: parsed.data,
      });
      res.json(data);
    } catch (error) {
      logger.error("Error updating conta a receber", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async deleteContaReceber(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) { res.status(401).json({ error: "Clinic ID not found" }); return; }
      const existing = await prisma.contas_receber.findFirst({ where: { id: req.params.id, clinic_id: clinicId } });
      if (!existing) { res.status(404).json({ error: "Not found" }); return; }
      await prisma.contas_receber.delete({ where: { id: req.params.id } });
      res.status(204).send();
    } catch (error) {
      logger.error("Error deleting conta a receber", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // ═══════════════════ CONTAS A PAGAR ═══════════════════

  async listContasPagar(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) { res.status(401).json({ error: "Clinic ID not found" }); return; }

      const data = await prisma.contas_pagar.findMany({
        where: { clinic_id: clinicId },
        orderBy: { data_vencimento: "asc" },
      });
      res.json(data);
    } catch (error) {
      logger.error("Error listing contas a pagar", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async createContaPagar(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;
      const userId = req.user?.id;
      if (!clinicId || !userId) { res.status(401).json({ error: "Auth required" }); return; }

      const parsed = createContaPagarSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
        return;
      }

      const data = await (prisma as any).contas_pagar.create({ // eslint-disable-line @typescript-eslint/no-explicit-any
        data: { ...parsed.data, clinic_id: clinicId, created_by: userId },
      });
      res.status(201).json(data);
    } catch (error) {
      logger.error("Error creating conta a pagar", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async updateContaPagar(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) { res.status(401).json({ error: "Clinic ID not found" }); return; }
      const existing = await prisma.contas_pagar.findFirst({ where: { id: req.params.id, clinic_id: clinicId } });
      if (!existing) { res.status(404).json({ error: "Not found" }); return; }

      const parsed = updateContaPagarSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
        return;
      }

      const data = await (prisma as any).contas_pagar.update({ // eslint-disable-line @typescript-eslint/no-explicit-any
        where: { id: req.params.id }, data: parsed.data,
      });
      res.json(data);
    } catch (error) {
      logger.error("Error updating conta a pagar", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async deleteContaPagar(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) { res.status(401).json({ error: "Clinic ID not found" }); return; }
      const existing = await prisma.contas_pagar.findFirst({ where: { id: req.params.id, clinic_id: clinicId } });
      if (!existing) { res.status(404).json({ error: "Not found" }); return; }
      await prisma.contas_pagar.delete({ where: { id: req.params.id } });
      res.status(204).send();
    } catch (error) {
      logger.error("Error deleting conta a pagar", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // ═══════════════════ NOTAS FISCAIS ═══════════════════

  async listNotasFiscais(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) { res.status(401).json({ error: "Clinic ID not found" }); return; }

      const data = await prisma.notas_fiscais.findMany({
        where: { clinic_id: clinicId },
        orderBy: { data_emissao: "desc" },
      });
      res.json(data);
    } catch (error) {
      logger.error("Error listing notas fiscais", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async createNotaFiscal(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;
      const userId = req.user?.id;
      if (!clinicId || !userId) { res.status(401).json({ error: "Auth required" }); return; }

      const parsed = createNotaFiscalSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
        return;
      }

      const data = await (prisma as any).notas_fiscais.create({ // eslint-disable-line @typescript-eslint/no-explicit-any
        data: { ...parsed.data, clinic_id: clinicId, created_by: userId },
      });
      res.status(201).json(data);
    } catch (error) {
      logger.error("Error creating nota fiscal", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async updateNotaFiscal(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) { res.status(401).json({ error: "Clinic ID not found" }); return; }
      const existing = await prisma.notas_fiscais.findFirst({ where: { id: req.params.id, clinic_id: clinicId } });
      if (!existing) { res.status(404).json({ error: "Not found" }); return; }

      const parsed = updateNotaFiscalSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
        return;
      }

      const data = await (prisma as any).notas_fiscais.update({ // eslint-disable-line @typescript-eslint/no-explicit-any
        where: { id: req.params.id }, data: parsed.data,
      });
      res.json(data);
    } catch (error) {
      logger.error("Error updating nota fiscal", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async deleteNotaFiscal(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) { res.status(401).json({ error: "Clinic ID not found" }); return; }
      const existing = await prisma.notas_fiscais.findFirst({ where: { id: req.params.id, clinic_id: clinicId } });
      if (!existing) { res.status(404).json({ error: "Not found" }); return; }
      await prisma.notas_fiscais.delete({ where: { id: req.params.id } });
      res.status(204).send();
    } catch (error) {
      logger.error("Error deleting nota fiscal", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // ═══════════════════ PDV VENDAS ═══════════════════

  async listVendasPDV(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) { res.status(401).json({ error: "Clinic ID not found" }); return; }

      const { start_date } = req.query;
      const where: any = { clinic_id: clinicId }; // eslint-disable-line @typescript-eslint/no-explicit-any
      if (start_date) where.created_at = { gte: new Date(start_date as string) };

      const data = await (prisma as any).pdv_vendas.findMany({ // eslint-disable-line @typescript-eslint/no-explicit-any
        where,
        include: { pdv_venda_itens: true, pdv_pagamentos: true },
        orderBy: { created_at: "desc" },
      });
      res.json(data);
    } catch (error) {
      logger.error("Error listing vendas PDV", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // ═══════════════════ BANCO EXTRATOS ═══════════════════

  async listExtratos(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) { res.status(401).json({ error: "Clinic ID not found" }); return; }

      const { conciliado } = req.query;
      const where: any = { clinic_id: clinicId }; // eslint-disable-line @typescript-eslint/no-explicit-any
      if (conciliado !== undefined) where.conciliado = conciliado === "true";

      const data = await (prisma as any).banco_extratos.findMany({ // eslint-disable-line @typescript-eslint/no-explicit-any
        where, orderBy: { data_movimento: "desc" },
      });
      res.json(data);
    } catch (error) {
      logger.error("Error listing extratos", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async updateExtrato(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) { res.status(401).json({ error: "Clinic ID not found" }); return; }
      const existing = await (prisma as any).banco_extratos.findFirst({ where: { id: req.params.id, clinic_id: clinicId } }); // eslint-disable-line @typescript-eslint/no-explicit-any
      if (!existing) { res.status(404).json({ error: "Not found" }); return; }

      const parsed = updateExtratoSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
        return;
      }
      const { conciliado, transaction_id, observacoes } = parsed.data;
      const data = await (prisma as any).banco_extratos.update({ // eslint-disable-line @typescript-eslint/no-explicit-any
        where: { id: req.params.id },
        data: {
          ...(conciliado !== undefined && { conciliado }),
          ...(transaction_id !== undefined && { transaction_id }),
          ...(observacoes !== undefined && { observacoes }),
        },
      });
      res.json(data);
    } catch (error) {
      logger.error("Error updating extrato", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // ═══════════════════ CASH FLOW ANALYTICS ═══════════════════

  async getCashFlow(req: Request, res: Response): Promise<void> {
    try {
      const clinicId = req.user?.clinicId;
      const { startDate, endDate } = req.query;
      if (!clinicId) { res.status(401).json({ error: "Clinic ID not found" }); return; }

      const dateFilter: any = {}; // eslint-disable-line @typescript-eslint/no-explicit-any
      if (startDate) dateFilter.gte = new Date(startDate as string);
      if (endDate) dateFilter.lte = new Date(endDate as string);

      const [receitas, despesas] = await Promise.all([
        prisma.financial_transactions.aggregate({
          where: { clinic_id: clinicId, type: "RECEITA", status: "PAGO", ...(startDate || endDate ? { paid_date: dateFilter } : {}) },
          _sum: { amount: true },
        }),
        prisma.financial_transactions.aggregate({
          where: { clinic_id: clinicId, type: "DESPESA", status: "PAGO", ...(startDate || endDate ? { paid_date: dateFilter } : {}) },
          _sum: { amount: true },
        }),
      ]);

      res.json({
        totalReceitas: receitas._sum.amount || 0,
        totalDespesas: despesas._sum.amount || 0,
        saldo: (receitas._sum.amount || 0) - (despesas._sum.amount || 0),
      });
    } catch (error) {
      logger.error("Error getting cash flow", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // ═══════════════════ LEGACY FINANCEIRO & PAYMENTS MOCKS ═══════════════════

  public sincronizarExtratoBancario = async (
    req: Request,
    res: Response,
  ) => {
    try {
      const { bancoConfigId } = req.body;

      return res.status(200).json({
        success: true,
        message: "Sync complete",
        config: bancoConfigId,
        sincronizados: 0,
      });
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      logger.error("Error syncing extratos", { error });
      return res.status(500).json({ error: "Internal server error" });
    }
  };

  public sugerirSangriaIa = async (req: Request, res: Response) => {
    try {
      const { valorAtualCaixa } = req.body;

      return res.status(200).json({
        success: true,
        sugestao: {
          valorSangria: 0,
          reservar: valorAtualCaixa,
          motivo: "Model rules currently mocked",
        },
      });
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      logger.error("Error suggesting sangria IA", { error });
      return res.status(500).json({ error: "Internal server error" });
    }
  };

  public manageFinanceiroJobs = async (_req: Request, res: Response) => {
    try {
      // req.body contains jobName
      return res.status(200).json({ success: true, executed: true });
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      return res.status(500).json({ error: "Internal server error" });
    }
  };

  public enviarCobranca = async (req: Request, res: Response) => {
    try {
      const { contaReceberId, method, message } = req.body;

      if (!contaReceberId || !method) {
        return res
          .status(400)
          .json({ error: "contaReceberId and method are required" });
      }

      const cobranca = await (prisma as any).contas_receber.findUnique({ // eslint-disable-line @typescript-eslint/no-explicit-any
        where: { id: contaReceberId },
        include: { patients: true },
      });

      if (!cobranca || !cobranca.patients) {
        return res
          .status(404)
          .json({ error: "Billing record or Patient not found" });
      }

      await (prisma as any).comunicacao_logs.create({ // eslint-disable-line @typescript-eslint/no-explicit-any
        data: {
          paciente_id: cobranca.patient_id,
          clinic_id: cobranca.clinic_id,
          tipo: method.toUpperCase(),
          mensagem: message || `Cobrança de R$ ${cobranca.valor} enviada.`,
          status: "ENVIADO",
        },
      });

      return res.status(200).json({
        success: true,
        message: "Cobrança enviada com sucesso",
      });
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      logger.error("Error in enviar-cobranca", { error });
      return res.status(500).json({ error: "Internal server error" });
    }
  };

  public processarPagamento = async (req: Request, res: Response) => {
    try {
      const { contaReceberId, amount, paymentMethod } = req.body;

      if (!contaReceberId || !amount || !paymentMethod) {
        return res.status(400).json({ error: "Required fields missing" });
      }

      const transactionId = `txn_${Date.now()}`;

      await prisma.$transaction(async (tx: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        await tx.contas_receber.update({
          where: { id: contaReceberId },
          data: {
            status: "PAGO",
            data_pagamento: new Date(),
            metodo_pagamento: paymentMethod,
          },
        });

        const bill = await tx.contas_receber.findUnique({
          where: { id: contaReceberId },
        });
        if (bill) {
          await tx.transacoes_pagamento.create({
            data: {
              clinic_id: bill.clinic_id,
              patient_id: bill.patient_id,
              valor: amount,
              metodo_pagamento: paymentMethod,
              status: "APROVADO",
              gateway_transaction_id: transactionId,
              observacoes: `Processado via API backend`,
            },
          });
        }
      });

      return res.status(200).json({
        success: true,
        transaction_id: transactionId,
        status: "APPROVED",
      });
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      logger.error("Error in processar-pagamento", { error });
      return res.status(500).json({ error: "Internal server error" });
    }
  };

  public processarPagamentoTef = async (_req: Request, res: Response) => {
    try {
      // req.body contains terminalId, amount, installments

      return res.status(200).json({
        success: true,
        message: "TEF operation initiated",
        status: "WAITING_PINPAD_INTERACTION",
      });
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      logger.error("Error in processar-pagamento-tef", { error });
      return res.status(500).json({ error: "Internal server error" });
    }
  };

  public processarSplitPagamento = async (req: Request, res: Response) => {
    try {
      const { transactionId, splits } = req.body;

      if (!transactionId || !splits || !splits.length) {
        return res
          .status(400)
          .json({ error: "transactionId and splits mapping are required" });
      }

      return res.status(200).json({
        success: true,
        message: "Split rules applied successfully",
      });
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      logger.error("Error in processar-split-pagamento", { error });
      return res.status(500).json({ error: "Internal server error" });
    }
  };
}
