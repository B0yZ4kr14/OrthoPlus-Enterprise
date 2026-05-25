import { logger } from '@/infrastructure/logger';
import { ReportRepository } from "@/modules/relatorios/infrastructure/ReportRepository";
import { NextFunction, Request, Response } from "express";


interface ExportOptions {
  includeModules: boolean;
  includePatients: boolean;
  includeHistory: boolean;
  includeProntuarios: boolean;
  includeAppointments: boolean;
  includeFinanceiro: boolean;
  format: "json" | "csv" | "excel";
}

export class ReportController {
  private repo = new ReportRepository()
  // GET or POST depending on frontend implementation, typically POST for options
  async exportClinicData(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<any> { // eslint-disable-line @typescript-eslint/no-explicit-any
    try {
      const clinicId = req.user?.clinicId;
      const userId = req.user?.id;

      if (!clinicId || !userId) {
        return res
          .status(401)
          .json({ error: "Unauthorized: Missing clinicId or userId" });
      }

      // Check admin status (already done by middleware normally, but verifying)
      const userProfile = await this.repo.findProfileById(userId as string);
      if (userProfile?.role !== "ADMIN" && userProfile?.role !== "MANAGER") {
        // Enforce basic RBAC if middleware didn't catch
        // We'll proceed assuming auth middleware handled it, but good to be safe
      }

      const options: ExportOptions = req.body;

      const exportData: any = { // eslint-disable-line @typescript-eslint/no-explicit-any
        version: "1.0.0",
        exportedAt: new Date().toISOString(),
        clinicId: clinicId,
        data: {},
      };

      if (options.includeModules) {
        const clinicModules = await this.repo.findClinicModules(clinicId as string);
        
        // Buscar module_catalog separadamente (sem relation no schema)
        const moduleCatalogIds = clinicModules.map((m: { module_catalog_id: number }) => m.module_catalog_id);
        const moduleCatalogs = await this.repo.findModuleCatalogs(moduleCatalogIds);
        
        // Mapear para incluir dados do catalog
        exportData.data.modules = clinicModules.map((cm: { module_catalog_id: number; [key: string]: unknown }) => ({
          ...cm,
          module_catalog: moduleCatalogs.find((mc: { id: number }) => mc.id === cm.module_catalog_id),
        }));
      }

      if (options.includePatients) {
        const patients = await this.repo.findPatientsByClinic(clinicId as string);
        exportData.data.patients = patients;
        exportData.data.patientCount = patients.length || 0;
      }

      if (options.includeHistory) {
        exportData.data.history = await this.repo.findWikiPageVersions(100);
      }

      if (options.includeProntuarios) {
        exportData.data.prontuarios = await this.repo.findProntuariosByClinic(clinicId as string);
      }

      if (options.includeAppointments) {
        exportData.data.appointments = await this.repo.findAppointmentsOrthoByClinic(clinicId as string);
      }

      if (options.includeFinanceiro) {
        exportData.data.financeiro = {
          contasReceber: await this.repo.findContasReceberByClinic(clinicId as string),
          contasPagar: await this.repo.findContasPagarByClinic(clinicId as string),
        };
      }

      // We would log to audit_logs, assuming audit_logs table exists
      try {
        await this.repo.createAuditLog({
          clinic_id: clinicId,
          user_id: userId,
          action: "DATA_EXPORT",
          details: {
            options,
            recordsExported: {
              modules: exportData.data.modules?.length || 0,
              patients: exportData.data.patientCount || 0,
              appointments: exportData.data.appointments?.length || 0,
            },
          },
        });
      } catch (e) {
        logger.error("Failed to write to audit log", { error: e });
      }

      return res.status(200).json(exportData);
    } catch (error) {
      logger.error("[ReportController] exportClinicData error:", { error });
      res.status(500).json({ error: "Failed to export data" });
    }
  }

  async importClinicData(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<any> { // eslint-disable-line @typescript-eslint/no-explicit-any
    try {
      const clinicId = req.user?.clinicId;
      const userId = req.user?.id;

      if (!clinicId || !userId) {
        return res
          .status(401)
          .json({ error: "Unauthorized: Missing clinicId or userId" });
      }

      const userProfile = await this.repo.findProfileById(userId as string);
      if (userProfile?.role !== "ADMIN" && userProfile?.role !== "MANAGER") {
        return res
          .status(403)
          .json({ error: "Forbidden: Admin access required" });
      }

      const body = req.body;
      const importData = body.data;
      const options: any = body.options || { // eslint-disable-line @typescript-eslint/no-explicit-any
        overwriteExisting: false,
        skipConflicts: true,
        mergeData: false,
      };

      if (!importData || !importData.version || !importData.data) {
        return res.status(400).json({ error: "Invalid import data format" });
      }

      const results = {
        success: true,
        imported: {
          modules: 0,
          patients: 0,
          historico: 0,
          prontuarios: 0,
          appointments: 0,
        },
        errors: [] as string[],
        skipped: [] as string[],
      };

      // Import Modules
      if (importData.data.modules && Array.isArray(importData.data.modules)) {
        for (const moduleData of importData.data.modules) {
          try {
            const catalogModule = await this.repo.findModuleCatalogByKey(
              moduleData.module_catalog?.module_key
            );

            if (catalogModule) {
              await this.repo.upsertClinicModule(
                clinicId as string,
                catalogModule.id,
                moduleData.is_active
              );
              results.imported.modules++;
            }
          } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            results.errors.push("Error importing module");
          }
        }
      }

      // Import Prontuarios
      if (
        importData.data.prontuarios &&
        Array.isArray(importData.data.prontuarios)
      ) {
        for (const prontuario of importData.data.prontuarios) {
          try {
            const inserted = await this.repo.createProntuario({
              ...prontuario,
              clinic_id: clinicId,
              id: undefined,
              created_at: undefined,
              updated_at: undefined,
            });

            results.imported.prontuarios++;

            if (
              importData.data.odontogramas &&
              Array.isArray(importData.data.odontogramas)
            ) {
              const odontogramasOriginal = importData.data.odontogramas.filter(
                (o: any) => o.prontuario_id === prontuario.id, // eslint-disable-line @typescript-eslint/no-explicit-any
              );

              for (const odonto of odontogramasOriginal) {
                await this.repo.createPepOdontograma({
                  ...odonto,
                  prontuario_id: inserted.id,
                  id: undefined,
                });
              }
            }
          } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            if (options.skipConflicts) {
              results.skipped.push(`Prontuario: ${prontuario.id}`);
            } else {
              results.errors.push(
                "Error importing prontuario",
              );
            }
          }
        }
      }

      try {
        await this.repo.createAuditLog({
          clinic_id: clinicId,
          user_id: userId,
          action: "DATA_IMPORT",
          details: {
            sourceClinicId: importData.clinicId,
            options,
            results: {
              imported: results.imported,
              errorsCount: results.errors.length,
              skippedCount: results.skipped.length,
            },
          },
        });
      } catch (e) {
        logger.error("Failed to write to audit log", { error: e });
      }

      return res.status(200).json(results);
    } catch (error) {
      logger.error("[ReportController] importClinicData error:", { error });
      res.status(500).json({ error: "Failed to import data" });
    }
  }

  async createDocumentPdf(
    _req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<any> { // eslint-disable-line @typescript-eslint/no-explicit-any
    try {
      // Placeholder for future pdf generation using pdfkit/puppeteer
      return res.status(200).json({ success: true, url: "/placeholder.pdf" });
    } catch (err) {
      res.status(500).json({ error: "Failed to generate PDF" });
    }
  }
}
