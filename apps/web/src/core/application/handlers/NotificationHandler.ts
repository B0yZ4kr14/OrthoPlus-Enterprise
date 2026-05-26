import { IEventHandler } from "@/core/domain/events/EventBus";
import { DomainEvent } from "@/core/domain/events/DomainEvent";
import { toast } from "sonner";

/**
 * Generic handler for showing notifications based on domain events
 */
export class NotificationHandler implements IEventHandler<DomainEvent> {
  private messageMap: Record<string, (event: Record<string, unknown>) => string> = {
    TransactionCreated: (e) => `Transação criada: R$ ${(e.data as Record<string, unknown>).amount}`,
    TransactionPaid: (e) => `Pagamento confirmado: R$ ${(e.data as Record<string, unknown>).amount}`,
    ProdutoEstoqueBaixo: (e) => `⚠️ Estoque baixo: ${(e.data as Record<string, unknown>).produtoNome}`,
    LeadConverted: (e) => `🎉 Lead convertido: ${(e.data as Record<string, unknown>).leadNome}`,
    AppointmentScheduled: (e) => `Consulta agendada: ${(e.data as Record<string, unknown>).patientName}`,
  };

  async handle(event: DomainEvent): Promise<void> {
    const messageGetter = this.messageMap[event.eventName];

    if (messageGetter) {
      const message = messageGetter(event as unknown as Record<string, unknown>);

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
