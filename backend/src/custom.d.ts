import { Request } from "express";

export interface AuthenticatedRequest extends Request {
  user?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  clinicId?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
      clinicId?: string;
    }
  }
}
