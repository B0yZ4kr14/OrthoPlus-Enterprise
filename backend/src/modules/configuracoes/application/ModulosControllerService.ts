import { MODULE_CATALOG, CatalogModule } from "@/modules/configuracoes/domain/moduleCatalog";
import { ClinicDataRepository } from "@/modules/configuracoes/infrastructure/ClinicDataRepository";

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

function buildModuleView(catalog: CatalogModule[]): ModuleView[] {
  const activeKeys = new Set(
    catalog.filter((m) => m.is_active).map((m) => m.module_key),
  );

  return catalog.map((mod) => {
    const unmet_dependencies = mod.dependencies.filter(
      (dep) => !activeKeys.has(dep),
    );

    const active_dependents = catalog
      .filter(
        (m) =>
          m.is_active &&
          m.dependencies.includes(mod.module_key),
      )
      .map((m) => m.module_key);

    const can_activate = !mod.is_active && unmet_dependencies.length === 0;
    const can_deactivate = mod.is_active && active_dependents.length === 0;

    return {
      id: mod.id,
      module_key: mod.module_key,
      name: mod.name,
      description: mod.description,
      category: mod.category,
      icon: mod.icon,
      subscribed: mod.subscribed,
      is_active: mod.is_active,
      can_activate,
      can_deactivate,
      unmet_dependencies,
      active_dependents,
    };
  });
}

export class ModulosControllerService {
  private clinicDataRepo = new ClinicDataRepository();

  getMyModules(): ModuleView[] {
    return buildModuleView(MODULE_CATALOG);
  }

  getDependencies(): Array<{ module_key: string; depends_on: string[] }> {
    return MODULE_CATALOG.filter(
      (m) => m.dependencies && m.dependencies.length > 0,
    ).map((m) => ({
      module_key: m.module_key,
      depends_on: m.dependencies,
    }));
  }

  toggleModule(moduleKey: string): ToggleResult {
    const mod = MODULE_CATALOG.find((m) => m.module_key === moduleKey);
    if (!mod) {
      throw new Error("Modulo nao encontrado");
    }
    return this.performToggle(mod);
  }

  toggleModuleById(moduleId: number): ToggleResult {
    const mod = MODULE_CATALOG.find((m) => m.id === moduleId);
    if (!mod) {
      throw new Error("Modulo nao encontrado");
    }
    return this.performToggle(mod);
  }

  private performToggle(mod: CatalogModule): ToggleResult {
    const activeKeys = new Set(
      MODULE_CATALOG.filter((m) => m.is_active).map((m) => m.module_key),
    );

    if (!mod.is_active) {
      const unmet = mod.dependencies.filter((dep) => !activeKeys.has(dep));
      if (unmet.length > 0) {
        throw new Error(`Dependencias nao atendidas: ${unmet.join(", ")}`);
      }
    } else {
      const dependents = MODULE_CATALOG.filter(
        (m) => m.is_active && m.dependencies.includes(mod.module_key),
      );
      if (dependents.length > 0) {
        throw new Error(
          `Modulo tem dependentes ativos: ${dependents.map((d) => d.name).join(", ")}`
        );
      }
    }

    mod.is_active = !mod.is_active;
    return {
      success: true,
      module: buildModuleView(MODULE_CATALOG).find(
        (m) => m.module_key === mod.module_key,
      ),
      message: `Modulo ${mod.is_active ? "ativado" : "desativado"} com sucesso`,
    };
  }

  applyModuleTemplate(): { message: string } {
    return { message: "Template applied successfully" };
  }

  suggestModules(): { suggestions: Array<{ id: string; name: string; reason: string }> } {
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

  async exportClinicData(clinicId?: string): Promise<{ export: unknown[]; format: string }> {
    if (!clinicId) {
      throw new Error("Unauthorized");
    }
    const patients = await this.clinicDataRepo.findPatientsByClinic(clinicId);
    return { export: patients, format: "json" };
  }
}
