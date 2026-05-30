export interface ICryptoConfigRepository {
  findActiveVolatilityAlerts(): Promise<
    Array<{
      id: string;
      clinic_id: string;
      coin_type: string;
      alert_type: string;
      is_active: boolean;
      [key: string]: unknown;
    }>
  >;
  updateAlertTriggeredAt(id: string, triggeredAt: string): Promise<unknown>;
  createNotification(data: {
    clinic_id: string;
    tipo: string;
    titulo: string;
    mensagem: string;
    link_acao: string;
    lida: boolean;
  }): Promise<unknown>;
}
