import { Request, Response, NextFunction } from "express"

// Rate limiting em memoria (substituir por Redis em producao)
const counters = new Map<string, { count: number; resetAt: number }>()

function getKey(prefix: string, id: string): string {
  return `${prefix}:${id}`
}

function isLimited(key: string, max: number, windowMs: number): boolean {
  const now = Date.now()
  const entry = counters.get(key)

  if (!entry || now > entry.resetAt) {
    counters.set(key, { count: 1, resetAt: now + windowMs })
    return false
  }

  if (entry.count >= max) {
    return true
  }

  entry.count++
  return false
}

export function iaRateLimiter(req: Request, res: Response, next: NextFunction): void {
  const dentistId = req.user?.id as string
  const clinicId = req.clinicId as string

  // Por dentista: 10 uploads/analises por hora
  if (isLimited(getKey("ia:dentist", dentistId), 10, 60 * 60 * 1000)) {
    res.status(429).json({ error: "Rate limit excedido (dentista)", retryAfter: 3600 })
    return
  }

  // Por clinica: 100 analises por dia
  if (isLimited(getKey("ia:clinic", clinicId), 100, 24 * 60 * 60 * 1000)) {
    res.status(429).json({ error: "Rate limit excedido (clinica)", retryAfter: 86400 })
    return
  }

  next()
}
