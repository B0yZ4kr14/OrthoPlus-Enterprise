import { logger } from '@/infrastructure/logger';
import { ClinicDataRepository } from "@/modules/configuracoes/infrastructure/ClinicDataRepository";
import { Request, Response } from "express";

interface CatalogModule {
  id: number;
  module_key: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  subscribed: boolean;
  is_active: boolean;
  dependencies: string[];
}

const MODULE_CATALOG: CatalogModule[] = [
  {
    id: 1,
    module_key: "DASHBOARD",
    name: "Dashboard",
    description: "Painel principal com KPIs e métricas",
    category: "CORE",
    icon: "LayoutDashboard",
    subscribed: true,
    is_active: true,
    dependencies: [],
  },
  {
    id: 2,
    module_key: "AGENDA",
    name: "Agenda",
    description: "Agendamento de consultas e procedimentos",
    category: "CORE",
    icon: "CalendarDays",
    subscribed: true,
    is_active: true,
    dependencies: [],
  },
  {
    id: 3,
    module_key: "PACIENTES",
    name: "Pacientes",
    description: "Gestão de pacientes e prontuários",
    category: "CORE",
    icon: "Users",
    subscribed: true,
    is_active: true,
    dependencies: [],
  },
  {
    id: 4,
    module_key: "PEP",
    name: "Prontuário Eletrônico",
    description: "Prontuário eletrônico do paciente",
    category: "CORE",
    icon: "FileHeart",
    subscribed: true,
    is_active: true,
    dependencies: ["PACIENTES"],
  },
  {
    id: 5,
    module_key: "FINANCEIRO",
    name: "Financeiro",
    description: "Gestão financeira e contas",
    category: "FINANCEIRO",
    icon: "PieChart",
    subscribed: true,
    is_active: true,
    dependencies: [],
  },
  {
    id: 6,
    module_key: "PDV",
    name: "Ponto de Venda",
    description: "Ponto de venda e cobranças",
    category: "FINANCEIRO",
    icon: "BarChart3",
    subscribed: true,
    is_active: true,
    dependencies: ["FINANCEIRO"],
  },
  {
    id: 7,
    module_key: "FISCAL",
    name: "Fiscal",
    description: "Emissão de notas fiscais",
    category: "FINANCEIRO",
    icon: "FileText",
    subscribed: true,
    is_active: true,
    dependencies: ["FINANCEIRO"],
  },
  {
    id: 8,
    module_key: "ESTOQUE",
    name: "Estoque",
    description: "Controle de materiais e insumos",
    category: "OPERACIONAL",
    icon: "Package",
    subscribed: true,
    is_active: true,
    dependencies: [],
  },
  {
    id: 9,
    module_key: "INVENTARIO",
    name: "Inventário",
    description: "Inventário e contagem de estoque",
    category: "OPERACIONAL",
    icon: "Clipboard",
    subscribed: true,
    is_active: true,
    dependencies: ["ESTOQUE"],
  },
  {
    id: 10,
    module_key: "CRM",
    name: "CRM",
    description: "Gestão de leads e funil de vendas",
    category: "COMERCIAL",
    icon: "Target",
    subscribed: true,
    is_active: true,
    dependencies: [],
  },
  {
    id: 11,
    module_key: "FIDELIDADE",
    name: "Fidelidade",
    description: "Programa de fidelidade e pontos",
    category: "COMERCIAL",
    icon: "Send",
    subscribed: true,
    is_active: true,
    dependencies: ["PACIENTES"],
  },
  {
    id: 12,
    module_key: "CRYPTO_PAYMENTS",
    name: "Pagamentos Crypto",
    description: "Pagamentos em criptomoedas",
    category: "FINANCEIRO",
    icon: "Bitcoin",
    subscribed: true,
    is_active: true,
    dependencies: ["FINANCEIRO"],
  },
  {
    id: 13,
    module_key: "TELEODONTO",
    name: "Teleodonto",
    description: "Teleconsulta odontológica",
    category: "CLINICO",
    icon: "Video",
    subscribed: true,
    is_active: true,
    dependencies: ["PACIENTES", "AGENDA"],
  },
  {
    id: 14,
    module_key: "TISS",
    name: "TISS",
    description: "Integração com convênios via TISS",
    category: "CLINICO",
    icon: "FileSpreadsheet",
    subscribed: true,
    is_active: true,
    dependencies: ["PACIENTES"],
  },
  {
    id: 15,
    module_key: "BI",
    name: "Business Intelligence",
    description: "Relatórios avançados e BI",
    category: "ADMINISTRATIVO",
    icon: "BarChart3",
    subscribed: true,
    is_active: true,
    dependencies: ["DASHBOARD"],
  },
  {
    id: 16,
    module_key: "LGPD",
    name: "LGPD",
    description: "Conformidade com Lei Geral de Proteção de Dados",
    category: "ADMINISTRATIVO",
    icon: "ShieldCheck",
    subscribed: true,
    is_active: true,
    dependencies: [],
  },
  {
    id: 17,
    module_key: "DENTISTAS",
    name: "Dentistas",
    description: "Gestão de dentistas e especialistas",
    category: "CLINICO",
    icon: "Stethoscope",
    subscribed: true,
    is_active: true,
    dependencies: [],
  },
  {
    id: 18,
    module_key: "FUNCIONARIOS",
    name: "Funcionários",
    description: "Gestão de funcionários e equipe",
    category: "ADMINISTRATIVO",
    icon: "Users",
    subscribed: true,
    is_active: true,
    dependencies: [],
  },
];

function buildModuleView(catalog: CatalogModule[]) {
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

export class ModulosController {
  private clinicDataRepo = new ClinicDataRepository()
  public getMyModules = (_req: Request, res: Response) => {
    res.json({ modules: buildModuleView(MODULE_CATALOG) });
  };

  public getDependencies = (_req: Request, res: Response) => {
    const deps = MODULE_CATALOG.filter(
      (m) => m.dependencies && m.dependencies.length > 0,
    ).map((m) => ({
      module_key: m.module_key,
      depends_on: m.dependencies,
    }));

    res.json({ dependencies: deps });
  };

  // Toggle by module_key (used by frontend)
  public toggleModuleByKey = (req: Request, res: Response) => {
    const { module_key } = req.body as { module_key?: string };
    if (!module_key) {
      return res.status(400).json({ error: "module_key is required" });
    }

    const mod = MODULE_CATALOG.find((m) => m.module_key === module_key);
    if (!mod) {
      return res.status(404).json({ error: "Módulo não encontrado" });
    }

    return this._performToggle(mod, res);
  };

  // Toggle by numeric id (legacy route)
  public toggleModuleState = (req: Request, res: Response) => {
    const moduleId = parseInt(req.params.id, 10);
    const mod = MODULE_CATALOG.find((m) => m.id === moduleId);

    if (!mod) {
      return res.status(404).json({ error: "Módulo não encontrado" });
    }

    return this._performToggle(mod, res);
  };

  private _performToggle = (mod: CatalogModule, res: Response) => {
    const activeKeys = new Set(
      MODULE_CATALOG.filter((m) => m.is_active).map((m) => m.module_key),
    );

    if (!mod.is_active) {
      const unmet = mod.dependencies.filter((dep) => !activeKeys.has(dep));
      if (unmet.length > 0) {
        return res.status(412).json({
          error: `Dependências não atendidas: ${unmet.join(", ")}`,
          unmetDependencies: unmet,
        });
      }
    } else {
      const dependents = MODULE_CATALOG.filter(
        (m) => m.is_active && m.dependencies.includes(mod.module_key),
      );
      if (dependents.length > 0) {
        return res.status(412).json({
          error: `Módulo tem dependentes ativos: ${dependents.map((d) => d.name).join(", ")}`,
          activeDependents: dependents.map((d) => d.module_key),
        });
      }
    }

    mod.is_active = !mod.is_active;
    return res.json({
      success: true,
      module: buildModuleView(MODULE_CATALOG).find(
        (m) => m.module_key === mod.module_key,
      ),
      message: `Módulo ${mod.is_active ? "ativado" : "desativado"} com sucesso`,
    });
  };

  // ═══════════════════ LEGACY MODULES ENDPOINTS ═══════════════════

  public applyModuleTemplate = async (_req: Request, res: Response) => {
    try {
      return res.status(200).json({ message: "Template applied successfully" });
    } catch (error) {
      logger.error("Error applying module template:", { error });
      return res.status(500).json({ error: "Internal Server Error" });
    }
  };

  public suggestModules = async (_req: Request, res: Response) => {
    try {
      return res.status(200).json({
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
      });
    } catch (error) {
      logger.error("Error suggesting modules:", { error });
      return res.status(500).json({ error: "Internal Server Error" });
    }
  };

  public recommendModuleSequence = async (_req: Request, res: Response) => {
    try {
      return res.status(200).json({
        sequence: ["Core ERP", "Finance Module", "Patient Portal"],
      });
    } catch (error) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
  };

  public importClinicData = async (req: Request, res: Response) => {
    try {
      const { data } = req.body as { data: unknown[] };
      if (!data) return res.status(400).json({ error: "No data provided" });

      return res
        .status(200)
        .json({ message: "Data imported successfully", processed: data.length });
    } catch (error) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
  };

  public exportClinicData = async (req: Request, res: Response) => {
    try {
      const user = req.user;
      if (!user) return res.status(401).json({ error: "Unauthorized" });

      const patients = await this.clinicDataRepo.findPatientsByClinic(user.clinicId);

      return res.status(200).json({ export: patients, format: "json" });
    } catch (error) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
  };
}
