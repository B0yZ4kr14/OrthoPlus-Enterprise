declare global {
  namespace Express {
    interface Request {
      clinicId?: string;
      user?: {
        id: string;
        clinicId: string;
        role: string;
      };
    }
  }
}
export {};
