# Tasks: Crypto Pagamentos

## Phase 1: Foundation
- [ ] T1: Auditar código existente em `backend/src/modules/crypto/` e `crypto_config/` e mapear gaps
- [ ] T2: Adicionar/verificar modelos Prisma `ExchangeConfig`, `CryptoPayment`, `CryptoWallet` no schema `crypto_config`
- [ ] T3: Implementar middleware `ENABLE_CRYPTO_MODULE` retornando 503 quando desabilitado
- [ ] T4: Configurar criptografia de `apiSecret` (AES-256) e garantir omissão no JSON de resposta

## Phase 2: Implementation
- [ ] T5: Implementar `GET /api/crypto_config/exchanges` e `POST /api/crypto_config/exchanges` com suporte a 4 exchanges
- [ ] T6: Implementar `POST /api/crypto_config/payment-address` gerando endereço único por `coin_type` e `wallet_id`
- [ ] T7: Implementar `POST /api/crypto/convert` com `transactionId` obrigatório, registro de taxa e valor em BRL
- [ ] T8: Implementar `POST /api/crypto/invoice` com suporte a múltiplas moedas e status (PENDENTE, PAGA, EXPIRADA, CANCELADA)
- [ ] T9: Implementar endpoints de carteira offline (`/offline-wallet/manage`, `/sync`, `/validate-xpub`)
- [ ] T10: Implementar `POST /api/crypto_config/webhooks/transaction` com validação de IP e assinatura HMAC
- [ ] T11: Implementar `GET /api/crypto/rates` com cache de 5 minutos para pares BTC/BRL, ETH/BRL, USDT/BRL
- [ ] T12: Implementar worker de alertas de volatilidade (`POST /api/crypto_config/workers/volatility`)

## Phase 3: Polish
- [ ] T13: Criar interface de configuração de exchanges em `apps/web/src/modules/crypto/`
- [ ] T14: Criar dashboard de portfolio consolidado com saldos e histórico
- [ ] T15: Implementar geração de QR code para endereços de pagamento no frontend
- [ ] T16: Adicionar testes unitários em `backend/tests/unit/` para conversão e webhooks
- [ ] T17: Documentar setup de exchanges e riscos de volatilidade no README do módulo
