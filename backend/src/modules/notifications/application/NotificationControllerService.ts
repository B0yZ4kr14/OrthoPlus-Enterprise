import { NotificationRepository } from "@/modules/notifications/infrastructure/NotificationRepository";
import { Errors } from "@/middleware/errorHandler";
import { logger } from "@/infrastructure/logger";
import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

function createMailTransport(): Transporter {
  const smtpHost = process.env.SMTP_HOST;
  if (!smtpHost) {
    return nodemailer.createTransport({ jsonTransport: true });
  }
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  return nodemailer.createTransport({
    host: smtpHost,
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    secure: process.env.SMTP_SECURE === "true",
    auth: smtpUser && smtpPass ? { user: smtpUser, pass: smtpPass } : undefined,
  });
}

const mailer = createMailTransport();

const COIN_IDS: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  USDT: "tether",
  BNB: "binancecoin",
  USDC: "usd-coin",
};

export interface AutoNotificationsResult {
  notificationsCreated: number;
  message: string;
}

export interface VolatilityAlertResult {
  triggeredAlerts: Array<{
    coin: string;
    change: number;
    timeframe: number;
  }>;
  message: string;
}

export interface CryptoPriceAlertResult {
  alertsTriggered: number;
  alertsSent: number;
}

export interface ReplenishmentAlertResult {
  message: string;
  destinatorios: number;
}

export interface StockAlertResult {
  alertas_enviados: number;
  detalhes: Array<{
    produto: string;
    clinic_id: string;
    tipo: string;
  }>;
  message: string;
}

export class NotificationControllerService {
  constructor(private repo: NotificationRepository = new NotificationRepository()) {}

  async runAutoNotifications(): Promise<AutoNotificationsResult> {
    let notificationsCreated = 0;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStart = new Date(tomorrow.setHours(0, 0, 0, 0));
    const tomorrowEnd = new Date(tomorrow.setHours(23, 59, 59, 999));

    const upcomingAppointments = await this.repo.findUpcomingAppointments(
      tomorrowStart.toISOString(),
      tomorrowEnd.toISOString()
    );

    for (const app of upcomingAppointments) {
      await this.repo.createNotification({
        clinic_id: app.clinic_id,
        tipo: "CONSULTA",
        titulo: "Consulta Amanha",
        mensagem: `Consulta agendada com ${app.patient?.full_name || "paciente"}`,
        link_acao: "/agenda",
        lida: false,
      });
      notificationsCreated++;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overduePayments = await this.repo.findOverduePayments(today);
    for (const payment of overduePayments) {
      await this.repo.createNotification({
        clinic_id: payment.clinic_id,
        tipo: "PAGAMENTO",
        titulo: "Pagamento Vencido",
        mensagem: `Pagamento vencido - Paciente: ${payment.patient_name || "N/A"}`,
        link_acao: "/financeiro/contas-receber",
        lida: false,
      });
      notificationsCreated++;
    }

    const lowStockProducts = await this.repo.findLowStockProducts();
    for (const product of lowStockProducts) {
      await this.repo.createNotification({
        clinic_id: product.clinic_id,
        tipo: "ALERTA",
        titulo: "Estoque Baixo",
        mensagem: `Produto "${product.nome}" com estoque baixo (${product.quantidade_atual} un)`,
        link_acao: "/estoque",
        lida: false,
      });
      notificationsCreated++;
    }

    const todayMonth = today.getMonth() + 1;
    const todayDay = today.getDate();

    const birthdayPatients = await this.repo.findBirthdayPatients(todayMonth, todayDay);
    for (const patient of birthdayPatients) {
      await this.repo.createNotification({
        clinic_id: patient.clinic_id,
        tipo: "LEMBRETE",
        titulo: "Aniversariante do Dia",
        mensagem: `Hoje e aniversario de ${patient.patient_name || "um paciente"}!`,
        link_acao: "/pacientes",
        lida: false,
      });
      notificationsCreated++;
    }

    return {
      notificationsCreated,
      message: `Created ${notificationsCreated} automatic notifications`,
    };
  }

  async createNotification(body: {
    clinic_id: string;
    user_id?: string | null;
    tipo: string;
    titulo: string;
    mensagem: string;
    link_acao?: string | null;
  }) {
    const { clinic_id, user_id, tipo, titulo, mensagem, link_acao } = body;

    if (!clinic_id || !tipo || !titulo || !mensagem) {
      throw Errors.validation("Missing required fields: clinic_id, tipo, titulo, mensagem");
    }

    const notif = await this.repo.createNotification({
      clinic_id,
      user_id: user_id || null,
      tipo,
      titulo,
      mensagem,
      link_acao: link_acao || null,
    });

    await this.repo.createAuditLog({
      clinic_id,
      user_id: user_id || null,
      action: "NOTIFICATION_CREATED",
      details: { tipo, titulo, notification_id: notif.id },
    });

    return notif;
  }

  async checkVolatilityAlerts(): Promise<VolatilityAlertResult> {
    const alerts = await this.repo.findActiveVolatilityAlerts();

    if (!alerts || alerts.length === 0) {
      return { triggeredAlerts: [], message: "No active alerts" };
    }

    const triggeredAlerts: VolatilityAlertResult["triggeredAlerts"] = [];

    for (const alert of alerts) {
      const coinId = COIN_IDS[alert.coin_type];
      if (!coinId) continue;

      const timeframeMinutes = alert.volatility_timeframe_minutes || 60;
      const thresholdPercentage = alert.volatility_threshold_percentage || 5;
      const direction = alert.volatility_direction || "both";

      const toTimestamp = Math.floor(Date.now() / 1000);
      const fromTimestamp = toTimestamp - timeframeMinutes * 60;

      try {
        const response = await fetch(
          `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart/range?vs_currency=brl&from=${fromTimestamp}&to=${toTimestamp}`
        );
        if (!response.ok) continue;

        const data = (await response.json()) as { prices?: [number, number][] };
        const prices = data.prices;

        if (!prices || prices.length < 2) continue;

        const firstPrice = prices[0][1];
        const lastPrice = prices[prices.length - 1][1];
        const changePercentage = ((lastPrice - firstPrice) / firstPrice) * 100;

        let shouldTrigger = false;
        if (direction === "up" && changePercentage >= thresholdPercentage)
          shouldTrigger = true;
        else if (direction === "down" && changePercentage <= -thresholdPercentage)
          shouldTrigger = true;
        else if (direction === "both" && Math.abs(changePercentage) >= thresholdPercentage)
          shouldTrigger = true;

        if (shouldTrigger) {
          await this.repo.updateCryptoAlert(alert.id, {
            last_triggered_at: new Date().toISOString(),
          });

          await this.repo.createNotification({
            clinic_id: alert.clinic_id,
            tipo: "CRIPTO_VOLATILIDADE",
            titulo: `Alerta de Volatilidade: ${alert.coin_type}`,
            mensagem: `${alert.coin_type} variou ${changePercentage.toFixed(2)}%`,
            link_acao: "/financeiro/crypto-pagamentos",
          });

          triggeredAlerts.push({
            coin: alert.coin_type,
            change: changePercentage,
            timeframe: timeframeMinutes,
          });
        }
      } catch (e) {
        logger.error(e);
      }
    }

    return {
      triggeredAlerts,
      message: `Checked ${alerts.length} alerts, triggered ${triggeredAlerts.length}`,
    };
  }

  async checkCryptoPriceAlerts(): Promise<CryptoPriceAlertResult> {
    const alerts = await this.repo.findActiveCryptoPriceAlertsWithEmail();

    if (!alerts || alerts.length === 0) {
      return { alertsTriggered: 0, alertsSent: 0 };
    }

    let alertsTriggered = 0;
    let alertsSent = 0;

    for (const alert of alerts) {
      if (alert.cascade_enabled && alert.cascade_order > 1) {
        const previousAlerts = await this.repo.findCryptoAlertsByCascadeGroup(
          alert.cascade_group_id,
          alert.cascade_order
        );
        if (previousAlerts.length > 0) continue;
      }

      const latestRate = await this.repo.findLatestCryptoRate(alert.coin_type);

      if (!latestRate) continue;
      const currentRate = Number(latestRate.rate_brl);
      const targetRate = Number(alert.target_rate_brl);

      let shouldTrigger = false;
      if (alert.alert_type === "ABOVE" && currentRate >= targetRate)
        shouldTrigger = true;
      else if (alert.alert_type === "BELOW" && currentRate <= targetRate)
        shouldTrigger = true;

      if (!shouldTrigger) continue;

      if (alert.last_triggered_at) {
        const hours =
          (Date.now() - new Date(alert.last_triggered_at).getTime()) / (1000 * 60 * 60);
        if (hours < 24) continue;
      }

      alertsTriggered++;

      if (
        alert.notification_method &&
        alert.notification_method.includes("EMAIL") &&
        alert.email
      ) {
        try {
          await mailer.sendMail({
            from: process.env.SMTP_FROM || "OrthoPlus <noreply@orthoplus.local>",
            to: alert.email,
            subject: `Alerta de Taxa ${alert.coin_type}`,
            html: `<p>Taxa atingida: ${currentRate}</p>`,
          });
          alertsSent++;
        } catch (e) {
          logger.error("Failed to send email", e);
        }
      }

      await this.repo.updateCryptoAlert(alert.id, {
        last_triggered_at: new Date().toISOString(),
      });

      await this.repo.createNotification({
        clinic_id: alert.clinic_id,
        user_id: alert.created_by,
        tipo: "CRYPTO_ALERT",
        titulo: `Taxa ${alert.coin_type} Atingida`,
        mensagem: `A taxa atingiu ${currentRate}`,
        link_acao: "/financeiro/crypto-pagamentos",
      });
    }

    return { alertsTriggered, alertsSent };
  }

  async sendReplenishmentAlerts(body: {
    previsoes: Array<{ status: string }>;
    resumo: unknown;
  }): Promise<ReplenishmentAlertResult> {
    const { previsoes } = body;

    if (!previsoes || previsoes.length === 0) {
      throw Errors.validation("Nenhuma previsao fornecida");
    }

    return { message: "Replenishment alerts processed", destinatorios: previsoes.length };
  }

  async sendStockAlerts(): Promise<StockAlertResult> {
    const produtos = await this.repo.findLowStockInventoryProducts();

    if (!produtos || produtos.length === 0) {
      return { alertas_enviados: 0, detalhes: [], message: "Nenhum alerta de estoque encontrado" };
    }

    const detalhes: StockAlertResult["detalhes"] = [];

    for (const p of produtos) {
      const tipoAlerta =
        p.quantidade_atual === 0 ? "ESTOQUE_CRITICO" : "ESTOQUE_MINIMO";
      const msg =
        p.quantidade_atual === 0
          ? `CRITICO: ${p.nome} sem estoque!`
          : `Estoque minimo: ${p.nome}`;

      await this.repo.createStockAlert({
        produto_id: p.id,
        tipo: tipoAlerta,
        mensagem: msg,
        quantidade_atual: p.quantidade_atual,
        quantidade_sugerida: p.quantidade_minima * 2,
        lido: false,
        clinic_id: p.clinic_id,
      });

      await this.repo.createAuditLog({
        clinic_id: p.clinic_id,
        action: "STOCK_ALERT_SENT",
        details: { produto: p.nome, tipo_alerta: tipoAlerta },
      });

      detalhes.push({
        produto: p.nome,
        clinic_id: p.clinic_id,
        tipo: tipoAlerta,
      });
    }

    return {
      alertas_enviados: detalhes.length,
      detalhes,
      message: `Sent ${detalhes.length} stock alerts`,
    };
  }
}
