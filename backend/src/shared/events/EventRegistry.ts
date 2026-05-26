import { eventBus } from './EventBus';
import { AtualizarEstoqueHandler } from './handlers/AtualizarEstoqueHandler';
import { GerarFinanceiroHandler } from './handlers/GerarFinanceiroHandler';
import { NotificarClienteNFeHandler } from './handlers/NotificarClienteNFeHandler';
import { VerificarEstoqueMinimoHandler } from './handlers/VerificarEstoqueMinimoHandler';
import { SearchIndexAgendaHandler } from './handlers/SearchIndexAgendaHandler';
import { SearchIndexPepHandler } from './handlers/SearchIndexPepHandler';
import { SearchIndexPatientHandler } from '@/modules/search_index/events/handlers/SearchIndexPatientHandler';
import { ProdutoRepositoryPostgres } from '@/modules/inventario/infrastructure/repositories/ProdutoRepositoryPostgres';
import { TransactionRepositoryPostgres } from '@/modules/financeiro/infrastructure/repositories/TransactionRepositoryPostgres';
import { AgendaIndexer } from '@/modules/search_index/services/AgendaIndexer';
import { PepIndexer } from '@/modules/search_index/services/PepIndexer';
import { prisma } from '@/infrastructure/database/prismaClient';
import { db } from '@/infrastructure/database/connection';
import { logger } from '@/infrastructure/logger';

export function registerEventHandlers(): void {
  const produtoRepo = new ProdutoRepositoryPostgres(db);
  const transactionRepo = new TransactionRepositoryPostgres(db);

  eventBus.register('PDV.VendaRegistrada', new AtualizarEstoqueHandler(produtoRepo));
  eventBus.register('PDV.VendaRegistrada', new GerarFinanceiroHandler(transactionRepo));
  eventBus.register('Faturamento.NFeAutorizada', new NotificarClienteNFeHandler());
  eventBus.register('Inventario.EstoqueAlterado', new VerificarEstoqueMinimoHandler());

  const searchIndexPatientHandler = new SearchIndexPatientHandler();
  eventBus.register('Pacientes.PatientCreated', searchIndexPatientHandler);
  eventBus.register('Pacientes.PatientUpdated', searchIndexPatientHandler);
  eventBus.register('Pacientes.PatientDeleted', searchIndexPatientHandler);

  // Agenda real-time search indexing
  const searchIndexAgendaHandler = new SearchIndexAgendaHandler(new AgendaIndexer(prisma));
  eventBus.register('AppointmentCreated', searchIndexAgendaHandler);
  eventBus.register('AppointmentUpdated', searchIndexAgendaHandler);
  eventBus.register('AppointmentDeleted', searchIndexAgendaHandler);

  // PEP real-time search indexing
  const searchIndexPepHandler = new SearchIndexPepHandler(new PepIndexer(prisma));
  eventBus.register('ProntuarioCreated', searchIndexPepHandler);
  eventBus.register('ProntuarioUpdated', searchIndexPepHandler);
  eventBus.register('ProntuarioDeleted', searchIndexPepHandler);
  eventBus.register('TratamentoCreated', searchIndexPepHandler);
  eventBus.register('TratamentoUpdated', searchIndexPepHandler);
  eventBus.register('TratamentoDeleted', searchIndexPepHandler);

  logger.info('✅ Event handlers registrados');
}
