import { logger } from "@/infrastructure/logger";
import { IReportRepository } from "@/modules/relatorios/domain/repositories/IReportRepository";

import { ReportRepository } from "@/modules/relatorios/infrastructure/ReportRepository"

interface ExportOptions {
  includeModules: boolean;
  includePatients: boolean;
  includeHistory: boolean;
  includeProntuarios: boolean;
  includeAppointments: boolean;
  includeFinanceiro: boolean;
  format: "json" | "csv" | "excel";
}

export class ReportControllerService {
  private repo: IReportRepository

  constructor(repo?: IReportRepository) {
    this.repo = repo ?? new ReportRepository()
  }

  async exportClinicData(clinicId: string, userId: string, options: ExportOptions) {
    const exportData: any = {
      version: "1.0.0",
      exportedAt: new Date().toISOString(),
      clinicId: clinicId,
      data: {},
    };

    if (options.includeModules) {
      const clinicModules = await this.repo.findClinicModules(clinicId);
      const moduleCatalogIds = clinicModules.map((m: { module_catalog_id: number }) => m.module_catalog_id);
      const moduleCatalogs = await this.repo.findModuleCatalogs(moduleCatalogIds);

      exportData.data.modules = clinicModules.map((cm: { module_catalog_id: number; [key: string]: unknown }) => ({
        ...cm,
        module_catalog: moduleCatalogs.find((mc: { id: number }) => mc.id === cm.module_catalog_id),
      }));
    }

    if (options.includePatients) {
      const patients = await this.repo.findPatientsByClinic(clinicId);
      exportData.data.patients = patients;
      exportData.data.patientCount = patients.length || 0;
    }

    if (options.includeHistory) {
      exportData.data.history = await this.repo.findWikiPageVersions(100);
    }

    if (options.includeProntuarios) {
      exportData.data.prontuarios = await this.repo.findProntuariosByClinic(clinicId);
    }

    if (options.includeAppointments) {
      exportData.data.appointments = await this.repo.findAppointmentsOrthoByClinic(clinicId);
    }

    if (options.includeFinanceiro) {
      exportData.data.financeiro = {
        contasReceber: await this.repo.findContasReceberByClinic(clinicId),
        contasPagar: await this.repo.findContasPagarByClinic(clinicId),
      };
    }

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

    return exportData;
  }

  async importClinicData(clinicId: string, userId: string, body: any) {
    const importData = body.data;
    const options = body.options || {
      overwriteExisting: false,
      skipConflicts: true,
      mergeData: false,
    };

    if (!importData || !importData.version || !importData.data) {
      throw new Error("Invalid import data format");
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

    if (importData.data.modules && Array.isArray(importData.data.modules)) {
      for (const moduleData of importData.data.modules) {
        try {
          const catalogModule = await this.repo.findModuleCatalogByKey(
            moduleData.module_catalog?.module_key
          );

          if (catalogModule) {
            await this.repo.upsertClinicModule(
              clinicId,
              catalogModule.id,
              moduleData.is_active
            );
            results.imported.modules++;
          }
        } catch (error: any) {
          results.errors.push("Error importing module");
        }
      }
    }

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
              (o: any) => o.prontuario_id === prontuario.id,
            );

            for (const odonto of odontogramasOriginal) {
              await this.repo.createPepOdontograma({
                ...odonto,
                prontuario_id: inserted.id,
                id: undefined,
              });
            }
          }
        } catch (error: any) {
          if (options.skipConflicts) {
            results.skipped.push(`Prontuario: ${prontuario.id}`);
          } else {
            results.errors.push("Error importing prontuario");
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

    return results;
  }

  createDocumentPdf() {
    return { success: true, url: "/placeholder.pdf" };
  }
}
