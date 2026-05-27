import type { TransactionDTO } from "@orthoplus/shared-types"
import { Transaction } from "../../domain/entities/Transaction"

/**
 * Maps Transaction domain entity to TransactionDTO.
 * Architecture Refactor T5.2 — Entity-to-DTO mapper.
 */
export class TransactionMapper {
  static toDTO(entity: Transaction): TransactionDTO {
    return {
      id: entity.id,
      clinicId: entity.clinicId,
      type: entity.type,
      description: entity.description,
      amount: entity.amount,
      status: entity.status,
      paymentMethod: (entity.paymentMethod as TransactionDTO["paymentMethod"]) ?? undefined,
      category: entity.category,
      dueDate: entity.dueDate.toISOString(),
      paidAt: entity.paidAt?.toISOString(),
      patientId: entity.patientId ?? undefined,
      appointmentId: entity.appointmentId ?? undefined,
      notes: undefined, // not stored in entity yet
      createdBy: undefined, // not stored in entity yet
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    }
  }

  static toDTOList(entities: Transaction[]): TransactionDTO[] {
    return entities.map((e) => this.toDTO(e))
  }
}
