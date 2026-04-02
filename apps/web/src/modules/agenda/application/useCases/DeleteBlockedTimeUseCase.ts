import { IBlockedTimeRepository } from "../../domain/repositories/IBlockedTimeRepository";

interface DeleteBlockedTimeInput {
  blockedTimeId: string;
}

export class DeleteBlockedTimeUseCase {
  constructor(private blockedTimeRepository: IBlockedTimeRepository) {}

  async execute(input: DeleteBlockedTimeInput): Promise<void> {
    const blockedTime = await this.blockedTimeRepository.findById(
      input.blockedTimeId,
    );

    if (!blockedTime) {
      throw new Error("Bloqueio não encontrado");
    }

    await this.blockedTimeRepository.delete(input.blockedTimeId);
  }
}
