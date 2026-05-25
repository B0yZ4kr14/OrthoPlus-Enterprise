import { NotificationRepository } from "@/modules/notifications/infrastructure/NotificationRepository";
import { NextFunction, Request, Response } from "express";
import nodemailer from "nodemailer";
import { logger } from "@/infrastructure/logger";


/**
 * Creates a Nodemailer transporter from environment variables.
 * Configure SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in your .env.
 * Falls back to a no-op transport when SMTP is not configured.
 */
function createMailTransport() {
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

export class NotificationController {
  private repo = new NotificationRepository()
  /**
   * Auto Notifications (Cron-like endpoint)
   * Handles: upcoming appointments, overdue payments, low stock, birthdays
   */
  async runAutoNotifications(_req: Request, res: Response, next: NextFunction) {
    try {
      
      let notificationsCreated = 0;

      // 1. Appointments tomorrow
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
          tipo: 'CONSULTA',
          titulo: 'Consulta Amanhã',
          mensagem: `Consulta agendada com ${app.patient?.full_name || 'paciente'}`,
          link_acao: '/agenda',
          lida: false,
        });
        notificationsCreated++;
      }

      // 2. Overdue payments
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const overduePayments = await this.repo.findOverduePayments(today);
      for (const payment of overduePayments) {
        await this.repo.createNotification({
          clinic_id: payment.clinic_id,
          tipo: 'PAGAMENTO',
          titulo: 'Pagamento Vencido',
          mensagem: `Pagamento vencido - Paciente: ${payment.patient_name || 'N/A'}`,
          link_acao: '/financeiro/contas-receber',
          lida: false,
        });
        notificationsCreated++;
      }

      // 3. Low stock
      const lowStockProducts = await this.repo.findLowStockProducts();
      for (const product of lowStockProducts) {
        await this.repo.createNotification({
          clinic_id: product.clinic_id,
          tipo: 'ALERTA',
          titulo: 'Estoque Baixo',
          mensagem: `Produto "${product.nome}" com estoque baixo (${product.quantidade_atual} un)`,
          link_acao: '/estoque',
          lida: false,
        });
        notificationsCreated++;
      }

      // 4. Birthdays
      const todayMonth = today.getMonth() + 1;
      const todayDay = today.getDate();

      const birthdayPatients = await this.repo.findBirthdayPatients(todayMonth, todayDay);
      for (const patient of birthdayPatients) {
        await this.repo.createNotification({
          clinic_id: patient.clinic_id,
          tipo: 'LEMBRETE',
          titulo: '🎂 Aniversariante do Dia',
          mensagem: `Hoje é aniversário de ${patient.patient_name || 'um paciente'}!`,
          link_acao: '/pacientes',
          lida: false,
        });
        notificationsCreated++;
      }

      res.json({
        success: true,
        notificationsCreated,
        message: `Created ${notificationsCreated} automatic notifications`,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a single notification
   */
  async createNotification(req: Request, res: Response, next: NextFunction) {
    try {
      const { clinic_id, user_id, tipo, titulo, mensagem, link_acao } =
        req.body;

      if (!clinic_id || !tipo || !titulo || !mensagem) {
        res.status(400).json({ error: "Missing required fields" });
        return;
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

      res.json({ success: true, notification: notif });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Check volatility alerts
   */
  async checkVolatilityAlerts(
    _req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const alerts = await this.repo.findActiveVolatilityAlerts();

      if (!alerts || alerts.length === 0) {
        res.json({ message: "No active alerts" });
        return;
      }

      const coinIds: Record<string, string> = {
        BTC: "bitcoin",
        ETH: "ethereum",
        USDT: "tether",
        BNB: "binancecoin",
        USDC: "usd-coin",
      };

      const triggeredAlerts = [];

      for (const alert of alerts) {
        const coinId = coinIds[alert.coin_type];
        if (!coinId) continue;

        const timeframeMinutes = alert.volatility_timeframe_minutes || 60;
        const thresholdPercentage = alert.volatility_threshold_percentage || 5;
        const direction = alert.volatility_direction || "both";

        const toTimestamp = Math.floor(Date.now() / 1000);
        const fromTimestamp = toTimestamp - timeframeMinutes * 60;

        try {
          const response = await fetch(
            `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart/range?vs_currency=brl&from=${fromTimestamp}&to=${toTimestamp}`,
          );
          if (!response.ok) continue;

          const data = (await response.json()) as any; // eslint-disable-line @typescript-eslint/no-explicit-any
          const prices = data.prices as [number, number][];

          if (!prices || prices.length < 2) continue;

          const firstPrice = prices[0][1];
          const lastPrice = prices[prices.length - 1][1];
          const changePercentage =
            ((lastPrice - firstPrice) / firstPrice) * 100;

          let shouldTrigger = false;
          if (direction === "up" && changePercentage >= thresholdPercentage)
            shouldTrigger = true;
          else if (
            direction === "down" &&
            changePercentage <= -thresholdPercentage
          )
            shouldTrigger = true;
          else if (
            direction === "both" &&
            Math.abs(changePercentage) >= thresholdPercentage
          )
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

      res.json({
        success: true,
        triggeredAlerts,
        message: `Checked ${alerts.length} alerts, triggered ${triggeredAlerts.length}`,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Check crypto price alerts
   */
  async checkCryptoPriceAlerts(
    _req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const alerts = await this.repo.findActiveCryptoPriceAlertsWithEmail();

      if (!alerts || alerts.length === 0) {
        res.json({ message: "No active alerts to process" });
        return;
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
        if (
          alert.alert_type === "ABOVE" &&
          currentRate >= targetRate
        )
          shouldTrigger = true;
        else if (
          alert.alert_type === "BELOW" &&
          currentRate <= targetRate
        )
          shouldTrigger = true;

        if (!shouldTrigger) continue;

        if (alert.last_triggered_at) {
          const hours =
            (Date.now() - new Date(alert.last_triggered_at).getTime()) /
            (1000 * 60 * 60);
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
              from: process.env.SMTP_FROM || "OrthoPlus Enterprise <noreply@orthoplus.local>",
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

      res.json({ success: true, alertsTriggered, alertsSent });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Send Replenishment Alerts (AI generated)
   */
  async sendReplenishmentAlerts(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { previsoes, resumo } = req.body;

      if (!previsoes || previsoes.length === 0) {
        res.status(400).json({ error: "Nenhuma previsão fornecida" });
        return;
      }

      const clinic_id = req.user?.clinicId;
      const user_id = req.user?.id || null;

      const admins = await this.repo.findAdminsByClinic(clinic_id);

      const adminEmails = admins.map((a) => a.email).filter(Boolean);

      if (adminEmails.length > 0) {
        const produtosCriticos = previsoes.filter(
          (p: any) => p.status === "CRITICO", // eslint-disable-line @typescript-eslint/no-explicit-any
        );
        const produtosAlerta = previsoes.filter(
          (p: any) => p.status === "ALERTA", // eslint-disable-line @typescript-eslint/no-explicit-any
        );

        try {
          await mailer.sendMail({
            from: process.env.SMTP_FROM || "OrthoPlus Enterprise <noreply@orthoplus.local>",
            to: adminEmails,
            subject: `🤖 Alerta de Reposição IA: ${produtosCriticos.length} Críticos, ${produtosAlerta.length} Alertas`,
            html: `<p>Verifique o estoque no sistema. Detalhes: ${JSON.stringify(resumo)}</p>`,
          });
        } catch (e) {
          logger.error("Email failed", e);
        }

        await this.repo.createAuditLog({
          clinic_id,
          user_id,
          action: "ALERTAS_REPOSICAO_ENVIADOS",
          details: { total_produtos: previsoes.length },
        });
      }

      res.json({
        success: true,
        message: `Alertas enviados para ${adminEmails.length} gestores`,
        destinatorios: adminEmails.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Send Stock Alerts
   */
  async sendStockAlerts(_req: Request, res: Response, next: NextFunction) {
    try {
      const produtos = await this.repo.findLowStockInventoryProducts();

      if (!produtos || produtos.length === 0) {
        res.json({ message: "Nenhum alerta de estoque encontrado" });
        return;
      }

      const alertasEnviados = [];

      for (const p of produtos) {
        const tipoAlerta =
          p.quantidade_atual === 0 ? "ESTOQUE_CRITICO" : "ESTOQUE_MINIMO";
        const msg =
          p.quantidade_atual === 0
            ? `CRÍTICO: ${p.nome} sem estoque!`
            : `Estoque mínimo: ${p.nome}`;

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

        alertasEnviados.push({
          produto: p.nome,
          clinic_id: p.clinic_id,
          tipo: tipoAlerta,
        });
      }

      res.json({
        success: true,
        alertas_enviados: alertasEnviados.length,
        detalhes: alertasEnviados,
      });
    } catch (error) {
      next(error);
    }
  }
}
