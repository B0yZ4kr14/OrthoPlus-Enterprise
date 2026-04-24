export interface SimulationModule {
  id: string;
  name: string;
  active: boolean;
  essential: boolean;
  requires?: string[];
}

export const SIMULATION_MODULES: SimulationModule[] = [
  { id: "FINANCEIRO", name: "Financeiro", active: true, essential: false },
  {
    id: "SPLIT",
    name: "Split de Pagamento",
    active: true,
    essential: false,
    requires: ["FINANCEIRO"],
  },
  {
    id: "COBRANCA",
    name: "Inadimplência",
    active: false,
    essential: false,
    requires: ["FINANCEIRO"],
  },
];

export interface ModuleDependencyInfo {
  canToggle: boolean;
  dependents: SimulationModule[];
  missingDeps: string[];
}
