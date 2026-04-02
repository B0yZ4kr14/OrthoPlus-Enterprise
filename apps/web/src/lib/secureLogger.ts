/**
 * Secure Logger - Sanitiza dados sensíveis antes de logar
 * CORREÇÃO BAIXA L2: Sanitizar Logs de Aplicação
 */

const SENSITIVE_KEYS = [
  "password",
  "senha",
  "token",
  "api_key",
  "apikey",
  "secret",
  "credit_card",
  "cartao",
  "cpf",
  "cnpj",
  "ssn",
  "cvv",
  "pin",
  "access_token",
  "refresh_token",
  "authorization",
  "auth",
  "bearer",
  "key",
  "private",
  "encrypted_password",
];

/**
 * Sanitiza dados sensíveis de objetos
 */
export function sanitizeLogData(data: unknown): unknown {
  if (data === null || data === undefined) {
    return data;
  }

  // Primitivos são seguros
  if (typeof data !== "object") {
    return data;
  }

  // Arrays
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeLogData(item));
  }

  // Objetos
  const sanitized: unknown = {};

  for (const key of Object.keys(data)) {
    const lowerKey = key.toLowerCase();

    // Verificar se a chave contém palavra sensível
    const isSensitive = SENSITIVE_KEYS.some((sensitive) =>
      lowerKey.includes(sensitive),
    );

    if (isSensitive) {
      sanitized[key] = "***REDACTED***";
    } else if (typeof data[key] === "object") {
      // Recursivamente sanitizar objetos aninhados
      sanitized[key] = sanitizeLogData(data[key]);
    } else {
      sanitized[key] = data[key];
    }
  }

  return sanitized;
}

/**
 * Logger seguro para console
 */
export const secureLogger = {
  log: (...args: unknown[]) => {
    const sanitized = args.map((arg) => sanitizeLogData(arg));
    console.log("[SECURE]", ...sanitized);
  },

  info: (...args: unknown[]) => {
    const sanitized = args.map((arg) => sanitizeLogData(arg));
    console.info("[SECURE]", ...sanitized);
  },

  warn: (...args: unknown[]) => {
    const sanitized = args.map((arg) => sanitizeLogData(arg));
    console.warn("[SECURE]", ...sanitized);
  },

  error: (...args: unknown[]) => {
    const sanitized = args.map((arg) => sanitizeLogData(arg));
    console.error("[SECURE]", ...sanitized);
  },

  debug: (...args: unknown[]) => {
    if (process.env.NODE_ENV === "development") {
      const sanitized = args.map((arg) => sanitizeLogData(arg));
      console.debug("[SECURE]", ...sanitized);
    }
  },
};

/**
 * Hook para usar o logger seguro
 */
export function useSecureLogger() {
  return secureLogger;
}
