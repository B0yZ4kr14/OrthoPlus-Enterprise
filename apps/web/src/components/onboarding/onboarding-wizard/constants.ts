// cspell:disable
import type { Step } from "./types";

export const STEPS: Step[] = [
  {
    id: "overview",
    title: "Visão Geral",
    description: "Conheça o Ortho+ e seus recursos",
    // @ts-expect-error — will be resolved at runtime
    component: () => import("../steps/StepOverview").then((m) => m.StepOverview),
  },
  {
    id: "activation",
    title: "Ativação de Módulos",
    description: "Configure quais módulos estarão ativos",
    // @ts-expect-error — will be resolved at runtime
    component: () => import("../steps/StepActivation").then((m) => m.StepActivation),
  },
  {
    id: "dependencies",
    title: "Dependências",
    description: "Entenda as dependências entre módulos",
    // @ts-expect-error — will be resolved at runtime
    component: () => import("../steps/StepDependencies").then((m) => m.StepDependencies),
  },
  {
    id: "simulation",
    title: "Simulação",
    description: "Experimente ativar e desativar módulos",
    // @ts-expect-error — will be resolved at runtime
    component: () => import("../steps/StepSimulation").then((m) => m.StepSimulation),
  },
  {
    id: "export",
    title: "Configuração Final",
    description: "Exporte sua configuração personalizada",
    // @ts-expect-error — will be resolved at runtime
    component: () => import("../steps/StepExport").then((m) => m.StepExport),
  },
];
