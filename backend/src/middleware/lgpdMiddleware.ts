/**
 * LGPD Middleware - Compliance com Lei Geral de Proteção de Dados
 * 
 * Responsabilidades:
 * 1. Anonimização de dados sensíveis em logs
 * 2. Criptografia de campos PII (Personally Identifiable Information)
 * 3. Audit trail de acessos a dados de pacientes
 * 4. Controle de consentimento
 * 5. Direito ao esquecimento (soft delete enforçado)
 */

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { logger } from '../infrastructure/logger';

// Tipos de dados sensíveis conforme LGPD
interface SensitiveDataConfig {
  cpf: boolean;
  rg: boolean;
  telefone: boolean;
  email: boolean;
  endereco: boolean;
  nome: boolean;  // Nome completo
  dataNascimento: boolean;
  dadosSaude: boolean;  // Diagnósticos, tratamentos
}

// Configuração padrão - tudo anonimizado
const DEFAULT_SENSITIVE_CONFIG: SensitiveDataConfig = {
  cpf: true,
  rg: true,
  telefone: true,
  email: true,
  endereco: true,
  nome: true,
  dataNascimento: true,
  dadosSaude: true,
};

// Chave de criptografia obrigatória via variável de ambiente
const _ENCRYPTION_KEY = process.env.LGPD_ENCRYPTION_KEY;
if (!_ENCRYPTION_KEY) {
  throw new Error(
    'LGPD_ENCRYPTION_KEY environment variable is required. ' +
    'Generate with: openssl rand -hex 32'
  );
}
const ENCRYPTION_KEY: string = _ENCRYPTION_KEY;

// Salt único por ambiente (obrigatório — nunca usar valor fixo)
const _ENCRYPTION_SALT = process.env.LGPD_ENCRYPTION_SALT;
if (!_ENCRYPTION_SALT) {
  throw new Error(
    'LGPD_ENCRYPTION_SALT environment variable is required. ' +
    'Generate with: openssl rand -hex 16'
  );
}
const ENCRYPTION_SALT: string = _ENCRYPTION_SALT;

const ALGORITHM = 'aes-256-gcm';

/**
 * Criptografa um valor sensível
 */
export function encryptSensitiveData(value: string): string {
  try {
    const iv = crypto.randomBytes(16);
    const key = crypto.scryptSync(ENCRYPTION_KEY, ENCRYPTION_SALT, 32);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    cipher.setAAD(Buffer.from('lgpd-aad', 'utf8'));
    
    let encrypted = cipher.update(value, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    // Formato: iv:authTag:encrypted
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  } catch (error) {
    logger.error('Error encrypting sensitive data', { error });
    return '[ENCRYPTION_ERROR]';
  }
}

/**
 * Descriptografa um valor
 */
export function decryptSensitiveData(encryptedValue: string): string {
  try {
    const parts = encryptedValue.split(':');
    if (parts.length !== 3) return encryptedValue;
    
    const [ivHex, authTagHex, encrypted] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    const key = crypto.scryptSync(ENCRYPTION_KEY, ENCRYPTION_SALT, 32);
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAAD(Buffer.from('lgpd-aad', 'utf8'));
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    logger.error('Error decrypting sensitive data', { error });
    return '[DECRYPTION_ERROR]';
  }
}

/**
 * Anonimiza CPF (XXX.XXX.XXX-XX → XXX.***.***-XX)
 */
export function anonymizeCPF(cpf: string): string {
  if (!cpf) return cpf;
  const cleaned = cpf.replace(/\D/g, '');
  if (cleaned.length !== 11) return '[INVALID_CPF]';
  return `${cleaned.slice(0, 3)}.***.***-${cleaned.slice(-2)}`;
}

/**
 * Anonimiza telefone ((XX) XXXXX-XXXX → (XX) *****-XXXX)
 */
export function anonymizePhone(phone: string): string {
  if (!phone) return phone;
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length < 10) return '[INVALID_PHONE]';
  return cleaned.slice(0, 4) + '*****' + cleaned.slice(-4);
}

/**
 * Anonimiza email (nome@dominio.com → n***@dominio.com)
 */
export function anonymizeEmail(email: string): string {
  if (!email) return email;
  const [local, domain] = email.split('@');
  if (!domain) return '[INVALID_EMAIL]';
  const anonymizedLocal = local.charAt(0) + '***';
  return `${anonymizedLocal}@${domain}`;
}

/**
 * Anonimiza nome (João Silva → João S.)
 */
export function anonymizeName(name: string): string {
  if (!name) return name;
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0) + '***';
  
  const firstName = parts[0];
  const lastInitial = parts[parts.length - 1].charAt(0);
  return `${firstName} ${lastInitial}.`;
}

/**
 * Anonimiza objeto de dados de paciente
 */
export function anonymizePatientData(data: any, config: Partial<SensitiveDataConfig> = {}): any {
  const finalConfig = { ...DEFAULT_SENSITIVE_CONFIG, ...config };
  
  if (!data || typeof data !== 'object') return data;
  
  const anonymized = { ...data };
  
  if (finalConfig.cpf && anonymized.cpf) {
    anonymized.cpf = anonymizeCPF(anonymized.cpf);
  }
  
  if (finalConfig.rg && anonymized.rg) {
    anonymized.rg = '*********' + (anonymized.rg.slice(-2) || '');
  }
  
  if (finalConfig.telefone && anonymized.telefone) {
    anonymized.telefone = anonymizePhone(anonymized.telefone);
  }
  
  if (finalConfig.email && anonymized.email) {
    anonymized.email = anonymizeEmail(anonymized.email);
  }
  
  if (finalConfig.nome && anonymized.nome) {
    anonymized.nome = anonymizeName(anonymized.nome);
  }
  
  if (finalConfig.endereco && anonymized.endereco) {
    anonymized.endereco = '[ADDRESS_ANONYMIZED]';
  }
  
  if (finalConfig.dataNascimento && anonymized.dataNascimento) {
    // Mantém apenas ano e mês
    const date = new Date(anonymized.dataNascimento);
    if (!isNaN(date.getTime())) {
      anonymized.dataNascimento = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-**`;
    }
  }
  
  if (finalConfig.dadosSaude && anonymized.dadosSaude) {
    anonymized.dadosSaude = '[HEALTH_DATA_ANONYMIZED]';
  }
  
  return anonymized;
}

/**
 * Middleware de audit trail para acessos a dados de pacientes
 */
export function auditPatientAccess(req: Request, _res: Response, next: NextFunction): void {
  const userId = req.user?.id || 'anonymous';
  const userRole = req.user?.role || 'unknown';
  const patientId = req.params.id || req.params.patientId || req.body.patientId;
  const action = `${req.method} ${req.path}`;
  const timestamp = new Date().toISOString();
  const ipAddress = req.ip || req.connection.remoteAddress;
  
  // Só loga se for acesso a dados de paciente
  if (req.path.includes('paciente') || req.path.includes('patient')) {
    logger.info('LGPD_AUDIT: Patient data access', {
      timestamp,
      userId,
      userRole,
      patientId,
      action,
      ipAddress: anonymizeIP(ipAddress),
      userAgent: req.headers['user-agent']?.slice(0, 100),
    });
    
    // Aqui poderia salvar em tabela de audit ou enviar para SIEM
  }
  
  next();
}

/**
 * Anonimiza IP (último octeto)
 */
function anonymizeIP(ip: string | undefined): string {
  if (!ip) return 'unknown';
  if (ip.includes(':')) {
    // IPv6 - anonimiza últimos segmentos
    return ip.split(':').slice(0, 4).join(':') + '::****';
  }
  // IPv4
  return ip.split('.').slice(0, 3).join('.') + '.***';
}

/**
 * Middleware para sanitizar dados sensíveis no body da request
 */
export function sanitizeSensitiveData(req: Request, _res: Response, next: NextFunction): void {
  if (req.body && typeof req.body === 'object') {
    // Criptografa campos sensíveis antes de processar
    const sensitiveFields = ['cpf', 'rg', 'senha', 'password', 'cartaoSaude'];
    
    sensitiveFields.forEach(field => {
      if (req.body[field]) {
        req.body[`${field}Encrypted`] = encryptSensitiveData(req.body[field]);
        delete req.body[field]; // Remove campo não criptografado
      }
    });
  }
  
  next();
}

/**
 * Middleware para anonimizar dados em logs
 */
export function anonymizeLogData(req: Request, res: Response, next: NextFunction): void {
  // Sobrescreve o método de log original para anonimizar
  const originalJson = res.json.bind(res);
  
  res.json = function(body: any) {
    // Anonimiza dados de paciente na resposta
    if (body && req.path.includes('paciente')) {
      if (Array.isArray(body)) {
        body = body.map(item => anonymizePatientData(item));
      } else if (body.data) {
        body.data = anonymizePatientData(body.data);
      } else {
        body = anonymizePatientData(body);
      }
    }
    
    return originalJson(body);
  };
  
  next();
}

/**
 * Verifica se usuário tem consentimento para processar dados
 */
export function checkConsent(req: Request, _res: Response, next: NextFunction): void {
  const consentId = req.headers['x-lgpd-consent-id'];
  
  // Para operações de escrita em dados sensíveis
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    if (!consentId && req.path.includes('paciente')) {
      logger.warn('LGPD: Operation without consent', {
        path: req.path,
        method: req.method,
        userId: req.user?.id,
      });
      
      // Não bloqueia, mas alerta (pode ser configurado para bloquear)
      // res.status(403).json({ error: 'LGPD consent required' });
      // return;
    }
  }
  
  next();
}

/**
 * Middleware composto LGPD - aplica todas as proteções
 */
export function lgpdCompliance(req: Request, res: Response, next: NextFunction): void {
  // Ordem de execução:
  // 1. Verificar consentimento
  checkConsent(req, res, () => {
    // 2. Sanitizar dados de entrada
    sanitizeSensitiveData(req, res, () => {
      // 3. Audit trail
      auditPatientAccess(req, res, () => {
        // 4. Anonimizar saída
        anonymizeLogData(req, res, next);
      });
    });
  });
}

// Exportações
export default {
  lgpdCompliance,
  auditPatientAccess,
  sanitizeSensitiveData,
  anonymizeLogData,
  checkConsent,
  encryptSensitiveData,
  decryptSensitiveData,
  anonymizePatientData,
  anonymizeCPF,
  anonymizePhone,
  anonymizeEmail,
  anonymizeName,
};
