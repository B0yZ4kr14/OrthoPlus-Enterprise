import { ICashRegisterRepository } from "../../domain/repositories/ICashRegisterRepository";
import { Money } from "../../domain/valueObjects/Money";

export interface CloseCashRegisterDTO {
  cashRegisterId: string;
  closedBy: string;
  finalAmount: number;
  expectedAmount: number;
  notes?: string;
}

export class CloseCashRegisterUseCase {
  constructor(private cashRegisterRepository: ICashRegisterRepository) {}

  async execute(dto: CloseCashRegisterDTO): Promise<void> {
    const cashRegister = await this.cashRegisterRepository.findById(
      dto.cashRegisterId,
    );

    if (!cashRegister) {
      throw new Error("Caixa não encontrado");
    }

    const finalAmount = Money.fromNumber(dto.finalAmount);
    const expectedAmount = Money.fromNumber(dto.expectedAmount);

    cashRegister.close(dto.closedBy, finalAmount, expectedAmount, dto.notes);
    await this.cashRegisterRepository.update(cashRegister);
  }
}
