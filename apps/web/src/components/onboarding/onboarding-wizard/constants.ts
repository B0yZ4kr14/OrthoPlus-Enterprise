// cspell:disable
import { lazy } from "react";
import type { Step } from "./types";

export const STEPS: Step[] = [
  {
    id: "overview",
    title: "Visão Geral",
    description: "Conheça o OrthoPlus Enterprise e seus recursos",
    component: lazy(() =>
      import("../steps/StepOverview").then((m) => ({
        default: m.StepOverview,
      })),
    ),
  },
  {
    id: "activation",
    title: "Ativação de Módulos",
    description: "Configure quais módulos estarão ativos",
    component: lazy(() =>
      import("../steps/StepActivation").then((m) => ({
        default: m.StepActivation,
      })),
    ),
  },
  {
    id: "dependencies",
    title: "Dependências",
    description: "Entenda as dependências entre módulos",
    component: lazy(() =>
      import("../steps/StepDependencies").then((m) => ({
        default: m.StepDependencies,
      })),
    ),
  },
  {
    id: "simulation",
    title: "Simulação",
    description: "Experimente ativar e desativar módulos",
    component: lazy(() =>
      import("../steps/StepSimulation").then((m) => ({
        default: m.StepSimulation,
      })),
    ),
  },
  {
    id: "export",
    title: "Configuração Final",
    description: "Exporte sua configuração personalizada",
    component: lazy(() =>
      import("../steps/StepExport").then((m) => ({ default: m.StepExport })),
    ),
  },
];
