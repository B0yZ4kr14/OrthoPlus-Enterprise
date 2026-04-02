import { CashRegister, CashRegisterStatus } from "../entities/CashRegister";
import { Period } from "../valueObjects/Period";

export interface CashRegisterFilters {
  status?: CashRegisterStatus;
  openedBy?: string;
  period?: Period;
}

export interface ICashRegisterRepository {
  findById(id: string): Promise<CashRegister | null>;
  findByClinic(
    clinicId: string,
    filters?: CashRegisterFilters,
  ): Promise<CashRegister[]>;
  save(cashRegister: CashRegister): Promise<void>;
  update(cashRegister: CashRegister): Promise<void>;
  delete(id: string): Promise<void>;

  // Business queries
  findOpenRegister(clinicId: string): Promise<CashRegister | null>;
  getLastClosedRegister(clinicId: string): Promise<CashRegister | null>;
}
