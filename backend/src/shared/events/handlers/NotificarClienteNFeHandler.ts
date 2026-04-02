import { EventHandler } from '../EventHandler';
import { NFeAutorizadaEvent } from '@/modules/faturamento/domain/events/NFeAutorizadaEvent';
import { logger } from '@/infrastructure/logger';

export class NotificarClienteNFeHandler implements EventHandler<NFeAutorizadaEvent> {
  async handle(event: NFeAutorizadaEvent): Promise<void> {
    try {
      // Aqui integraria com serviço de email/WhatsApp
      logger.info('Notificação de NFe autorizada enviada ao cliente', {
        nfeId: event.nfe.id,
        numero: event.nfe.numero,
        protocolo: event.protocolo,
        cliente: event.nfe.clienteNome
      });
      
      // TODO: Implementar envio real de email/WhatsApp
      // await emailService.send({
      //   to: event.nfe.clienteEmail,
      //   subject: ,
      //   ...
      // });
    } catch (error) {
      logger.error('Erro ao notificar cliente sobre NFe', { error, event });
    }
  }
}
