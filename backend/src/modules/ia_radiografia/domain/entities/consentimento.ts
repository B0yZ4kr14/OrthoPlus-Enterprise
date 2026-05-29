export interface RegistrarConsentimentoDTO {
  pacienteId: string;
  clinicId: string;
  consentido: boolean;
  ipAddress: string;
  hashTermo: string;
}

export interface RevogarConsentimentoDTO {
  pacienteId: string;
  clinicId: string;
  motivo: string;
}
