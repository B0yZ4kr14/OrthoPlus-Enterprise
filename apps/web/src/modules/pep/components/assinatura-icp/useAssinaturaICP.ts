// cspell:disable
import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import type {
  TabValue,
  KpiData,
  DocumentoAssinado,
  SolicitacaoPendente,
  Certificado,
  Validacao,
  CertificadoTipo,
} from "./types";

export function useAssinaturaICP() {
  const { hasModuleAccess } = useAuth();
  const [activeTab, setActiveTab] = useState<TabValue>("overview");

  const hasAccess = useMemo(() => hasModuleAccess("ASSINATURA_ICP"), [hasModuleAccess]);

  const kpiData: KpiData = useMemo(() => ({
    certificadosAtivos: 5,
    certificadosExpirando: 2,
    docsAssinadosMes: 127,
    docsAssinadosVariacao: 15,
    aguardandoAssinatura: 8,
    aguardandoPrazoProximo: 3,
    taxaConformidade: 100,
  }), []);

  const documentosRecentes: DocumentoAssinado[] = useMemo(() => [
    { name: "Contrato - João Silva", type: "Contrato", date: "Hoje, 14:30", signers: 2 },
    { name: "Termo de Consentimento - Maria", type: "Termo", date: "Hoje, 11:20", signers: 1 },
    { name: "Orçamento - Carlos Souza", type: "Orçamento", date: "Ontem, 16:45", signers: 2 },
  ], []);

  const solicitacoesPendentes: SolicitacaoPendente[] = useMemo(() => [
    { name: "Contrato de Tratamento - Ana Lima", requester: "Dr. Roberto", date: "Enviado há 2 dias", expires: "28 dias" },
    { name: "Termo de Consentimento LGPD", requester: "Sistema", date: "Enviado há 5 dias", expires: "25 dias" },
  ], []);

  const certificados: Certificado[] = useMemo(() => [
    { type: "e-CPF A1", name: "João Silva", serial: "1234567890ABCDEF", issuer: "AC Serasa", validUntil: "15/08/2026", status: "active" },
    { type: "e-CPF A3", name: "João Silva", serial: "FEDCBA0987654321", issuer: "AC Certisign", validUntil: "22/12/2025", status: "active" },
    { type: "e-CNPJ A1", name: "Clínica OrthoPlus Enterprise", serial: "ABCD1234EFGH5678", issuer: "AC Soluti", validUntil: "10/01/2026", status: "expiring" },
  ], []);

  const certificadosTipos: CertificadoTipo[] = useMemo(() => [
    { tipo: "e-CPF A1", quantidade: 3, status: "Válidos", variant: "blue" },
    { tipo: "e-CPF A3", quantidade: 2, status: "Válidos", variant: "green" },
    { tipo: "e-CNPJ A1", quantidade: 1, status: "Expira em breve", variant: "purple" },
  ], []);

  const validacoes: Validacao[] = useMemo(() => [
    { doc: "Contrato_Silva_2025.pdf", result: "Válido", date: "Hoje, 15:30", details: "Todas as assinaturas verificadas" },
    { doc: "Termo_Consentimento.pdf", result: "Válido", date: "Ontem, 10:20", details: "1 assinatura verificada" },
  ], []);

  return {
    hasAccess,
    activeTab,
    setActiveTab,
    kpiData,
    documentosRecentes,
    solicitacoesPendentes,
    certificados,
    certificadosTipos,
    validacoes,
  };
}
