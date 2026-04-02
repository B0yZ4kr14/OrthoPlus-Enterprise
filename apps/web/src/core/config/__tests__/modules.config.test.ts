import { describe, it, expect } from "vitest";
import {
  MODULES_CONFIG,
  getModulesByCategory,
  getModuleDependencies,
  hasAllDependencies,
  groupModulesByCategory,
  getModuleStats,
  Module,
} from "../modules.config";

describe("ModulesConfig", () => {
  describe("MODULES_CONFIG", () => {
    it("deve ter todos os módulos com dependencies válidas", () => {
      Object.values(MODULES_CONFIG).forEach((module) => {
        module.dependencies?.forEach((dep) => {
          expect(MODULES_CONFIG[dep]).toBeDefined();
        });
      });
    });

    it("não deve ter módulos sem key", () => {
      Object.values(MODULES_CONFIG).forEach((module) => {
        expect(module.key).toBeDefined();
        expect(module.key.length).toBeGreaterThan(0);
      });
    });

    it("não deve ter módulos sem nome", () => {
      Object.values(MODULES_CONFIG).forEach((module) => {
        expect(module.name).toBeDefined();
        expect(module.name.length).toBeGreaterThan(0);
      });
    });

    it("não deve ter dependências circulares", () => {
      const checkCircular = (
        moduleKey: string,
        visited: Set<string> = new Set(),
      ): boolean => {
        if (visited.has(moduleKey)) return true;

        visited.add(moduleKey);
        const deps = getModuleDependencies(moduleKey);

        for (const dep of deps) {
          if (checkCircular(dep, new Set(visited))) {
            return true;
          }
        }

        return false;
      };

      Object.keys(MODULES_CONFIG).forEach((moduleKey) => {
        expect(checkCircular(moduleKey)).toBe(false);
      });
    });
  });

  describe("getModulesByCategory", () => {
    it("deve retornar módulos da categoria correta", () => {
      const financeiro = getModulesByCategory("Gestão Financeira");

      expect(financeiro).toBeDefined();
      expect(financeiro.length).toBeGreaterThan(0);

      financeiro.forEach((module) => {
        expect(module.category).toBe("Gestão Financeira");
      });
    });

    it("deve retornar array vazio para categoria inexistente", () => {
      const result = getModulesByCategory("Categoria Inexistente");
      expect(result).toEqual([]);
    });
  });

  describe("getModuleDependencies", () => {
    it("deve retornar dependências do módulo SPLIT_PAGAMENTO", () => {
      const deps = getModuleDependencies("SPLIT_PAGAMENTO");
      expect(deps).toEqual(["FINANCEIRO"]);
    });

    it("deve retornar array vazio para módulo sem dependências", () => {
      const deps = getModuleDependencies("DASHBOARD");
      expect(deps).toEqual([]);
    });

    it("deve retornar array vazio para módulo inexistente", () => {
      const deps = getModuleDependencies("INEXISTENTE");
      expect(deps).toEqual([]);
    });
  });

  describe("hasAllDependencies", () => {
    it("deve retornar true se todas as dependências estão ativas", () => {
      const result = hasAllDependencies("SPLIT_PAGAMENTO", [
        "FINANCEIRO",
        "PEP",
      ]);
      expect(result).toBe(true);
    });

    it("deve retornar false se alguma dependência está faltando", () => {
      const result = hasAllDependencies("SPLIT_PAGAMENTO", ["PEP"]);
      expect(result).toBe(false);
    });

    it("deve retornar true para módulo sem dependências", () => {
      const result = hasAllDependencies("DASHBOARD", []);
      expect(result).toBe(true);
    });
  });

  describe("groupModulesByCategory", () => {
    const mockModules: Module[] = [
      {
        id: 1,
        module_key: "FINANCEIRO",
        name: "Financeiro",
        description: "Gestão financeira",
        category: "Gestão Financeira",
        icon: "DollarSign",
        subscribed: true,
        is_active: true,
        can_activate: true,
        can_deactivate: true,
        unmet_dependencies: [],
        active_dependents: [],
      },
      {
        id: 2,
        module_key: "PEP",
        name: "PEP",
        description: "Prontuário",
        category: "Atendimento Clínico",
        icon: "FileText",
        subscribed: true,
        is_active: true,
        can_activate: true,
        can_deactivate: false,
        unmet_dependencies: [],
        active_dependents: ["ORCAMENTOS"],
      },
    ];

    it("deve agrupar módulos por categoria", () => {
      const grouped = groupModulesByCategory(mockModules);

      expect(grouped.length).toBe(2);
      expect(
        grouped.find((g) => g.name === "Gestão Financeira")?.modules.length,
      ).toBe(1);
      expect(
        grouped.find((g) => g.name === "Atendimento Clínico")?.modules.length,
      ).toBe(1);
    });

    it("deve incluir label da categoria", () => {
      const grouped = groupModulesByCategory(mockModules);

      const financeiro = grouped.find((g) => g.name === "Gestão Financeira");
      expect(financeiro?.label).toBe("Financeiro");
    });
  });

  describe("getModuleStats", () => {
    const mockModules: Module[] = [
      {
        id: 1,
        module_key: "MOD1",
        name: "Módulo 1",
        description: "Desc",
        category: "Cat",
        icon: "Icon",
        subscribed: true,
        is_active: true,
        can_activate: true,
        can_deactivate: true,
        unmet_dependencies: [],
        active_dependents: [],
      },
      {
        id: 2,
        module_key: "MOD2",
        name: "Módulo 2",
        description: "Desc",
        category: "Cat",
        icon: "Icon",
        subscribed: true,
        is_active: false,
        can_activate: true,
        can_deactivate: true,
        unmet_dependencies: [],
        active_dependents: [],
      },
      {
        id: 3,
        module_key: "MOD3",
        name: "Módulo 3",
        description: "Desc",
        category: "Cat",
        icon: "Icon",
        subscribed: false,
        is_active: false,
        can_activate: false,
        can_deactivate: true,
        unmet_dependencies: [],
        active_dependents: [],
      },
    ];

    it("deve calcular estatísticas corretamente", () => {
      const stats = getModuleStats(mockModules);

      expect(stats.total).toBe(3);
      expect(stats.subscribed).toBe(2);
      expect(stats.active).toBe(1);
      expect(stats.available).toBe(1);
    });
  });
});
