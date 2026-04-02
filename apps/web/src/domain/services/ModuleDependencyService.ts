/**
 * Module Dependency Service
 * Serviço de domínio para gerenciar dependências entre módulos
 */
export class ModuleDependencyService {
  /**
   * Verifica se um módulo pode ser ativado baseado em suas dependências
   * @param moduleKey - Chave do módulo a ser ativado
   * @param activeModules - Lista de módulos atualmente ativos
   * @param dependencies - Mapa de dependências (moduleKey -> requiredModuleKeys[])
   */
  canActivate(
    moduleKey: string,
    activeModules: string[],
    dependencies: Map<string, string[]>,
  ): { canActivate: boolean; unmetDependencies: string[] } {
    const requiredModules = dependencies.get(moduleKey) || [];

    const unmetDependencies = requiredModules.filter(
      (required) => !activeModules.includes(required),
    );

    return {
      canActivate: unmetDependencies.length === 0,
      unmetDependencies,
    };
  }

  /**
   * Verifica se um módulo pode ser desativado
   * (Não pode desativar se outros módulos ativos dependem dele)
   * @param moduleKey - Chave do módulo a ser desativado
   * @param activeModules - Lista de módulos atualmente ativos
   * @param dependencies - Mapa de dependências (moduleKey -> requiredModuleKeys[])
   */
  canDeactivate(
    moduleKey: string,
    activeModules: string[],
    dependencies: Map<string, string[]>,
  ): { canDeactivate: boolean; dependentModules: string[] } {
    // Encontra módulos ativos que dependem deste
    const dependentModules: string[] = [];

    for (const [module, required] of dependencies.entries()) {
      if (
        required.includes(moduleKey) &&
        activeModules.includes(module) &&
        module !== moduleKey
      ) {
        dependentModules.push(module);
      }
    }

    return {
      canDeactivate: dependentModules.length === 0,
      dependentModules,
    };
  }

  /**
   * Calcula a sequência recomendada de ativação de módulos
   * baseada no grafo de dependências (Topological Sort)
   * @param targetModule - Módulo que se deseja ativar
   * @param dependencies - Mapa de dependências
   */
  calculateActivationSequence(
    targetModule: string,
    dependencies: Map<string, string[]>,
  ): string[] {
    const sequence: string[] = [];
    const visited = new Set<string>();

    const visit = (module: string) => {
      if (visited.has(module)) return;
      visited.add(module);

      const deps = dependencies.get(module) || [];
      for (const dep of deps) {
        visit(dep);
      }

      sequence.push(module);
    };

    visit(targetModule);
    return sequence;
  }

  /**
   * Valida o grafo de dependências para detectar ciclos
   * @param dependencies - Mapa de dependências
   */
  validateDependencyGraph(dependencies: Map<string, string[]>): {
    isValid: boolean;
    cycles: string[][];
  } {
    const cycles: string[][] = [];
    const visiting = new Set<string>();
    const visited = new Set<string>();

    const detectCycle = (module: string, path: string[]): void => {
      if (visiting.has(module)) {
        // Ciclo detectado
        const cycleStart = path.indexOf(module);
        cycles.push(path.slice(cycleStart));
        return;
      }

      if (visited.has(module)) return;

      visiting.add(module);
      path.push(module);

      const deps = dependencies.get(module) || [];
      for (const dep of deps) {
        detectCycle(dep, [...path]);
      }

      visiting.delete(module);
      visited.add(module);
    };

    for (const module of dependencies.keys()) {
      if (!visited.has(module)) {
        detectCycle(module, []);
      }
    }

    return {
      isValid: cycles.length === 0,
      cycles,
    };
  }
}
