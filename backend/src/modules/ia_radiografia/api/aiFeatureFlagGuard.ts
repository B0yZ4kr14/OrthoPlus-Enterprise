import { Request, Response, NextFunction } from "express"

export function aiFeatureFlagGuard(_req: Request, res: Response, next: NextFunction) {
  const enabled = process.env.ENABLE_AI_RADIOGRAPHY === "true"

  if (!enabled) {
    res.status(403).json({
      error: "Funcionalidade de IA para radiografias desativada",
      code: "FEATURE_DISABLED",
    })
    return
  }

  next()
}
