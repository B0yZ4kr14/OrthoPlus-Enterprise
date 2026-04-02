import { logger } from "@/infrastructure/logger";
import { Request, Response } from "express";
import { NFeRepositoryPostgres } from "../infrastructure/repositories/NFeRepositoryPostgres";
import { NFe } from "../domain/entities/NFe";
import { createNfeSchema, updateNfeSchema } from "./schemas";
import { randomUUID } from "crypto";

const repository = new NFeRepositoryPostgres();

export class NFeController {
  async list(req: Request, res: Response) {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        res.status(401).json({ error: "Missing clinic context" });
        return;
      }
      const { status, tipo, cliente_id, skip, take } = req.query;
      const result = await repository.findAll({
        clinicId,
        status: status ? String(status) : undefined,
        tipo: tipo ? String(tipo) : undefined,
        clienteId: cliente_id ? String(cliente_id) : undefined,
        skip: skip ? parseInt(String(skip), 10) : undefined,
        take: take ? parseInt(String(take), 10) : undefined,
      });
      res.json(result);
    } catch (error) {
      logger.error("Error listing NF-e", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        res.status(401).json({ error: "Missing clinic context" });
        return;
      }
      const nfe = await repository.findById(req.params.id);
      if (!nfe || nfe.clinicId !== clinicId) {
        res.status(404).json({ error: "NF-e not found" });
        return;
      }
      res.json(nfe);
    } catch (error) {
      logger.error("Error getting NF-e", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        res.status(401).json({ error: "Missing clinic context" });
        return;
      }
      const parsed = createNfeSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
        return;
      }
      const now = new Date();
      const nfe = NFe.create({
        id: randomUUID(),
        clinicId,
        numero: parsed.data.numero,
        serie: parsed.data.serie,
        tipo: parsed.data.tipo,
        status: "RASCUNHO",
        chaveAcesso: null,
        xml: null,
        pdfUrl: null,
        clienteId: parsed.data.cliente_id,
        clienteNome: parsed.data.cliente_nome,
        valorTotal: parsed.data.valor_total,
        dataEmissao: new Date(parsed.data.data_emissao),
        protocolo: null,
        createdAt: now,
        updatedAt: now,
      });
      await repository.save(nfe);
      res.status(201).json(nfe);
    } catch (error) {
      logger.error("Error creating NF-e", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        res.status(401).json({ error: "Missing clinic context" });
        return;
      }
      const nfe = await repository.findById(req.params.id);
      if (!nfe || nfe.clinicId !== clinicId) {
        res.status(404).json({ error: "NF-e not found" });
        return;
      }
      const parsed = updateNfeSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
        return;
      }
      if (parsed.data.status !== undefined) nfe.status = parsed.data.status;
      if (parsed.data.chave_acesso !== undefined) nfe.chaveAcesso = parsed.data.chave_acesso;
      if (parsed.data.xml !== undefined) nfe.xml = parsed.data.xml;
      if (parsed.data.pdf_url !== undefined) nfe.pdfUrl = parsed.data.pdf_url;
      if (parsed.data.protocolo !== undefined) nfe.protocolo = parsed.data.protocolo;
      nfe.updatedAt = new Date();
      await repository.update(nfe);
      res.json(nfe);
    } catch (error) {
      logger.error("Error updating NF-e", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async cancel(req: Request, res: Response) {
    try {
      const clinicId = req.user?.clinicId;
      if (!clinicId) {
        res.status(401).json({ error: "Missing clinic context" });
        return;
      }
      const nfe = await repository.findById(req.params.id);
      if (!nfe || nfe.clinicId !== clinicId) {
        res.status(404).json({ error: "NF-e not found" });
        return;
      }
      try {
        nfe.cancelar();
      } catch (domainError) {
        const message = domainError instanceof Error ? domainError.message : "Cannot cancel";
        res.status(422).json({ error: message });
        return;
      }
      await repository.update(nfe);
      logger.info("NF-e cancelled", { clinicId, nfeId: nfe.id });
      res.json(nfe);
    } catch (error) {
      logger.error("Error cancelling NF-e", { error });
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async status(_req: Request, res: Response) {
    res.json({
      module: "NFE",
      status: "active",
      endpoints: ["GET /", "GET /:id", "POST /", "PATCH /:id", "POST /:id/cancelar", "GET /status"],
    });
  }
}
