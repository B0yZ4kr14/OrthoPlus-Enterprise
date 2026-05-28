/**
 * FASE 1 - SPRINT 1.3: STATUS CANÔNICOS ODONTOLÓGICOS
 * 14 Estados oficiais do ciclo de vida do paciente em clínicas odontológicas
 */

export type PatientStatus =
  | "ABANDONO" // Paciente abandonou tratamento sem conclusão
  | "AFASTAMENTO_TEMPORARIO" // Afastado temporariamente (viagem, problema pessoal)
  | "A_PROTESTAR" // Inadimplência grave, aguardando protesto
  | "CANCELADO" // Cadastro cancelado (duplicado, erro, solicitação)
  | "CONTENCAO" // Em fase de contenção pós-tratamento ortodôntico
  | "CONCLUIDO" // Tratamento totalmente concluído
  | "ERUPCAO" // Aguardando erupção dentária (ortodontia infantil)
  | "INATIVO" // Inativo mas pode retornar (não é abandono)
  | "MIGRADO" // Migrado para outra clínica (transferência)
  | "PROSPECT" // Lead ainda não convertido em paciente
  | "PROTESTO" // Em protesto por inadimplência
  | "RESPONSAVEL" // Responsável financeiro (não é o paciente)
  | "TRATAMENTO" // Em tratamento ativo
  | "TRANSFERENCIA"; // Em processo de transferência

export interface PatientStatusChange {
  id: string;
  patient_id: string;
  from_status: PatientStatus | null;
  to_status: PatientStatus;
  changed_at: string;
  changed_by: string;
  reason: string | null;
  notes: string | null;
}

/**
 * Transições válidas entre status
 * Implementa regras de negócio para mudanças de estado
 */
export const VALID_STATUS_TRANSITIONS: Record<PatientStatus, PatientStatus[]> =
  {
    PROSPECT: ["TRATAMENTO", "CANCELADO", "INATIVO"],
    TRATAMENTO: [
      "CONTENCAO",
      "CONCLUIDO",
      "AFASTAMENTO_TEMPORARIO",
      "ABANDONO",
      "A_PROTESTAR",
      "TRANSFERENCIA",
    ],
    CONTENCAO: ["CONCLUIDO", "TRATAMENTO", "ABANDONO"],
    ERUPCAO: ["TRATAMENTO", "ABANDONO"],
    AFASTAMENTO_TEMPORARIO: ["TRATAMENTO", "ABANDONO", "INATIVO"],
    CONCLUIDO: ["TRATAMENTO", "INATIVO"], // Pode retornar para novo tratamento
    ABANDONO: ["PROSPECT", "INATIVO"], // Pode ser reativado
    A_PROTESTAR: ["PROTESTO", "TRATAMENTO", "CANCELADO"],
    PROTESTO: ["TRATAMENTO", "CANCELADO"], // Se quitou, volta a tratamento
    INATIVO: ["PROSPECT", "TRATAMENTO"], // Reativação
    CANCELADO: [], // Estado final
    MIGRADO: [], // Estado final
    TRANSFERENCIA: ["MIGRADO", "TRATAMENTO"], // Pode cancelar transferência
    RESPONSAVEL: ["RESPONSAVEL"], // Status especial, mantém-se
  };

/**
 * Cores para cada status (usar com Tailwind)
 */
export const STATUS_COLORS: Record<PatientStatus, string> = {
  PROSPECT: "bg-info/10 text-info dark:bg-info/20 dark:text-info",
  TRATAMENTO:
    "bg-success/10 text-success dark:bg-success/20 dark:text-success",
  CONTENCAO:
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  ERUPCAO: "bg-info/10 text-info dark:bg-info/20 dark:text-info",
  AFASTAMENTO_TEMPORARIO:
    "bg-warning/10 text-warning dark:bg-warning/20 dark:text-warning",
  CONCLUIDO:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
  ABANDONO: "bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive",
  A_PROTESTAR:
    "bg-warning/10 text-warning dark:bg-warning/20 dark:text-warning",
  PROTESTO: "bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive/80",
  INATIVO: "bg-muted text-muted-foreground dark:bg-muted dark:text-muted-foreground",
  CANCELADO:
    "bg-muted text-muted-foreground dark:bg-muted dark:text-muted-foreground",
  MIGRADO:
    "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
  TRANSFERENCIA:
    "bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200",
  RESPONSAVEL:
    "bg-warning/10 text-warning dark:bg-warning/20 dark:text-warning",
};

/**
 * Labels amigáveis para exibição
 */
export const STATUS_LABELS: Record<PatientStatus, string> = {
  PROSPECT: "Prospect (Lead)",
  TRATAMENTO: "Em Tratamento",
  CONTENCAO: "Contenção",
  ERUPCAO: "Aguardando Erupção",
  AFASTAMENTO_TEMPORARIO: "Afastamento Temporário",
  CONCLUIDO: "Tratamento Concluído",
  ABANDONO: "Abandono",
  A_PROTESTAR: "A Protestar",
  PROTESTO: "Em Protesto",
  INATIVO: "Inativo",
  CANCELADO: "Cancelado",
  MIGRADO: "Migrado",
  TRANSFERENCIA: "Em Transferência",
  RESPONSAVEL: "Responsável Financeiro",
};

/**
 * Valida se uma transição de status é permitida
 */
export function isValidStatusTransition(
  fromStatus: PatientStatus | null,
  toStatus: PatientStatus,
): boolean {
  if (!fromStatus) return true; // Primeiro status sempre é válido

  const validTransitions = VALID_STATUS_TRANSITIONS[fromStatus];
  return validTransitions.includes(toStatus);
}

/**
 * Retorna mensagem de erro se transição for inválida
 */
export function getStatusTransitionError(
  fromStatus: PatientStatus,
  toStatus: PatientStatus,
): string | null {
  if (isValidStatusTransition(fromStatus, toStatus)) {
    return null;
  }

  return `Transição inválida: não é possível mudar de "${STATUS_LABELS[fromStatus]}" para "${STATUS_LABELS[toStatus]}"`;
}
