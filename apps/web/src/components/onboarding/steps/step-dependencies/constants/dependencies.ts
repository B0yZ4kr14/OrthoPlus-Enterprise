export interface Dependency {
  module: string;
  requires: string[];
  reason: string;
}

export const DEPENDENCIES: Dependency[] = [
  {
    module: "Split de Pagamento",
    requires: ["Gestão Financeira"],
    reason:
      "O split de pagamento precisa dividir transações financeiras já registradas",
  },
  {
    module: "Controle de Inadimplência",
    requires: ["Gestão Financeira"],
    reason:
      "A cobrança automática monitora contas a receber do módulo financeiro",
  },
  {
    module: "IA de Análise de Raio-X",
    requires: ["Prontuário Eletrônico (PEP)"],
    reason:
      "Os resultados da análise de IA são salvos diretamente no prontuário",
  },
  {
    module: "Assinatura Digital ICP-Brasil",
    requires: ["Prontuário Eletrônico (PEP)"],
    reason: "A assinatura digital valida documentos e evoluções do prontuário",
  },
];
