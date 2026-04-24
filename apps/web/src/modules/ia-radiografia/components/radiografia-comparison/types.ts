// cspell:disable
import type { AnaliseComplete } from "../../types/radiografia.types";

export interface PacienteAnalises {
  patientId: string;
  patientName: string;
  analises: AnaliseComplete[];
}

export interface ComparacaoData {
  problemas: {
    valor: number;
    percentual: string;
    tendencia: "aumentou" | "diminuiu" | "manteve";
  };
  precisao: {
    valor: string;
    tendencia: "melhorou" | "piorou" | "manteve";
  };
  diasEntre: number;
}

export interface RadiografiaComparisonState {
  analise1Id: string;
  analise2Id: string;
}
