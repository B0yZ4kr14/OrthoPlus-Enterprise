import { describe, it, expect } from "vitest";
import {
  MODULES_CONFIG,
  getModuleDependencies,
  hasAllDependencies,
} from "../modules.config";

describe("Module Dependencies Logic", () => {
  describe("Dependency Chain Validation", () => {
    it("SPLIT_PAGAMENTO deve depender apenas de FINANCEIRO", () => {
      const deps = getModuleDependencies("SPLIT_PAGAMENTO");
      expect(deps).toEqual(["FINANCEIRO"]);
    });

    it("INADIMPLENCIA deve depender apenas de FINANCEIRO", () => {
      const deps = getModuleDependencies("INADIMPLENCIA");
      expect(deps).toEqual(["FINANCEIRO"]);
    });

    it("ORCAMENTOS deve depender de ODONTOGRAMA", () => {
      const deps = getModuleDependencies("ORCAMENTOS");
      expect(deps).toEqual(["ODONTOGRAMA"]);
    });

    it("ASSINATURA_ICP deve depender de PEP", () => {
      const deps = getModuleDependencies("ASSINATURA_ICP");
      expect(deps).toEqual(["PEP"]);
    });

    it("IA deve depender de PEP e FLUXO_DIGITAL", () => {
      const deps = getModuleDependencies("IA");
      expect(deps).toContain("PEP");
      expect(deps).toContain("FLUXO_DIGITAL");
    });
  });

  describe("Circular Dependency Detection", () => {
    it("não deve ter dependências circulares diretas", () => {
      Object.keys(MODULES_CONFIG).forEach((moduleKey) => {
        const deps = getModuleDependencies(moduleKey);
        deps.forEach((dep) => {
          const depDeps = getModuleDependencies(dep);
          expect(depDeps).not.toContain(moduleKey);
        });
      });
    });

    it("não deve ter dependências circulares indiretas (3 níveis)", () => {
      Object.keys(MODULES_CONFIG).forEach((moduleKey) => {
        const level1 = getModuleDependencies(moduleKey);

        level1.forEach((dep1) => {
          const level2 = getModuleDependencies(dep1);

          level2.forEach((dep2) => {
            const level3 = getModuleDependencies(dep2);
            expect(level3).not.toContain(moduleKey);
          });
        });
      });
    });
  });

  describe("Activation Rules", () => {
    it("deve permitir ativar módulo sem dependências", () => {
      const result = hasAllDependencies("DASHBOARD", []);
      expect(result).toBe(true);
    });

    it("deve permitir ativar módulo com todas dependências ativas", () => {
      const result = hasAllDependencies("SPLIT_PAGAMENTO", ["FINANCEIRO"]);
      expect(result).toBe(true);
    });

    it("não deve permitir ativar módulo sem dependências necessárias", () => {
      const result = hasAllDependencies("SPLIT_PAGAMENTO", []);
      expect(result).toBe(false);
    });

    it("deve validar múltiplas dependências corretamente", () => {
      const result = hasAllDependencies("IA", ["PEP", "FLUXO_DIGITAL"]);
      expect(result).toBe(true);
    });

    it("não deve permitir ativar se falta uma dependência", () => {
      const result = hasAllDependencies("IA", ["PEP"]); // Falta FLUXO_DIGITAL
      expect(result).toBe(false);
    });
  });

  describe("Dependency Graph Integrity", () => {
    it("todas as dependências devem existir no catálogo", () => {
      Object.values(MODULES_CONFIG).forEach((module) => {
        module.dependencies?.forEach((dep) => {
          expect(MODULES_CONFIG[dep]).toBeDefined();
          expect(MODULES_CONFIG[dep].key).toBe(dep);
        });
      });
    });

    it("módulos core não devem ter dependências", () => {
      const coreModules = [
        "DASHBOARD",
        "PACIENTES",
        "AGENDA",
        "PEP",
        "FINANCEIRO",
      ];

      coreModules.forEach((moduleKey) => {
        const deps = getModuleDependencies(moduleKey);
        expect(deps.length).toBe(0);
      });
    });

    it("módulos avançados devem ter pelo menos uma dependência", () => {
      const advancedModules = [
        "SPLIT_PAGAMENTO",
        "INADIMPLENCIA",
        "ASSINATURA_ICP",
        "IA",
      ];

      advancedModules.forEach((moduleKey) => {
        const deps = getModuleDependencies(moduleKey);
        expect(deps.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Edge Cases", () => {
    it("deve retornar array vazio para módulo inexistente", () => {
      const deps = getModuleDependencies("MODULO_INEXISTENTE");
      expect(deps).toEqual([]);
    });

    it("hasAllDependencies deve retornar true para módulo inexistente", () => {
      const result = hasAllDependencies("MODULO_INEXISTENTE", []);
      expect(result).toBe(true);
    });

    it("deve lidar com activeModules vazio corretamente", () => {
      const result = hasAllDependencies("DASHBOARD", []);
      expect(result).toBe(true);
    });

    it("deve lidar com activeModules com módulos extras", () => {
      const result = hasAllDependencies("SPLIT_PAGAMENTO", [
        "FINANCEIRO",
        "PEP",
        "DASHBOARD",
      ]);
      expect(result).toBe(true);
    });
  });
});
