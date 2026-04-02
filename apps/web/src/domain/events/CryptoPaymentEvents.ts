/**
 * FASE 2 - SPRINT 2: Domain Events para Crypto Payments
 *
 * Eventos de domínio para integração com Event Bus e processamento assíncrono.
 */

export interface BaseDomainEvent {
  aggregateId: string;
  eventType: string;
  occurredAt: Date;
  payload: Record<string, unknown>;
}

/**
 * Disparado quando um pagamento crypto é confirmado na blockchain
 */
export class CryptoPaymentConfirmedEvent implements BaseDomainEvent {
  aggregateId: string;
  eventType: string = "CRYPTO_PAYMENT_CONFIRMED";
  occurredAt: Date;
  payload: {
    invoiceId?: string;
    transactionId: string;
    clinicId: string;
    amount: number;
    cryptocurrency: string;
    txHash: string;
    confirmations: number;
    contaReceberId?: string;
    orderId?: string;
    address: string;
  };

  constructor(
    transactionId: string,
    payload: {
      invoiceId?: string;
      clinicId: string;
      amount: number;
      cryptocurrency: string;
      txHash: string;
      confirmations: number;
      contaReceberId?: string;
      orderId?: string;
      address: string;
    },
  ) {
    this.aggregateId = transactionId;
    this.occurredAt = new Date();
    this.payload = {
      transactionId,
      ...payload,
    };
  }
}

/**
 * Disparado quando um pagamento crypto é recebido (mas ainda não confirmado)
 */
export class CryptoPaymentReceivedEvent implements BaseDomainEvent {
  aggregateId: string;
  eventType: string = "CRYPTO_PAYMENT_RECEIVED";
  occurredAt: Date;
  payload: {
    transactionId: string;
    clinicId: string;
    address: string;
    amount: number;
    cryptocurrency: string;
    txHash: string;
  };

  constructor(
    transactionId: string,
    payload: {
      clinicId: string;
      address: string;
      amount: number;
      cryptocurrency: string;
      txHash: string;
    },
  ) {
    this.aggregateId = transactionId;
    this.occurredAt = new Date();
    this.payload = {
      transactionId,
      ...payload,
    };
  }
}

/**
 * Disparado quando um pagamento crypto expira (timeout)
 */
export class CryptoPaymentExpiredEvent implements BaseDomainEvent {
  aggregateId: string;
  eventType: string = "CRYPTO_PAYMENT_EXPIRED";
  occurredAt: Date;
  payload: {
    transactionId: string;
    clinicId: string;
    address: string;
    amount: number;
    cryptocurrency: string;
  };

  constructor(
    transactionId: string,
    payload: {
      clinicId: string;
      address: string;
      amount: number;
      cryptocurrency: string;
    },
  ) {
    this.aggregateId = transactionId;
    this.occurredAt = new Date();
    this.payload = {
      transactionId,
      ...payload,
    };
  }
}

/**
 * Disparado quando ocorre um erro no processamento de pagamento crypto
 */
export class CryptoPaymentFailedEvent implements BaseDomainEvent {
  aggregateId: string;
  eventType: string = "CRYPTO_PAYMENT_FAILED";
  occurredAt: Date;
  payload: {
    transactionId: string;
    clinicId: string;
    error: string;
    details?: Record<string, unknown>;
  };

  constructor(
    transactionId: string,
    payload: {
      clinicId: string;
      error: string;
      details?: Record<string, unknown>;
    },
  ) {
    this.aggregateId = transactionId;
    this.occurredAt = new Date();
    this.payload = {
      transactionId,
      ...payload,
    };
  }
}
