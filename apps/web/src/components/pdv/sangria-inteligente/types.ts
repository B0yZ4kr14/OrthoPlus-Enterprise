// cspell:disable

export interface AnaliseIA {
  riscoPercentual: number;
  horaAtual: number;
  valorAtualCaixa: number;
  totalIncidentes: number;
  mediaValorSangrias: number;
  horariosRisco: Array<{
    hora: number;
    incidentes: number;
  }>;
}

export interface SugestaoIA {
  deveSugerirSangria: boolean;
  valorSugerido: number;
  motivo: string;
  analise: AnaliseIA;
}

export interface SangriaInteligenteProps {
  caixaId: string;
  valorAtualCaixa: number;
}
