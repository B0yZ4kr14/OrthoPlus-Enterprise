import { eventBus } from './EventBus';
import { AtualizarEstoqueHandler } from './handlers/AtualizarEstoqueHandler';
import { GerarFinanceiroHandler } from './handlers/GerarFinanceiroHandler';
import { NotificarClienteNFeHandler } from './handlers/NotificarClienteNFeHandler';
import { VerificarEstoqueMinimoHandler } from './handlers/VerificarEstoqueMinimoHandler';
import { ProdutoRepositoryPostgres } from '@/modules/inventario/infrastructure/repositories/ProdutoRepositoryPostgres';
import { TransactionRepositoryPostgres } from '@/modules/financeiro/infrastructure/repositories/TransactionRepositoryPostgres';
import { db } from '@/infrastructure/database/connection';
import { logger } from '@/infrastructure/logger';

export function registerEventHandlers(): void {
  const produtoRepo = new ProdutoRepositoryPostgres(db);
  const transactionRepo = new TransactionRepositoryPostgres(db);

  eventBus.register('PDV.VendaRegistrada', new AtualizarEstoqueHandler(produtoRepo));
  eventBus.register('PDV.VendaRegistrada', new GerarFinanceiroHandler(transactionRepo));
  eventBus.register('Faturamento.NFeAutorizada', new NotificarClienteNFeHandler());
  eventBus.register('Inventario.EstoqueAlterado', new VerificarEstoqueMinimoHandler());

  logger.info('✅ Event handlers registrados');
}
