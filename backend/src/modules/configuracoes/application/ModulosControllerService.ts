import {
  MODULE_CATALOG,
  CatalogModule,
} from "@/modules/configuracoes/domain/moduleCatalog";
import { ClinicDataRepository } from "@/modules/configuracoes/infrastructure/ClinicDataRepository";
import { ClinicModuleRepository } from "@/modules/configuracoes/infrastructure/ClinicModuleRepository";
import { prisma } from "@/infrastructure/database/prismaClient";
import { Errors } from "@/middleware/errorHandler";

export interface ModuleView {
  id: number;
  module_key: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  subscribed: boolean;
  is_active: boolean;
  can_activate: boolean;
  can_deactivate: boolean;
  unmet_dependencies: string[];
  active_dependents: string[];
}

export interface ToggleResult {
  success: boolean;
  module?: ModuleView;
  message: string;
}

function buildModuleView(
  catalog: readonly CatalogModule[],
  activeOverrides?: Map<string, boolean>,
): ModuleView[] {
  const resolvedActive = (moduleKey: string, defaultActive: boolean) => {
    if (activeOverrides?.has(moduleKey)) {
      return activeOverrides.get(moduleKey)!;
    }
    return defaultActive;
  };

  const activeKeys = new Set(
    catalog
      .filter((m) => resolvedActive(m.module_key, m.is_active))
      .map((m) => m.module_key),
  );

  return catalog.map((mod) => {
    const isActive = resolvedActive(mod.module_key, mod.is_active);
    const unmet_dependencies = mod.dependencies.filter(
      (dep) => !activeKeys.has(dep),
    );

    const active_dependents = catalog
      .filter(
        (m) =>
          resolvedActive(m.module_key, m.is_active) &&
          m.dependencies.includes(mod.module_key),
      )
      .map((m) => m.module_key);

    const can_activate = !isActive && unmet_dependencies.length === 0;
    const can_deactivate = isActive && active_dependents.length === 0;

    return {
      id: mod.id,
      module_key: mod.module_key,
      name: mod.name,
      description: mod.description,
      category: mod.category,
      icon: mod.icon,
      subscribed: mod.subscribed,
      is_active: isActive,
      can_activate,
      can_deactivate,
      unmet_dependencies,
      active_dependents,
    };
  });
}

export class ModulosControllerService {
  private clinicDataRepo = new ClinicDataRepository();
  private clinicModuleRepo = new ClinicModuleRepository(prisma);

  getMyModules(): ModuleView[] {
    return buildModuleView(MODULE_CATALOG);
  }

  async getModulesForClinic(clinicId: string): Promise<ModuleView[]> {
    const overrides = await this.clinicModuleRepo.listByClinic(clinicId);
    const overridesMap = new Map(
      overrides.map((o) => [o.module_catalog.module_key, o.is_active]),
    );
    return buildModuleView(MODULE_CATALOG, overridesMap);
  }

  getDependencies(): Array<{ module_key: string; depends_on: string[] }> {
    return MODULE_CATALOG.filter(
      (m) => m.dependencies && m.dependencies.length > 0,
    ).map((m) => ({
      module_key: m.module_key,
      depends_on: m.dependencies,
    }));
  }

  async toggleModule(
    clinicId: string,
    moduleKey: string,
    enabled: boolean,
  ): Promise<ToggleResult> {
    const mod = MODULE_CATALOG.find((m) => m.module_key === moduleKey);
    if (!mod) {
      throw Errors.notFound("Module", moduleKey);
    }
    return this.performToggle(clinicId, mod, enabled);
  }

  async toggleModuleById(
    clinicId: string,
    moduleId: number,
    enabled: boolean,
  ): Promise<ToggleResult> {
    const mod = MODULE_CATALOG.find((m) => m.id === moduleId);
    if (!mod) {
      throw Errors.notFound("Module", String(moduleId));
    }
    return this.performToggle(clinicId, mod, enabled);
  }

  private async performToggle(
    clinicId: string,
    mod: CatalogModule,
    enabled: boolean,
  ): Promise<ToggleResult> {
    const overrides = await this.clinicModuleRepo.listByClinic(clinicId);
    const overridesMap = new Map(
      overrides.map((o) => [o.module_catalog.module_key, o.is_active]),
    );

    const resolvedActive = (moduleKey: string, defaultActive: boolean) => {
      if (overridesMap.has(moduleKey)) {
        return overridesMap.get(moduleKey)!;
      }
      return defaultActive;
    };

    const activeKeys = new Set(
      MODULE_CATALOG.filter((m) =>
        resolvedActive(m.module_key, m.is_active),
      ).map((m) => m.module_key),
    );

    if (enabled) {
      const unmet = mod.dependencies.filter((dep) => !activeKeys.has(dep));
      if (unmet.length > 0) {
        throw Errors.conflict(
          `Dependencias nao atendidas: ${unmet.join(", ")}`,
        );
      }
    } else {
      const dependents = MODULE_CATALOG.filter(
        (m) =>
          resolvedActive(m.module_key, m.is_active) &&
          m.dependencies.includes(mod.module_key),
      );
      if (dependents.length > 0) {
        throw Errors.conflict(
          `Modulo tem dependentes ativos: ${dependents.map((d) => d.name).join(", ")}`,
        );
      }
    }

    await this.clinicModuleRepo.toggle(clinicId, mod.module_key, enabled);

    const updatedOverrides = await this.clinicModuleRepo.listByClinic(clinicId);
    const updatedOverridesMap = new Map(
      updatedOverrides.map((o) => [o.module_catalog.module_key, o.is_active]),
    );

    return {
      success: true,
      module: buildModuleView(MODULE_CATALOG, updatedOverridesMap).find(
        (m) => m.module_key === mod.module_key,
      ),
      message: `Modulo ${enabled ? "ativado" : "desativado"} com sucesso`,
    };
  }

  applyModuleTemplate(): { message: string } {
    return { message: "Template applied successfully" };
  }

  suggestModules(): {
    suggestions: Array<{ id: string; name: string; reason: string }>;
  } {
    return {
      suggestions: [
        {
          id: "1",
          name: "Advanced Analytics",
          reason: "You process high volume sales",
        },
        {
          id: "2",
          name: "CRM Integration",
          reason: "Missing patient onboarding flows",
        },
      ],
    };
  }

  recommendModuleSequence(): { sequence: string[] } {
    return { sequence: ["Core ERP", "Finance Module", "Patient Portal"] };
  }

  importClinicData(data: unknown[]): { message: string; processed: number } {
    return { message: "Data imported successfully", processed: data.length };
  }

  async exportClinicData(
    clinicId?: string,
  ): Promise<{ export: unknown[]; format: string }> {
    if (!clinicId) {
      throw Errors.unauthorized("clinicId is required");
    }
    const patients = await this.clinicDataRepo.findPatientsByClinic(clinicId);
    return { export: patients, format: "json" };
  }
}
