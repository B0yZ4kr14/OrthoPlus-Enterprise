import { IEventHandler } from "@/core/domain/events/EventBus";
import { DomainEvent } from "@/core/domain/events/DomainEvent";
import { toast } from "sonner";

/**
 * Generic handler for showing notifications based on domain events
 */
export class NotificationHandler implements IEventHandler<DomainEvent> {
  private messageMap: Record<string, (event: unknown) => string> = {
    // @ts-expect-error — TS18046
    TransactionCreated: (e) => `Transação criada: R$ ${e.data.amount}`,
    // @ts-expect-error — TS18046
    TransactionPaid: (e) => `Pagamento confirmado: R$ ${e.data.amount}`,
    // @ts-expect-error — TS18046
    ProdutoEstoqueBaixo: (e) => `⚠️ Estoque baixo: ${e.data.produtoNome}`,
    // @ts-expect-error — TS18046
    LeadConverted: (e) => `🎉 Lead convertido: ${e.data.leadNome}`,
    // @ts-expect-error — TS18046
    AppointmentScheduled: (e) => `Consulta agendada: ${e.data.patientName}`,
  };

  async handle(event: DomainEvent): Promise<void> {
    const messageGetter = this.messageMap[event.eventName];

    if (messageGetter) {
      const message = messageGetter(event);

      // Show different toast types based on event
      if (event.eventName === "ProdutoEstoqueBaixo") {
        toast.warning(message);
      } else if (event.eventName === "LeadConverted") {
        toast.success(message);
      } else {
        toast.info(message);
      }
    }
  }
}
