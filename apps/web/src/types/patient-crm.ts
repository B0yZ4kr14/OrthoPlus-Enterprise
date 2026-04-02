/**
 * FASE 1 - SPRINT 2.1: DADOS CRM ODONTOLÓGICOS COMPLETOS
 * 10 campos críticos para rastreamento de origem, campanhas e ROI
 */

import { PatientStatus } from "./patient-status";

/**
 * Canais de captação de pacientes em odontologia
 */
export type CaptureChannel =
  | "GOOGLE_ADS" // Google Ads (pesquisa e display)
  | "META_ADS" // Facebook/Instagram Ads
  | "GOOGLE_ORGANICO" // SEO orgânico do Google
  | "INDICACAO_PACIENTE" // Indicação de paciente existente
  | "INDICACAO_DENTISTA" // Indicação de outro dentista
  | "EVENTO_SAUDE" // Feira de saúde, evento comunitário
  | "TELEMARKETING" // Ligação ativa de telemarketing
  | "WHATSAPP_BUSINESS" // Contato via WhatsApp Business
  | "LANDING_PAGE" // Landing page específica
  | "CONVENIO" // Indicação de convênio odontológico
  | "CLINICA_POPULAR" // Encaminhamento de clínica popular
  | "ORTODONTIA_ESTETICA" // Campanha ortodontia estética
  | "IMPLANTES" // Campanha de implantes
  | "CLAREAMENTO" // Campanha de clareamento
  | "OUTRO"; // Outros canais

/**
 * Tipos de campanha de marketing odontológico
 */
export type CampaignType =
  | "DIGITAL_ADS" // Anúncios digitais pagos
  | "OFFLINE" // Panfletagem, outdoor, rádio
  | "EVENTO" // Evento presencial
  | "PARCERIA" // Parceria com empresas
  | "REFERRAL" // Programa de indicação
  | "ORGANIC"; // Crescimento orgânico

/**
 * Interface para campanhas de marketing odontológico
 */
export interface DentalCampaign {
  id: string;
  clinic_id: string;
  nome: string; // "Black Friday Implantes 2025"
  tipo: CampaignType;
  canal_principal: CaptureChannel;
  data_inicio: string;
  data_fim: string | null;
  investimento_total: number; // Valor investido em R$
  leads_gerados: number; // Total de leads captados
  leads_qualificados: number; // Leads que viraram prospects
  pacientes_convertidos: number; // Pacientes que iniciaram tratamento
  receita_gerada: number; // Receita total dos pacientes convertidos
  roi: number; // ROI calculado (receita/investimento)
  custo_por_lead: number; // investimento/leads_gerados
  custo_por_paciente: number; // investimento/pacientes_convertidos
  taxa_conversao_lead_paciente: number; // (pacientes/leads) * 100
  status: "PLANEJADA" | "ATIVA" | "PAUSADA" | "FINALIZADA" | "CANCELADA";
  meta_leads: number | null;
  meta_pacientes: number | null;
  meta_receita: number | null;
  created_at: string;
  updated_at: string;
}

/**
 * Dados comerciais e de CRM do paciente
 */
export interface PatientCRMData {
  // 🎯 CAMPO 1: Campanha de Origem
  campanha_origem_id: string | null;
  campanha_origem_nome: string | null; // Desnormalizado para performance

  // 🎯 CAMPO 2: Canal de Captação
  canal_captacao: CaptureChannel;

  // 🎯 CAMPO 3: Origem do Lead
  origem_lead: string | null; // Ex: "Landing Page Implantes 2025"

  // 🎯 CAMPO 4: Evento de Captação
  evento_captacao: string | null; // Ex: "Feira Odontológica São Paulo 2025"

  // 🎯 CAMPO 5: Promotor/Vendedor
  promotor_id: string | null; // FK para profiles (dentista/vendedor)
  promotor_nome: string | null; // Desnormalizado

  // 🎯 CAMPO 6: Indicação
  indicado_por: string | null; // Nome de quem indicou
  indicado_por_paciente_id: string | null; // FK para patients (se for paciente)
  indicado_por_dentista_id: string | null; // FK para profiles (se for dentista)

  // 🎯 CAMPO 7: Dados Profissionais/Empresa (B2B)
  empresa: string | null; // Empresa onde trabalha
  cnpj_empresa: string | null; // CNPJ da empresa (convênio empresarial)
  cargo: string | null; // Cargo na empresa

  // 🎯 CAMPO 8: Lifecycle CRM
  data_primeiro_contato: string; // Quando o lead entrou no sistema
  data_qualificacao: string | null; // Quando virou prospect qualificado
  data_conversao: string | null; // Quando virou paciente (primeira consulta)

  // 🎯 CAMPO 9: Valor Lifetime
  valor_lifetime: number; // Soma de todos os tratamentos pagos
  valor_ticket_medio: number; // Média de valor por tratamento

  // 🎯 CAMPO 10: Risk Score e Churn
  churn_risk_score: number; // 0-100 (IA prevê abandono)
  propensao_indicacao: number; // 0-100 (probabilidade de indicar outros)
}

/**
 * Patient completo com CRM e Status
 */
export interface PatientComplete {
  // Dados básicos (mantidos do patient.ts original)
  id: string;
  clinic_id: string;
  patient_code: string | null;
  full_name: string;
  cpf: string | null;
  birth_date: string;
  phone_primary: string;
  email: string | null;

  // ✅ STATUS CANÔNICO ODONTOLÓGICO
  status: PatientStatus;
  status_history: unknown[]; // PatientStatusChange[] quando implementarmos histórico

  // ✅ DADOS CRM COMPLETOS (10 CAMPOS)
  crm: PatientCRMData;

  // Dados médicos (mantidos)
  has_systemic_disease: boolean | null;
  systemic_diseases: string[] | null;
  has_allergies: boolean | null;
  allergies_list: string[] | null;
  current_medications: string[] | null;

  // Dados financeiros
  total_debt: number | null;
  total_paid: number | null;
  payment_status: string | null;

  // Dados LGPD
  lgpd_consent: boolean | null;
  lgpd_consent_date: string | null;

  // Timestamps
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

/**
 * Helper para calcular ROI de uma campanha
 */
export function calculateCampaignROI(campaign: DentalCampaign): number {
  if (campaign.investimento_total === 0) return 0;
  return (
    ((campaign.receita_gerada - campaign.investimento_total) /
      campaign.investimento_total) *
    100
  );
}

/**
 * Helper para calcular custo por lead
 */
export function calculateCostPerLead(campaign: DentalCampaign): number {
  if (campaign.leads_gerados === 0) return 0;
  return campaign.investimento_total / campaign.leads_gerados;
}

/**
 * Helper para calcular custo por paciente
 */
export function calculateCostPerPatient(campaign: DentalCampaign): number {
  if (campaign.pacientes_convertidos === 0) return 0;
  return campaign.investimento_total / campaign.pacientes_convertidos;
}

/**
 * Helper para calcular taxa de conversão
 */
export function calculateConversionRate(campaign: DentalCampaign): number {
  if (campaign.leads_gerados === 0) return 0;
  return (campaign.pacientes_convertidos / campaign.leads_gerados) * 100;
}
