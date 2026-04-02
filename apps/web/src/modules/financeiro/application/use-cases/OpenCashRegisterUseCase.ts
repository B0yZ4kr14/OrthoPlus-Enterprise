import {
  CashRegister,
  CashRegisterProps,
} from "../../domain/entities/CashRegister";
import { ICashRegisterRepository } from "../../domain/repositories/ICashRegisterRepository";
import { Money } from "../../domain/valueObjects/Money";

export interface OpenCashRegisterDTO {
  clinicId: string;
  openedBy: string;
  initialAmount: number;
  notes?: string;
}

export class OpenCashRegisterUseCase {
  constructor(private cashRegisterRepository: ICashRegisterRepository) {}

  async execute(dto: OpenCashRegisterDTO): Promise<CashRegister> {
    // Verifica se já existe um caixa aberto
    const openRegister = await this.cashRegisterRepository.findOpenRegister(
      dto.clinicId,
    );

    if (openRegister) {
      throw new Error(
        "Já existe um caixa aberto. Feche-o antes de abrir um novo.",
      );
    }

    const cashRegisterProps: CashRegisterProps = {
      id: crypto.randomUUID(),
      clinicId: dto.clinicId,
      openedBy: dto.openedBy,
      openedAt: new Date(),
      initialAmount: Money.fromNumber(dto.initialAmount),
      status: "ABERTO",
      notes: dto.notes,
    };

    const cashRegister = new CashRegister(cashRegisterProps);
    await this.cashRegisterRepository.save(cashRegister);

    return cashRegister;
  }
}
