import { ITransactionRepository } from "../../domain/repositories/ITransactionRepository";

export interface PayTransactionDTO {
  transactionId: string;
  paidDate: Date;
  paymentMethod?: string;
}

export class PayTransactionUseCase {
  constructor(private transactionRepository: ITransactionRepository) {}

  async execute(dto: PayTransactionDTO): Promise<void> {
    const transaction = await this.transactionRepository.findById(
      dto.transactionId,
    );

    if (!transaction) {
      throw new Error("Transação não encontrada");
    }

    transaction.markAsPaid(dto.paidDate, dto.paymentMethod);
    await this.transactionRepository.update(transaction);
  }
}
