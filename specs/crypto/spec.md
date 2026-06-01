# Feature Specification: Crypto Pagamentos

**Short Name**: `crypto-payments`
**Feature Branch**: `[026-crypto]`
**Created**: 2026-05-28
**Status**: Backfilled
**Project**: OrthoPlus Enterprise
**Priority**: P3 — Financial Innovation

---

## Backfill Notice

> ⚠️ This spec was generated from existing code via `speckit.sync.backfill`.
> It documents current behavior, not original intent.
> Review carefully and update to reflect desired behavior.

---

## 1. Overview / Context

O módulo de **Crypto Pagamentos** permite que clínicas odontológicas do OrthoPlus Enterprise integrem pagamentos via criptomoedas (Bitcoin, Ethereum, stablecoins) como alternativa de recebimento, além de gerenciar carteiras offline e estratégias de DCA (Dollar Cost Averaging).

### Motivation
Oferecer uma alternativa moderna de pagamento para pacientes que preferem ou possuem criptomoedas, expandindo as formas de recebimento da clínica.

### Scope
**Inclui:**
- Configuração de exchanges de criptomoedas (Binance, Coinbase, Kraken, Mercado Bitcoin)
- Geração de endereços de pagamento em crypto
- Conversão automática de crypto para BRL
- Emissão de faturas em criptomoedas
- Gerenciamento de carteiras offline (cold wallets)
- Sincronização de carteiras via xpub
- Webhooks para notificações de transações
- Monitoramento de volatilidade e alertas de preço
- Estratégias de DCA (Dollar Cost Averaging)

**Exclui:**
- Trading ativo de criptomoedas
- Empréstimos colateralizados em crypto
- Staking e yield farming
- Integração com DeFi protocols

---

## 2. User Stories

### Story 1 — Configuração de Exchange (P1)
**As a** administrador financeiro
**I want** configurar uma exchange de criptomoedas
**So that** a clínica possa receber pagamentos em crypto

**Acceptance Criteria:**
- Suporte a Binance, Coinbase, Kraken e Mercado Bitcoin
- Campos: apiKey, apiSecret, exchangeType, isActive
- Validação de credenciais
- Criptografia de apiSecret em repouso

### Story 2 — Geração de Endereço de Pagamento (P1)
**As a** recepcionista
**I want** gerar um endereço de pagamento em criptomoeda para um paciente
**So that** o paciente possa pagar sua consulta em crypto

**Acceptance Criteria:**
- Suporte a múltiplos tipos de moedas (coin_type)
- Associação a wallet_id existente
- Endereço único por transação
- QR code para pagamento (frontend)

### Story 3 — Conversão Crypto para BRL (P2)
**As a** administrador financeiro
**I want** converter automaticamente crypto recebida para BRL
**So that** minimize exposição à volatilidade

**Acceptance Criteria:**
- Taxa de câmbio em tempo real
- Registro da transação de conversão
- Associação ao transactionId original

### Story 4 — Carteira Offline (P2)
**As a** administrador de TI
**I want** gerenciar carteiras offline (cold wallets)
**So that** os fundos em crypto fiquem seguros

**Acceptance Criteria:**
- Validação de xpub
- Sincronização de saldo
- Gerenciamento de múltiplas carteiras

---

## 3. Functional Requirements

### CRY-FR-001: Configuração de Exchange
**Description**: CRUD de configurações de exchange de criptomoedas.
**Priority**: Must Have
**Acceptance Criteria**:
- CREATE /api/crypto_config/exchanges
- LIST /api/crypto_config/exchanges
- Suporte a 4 exchanges: BINANCE, COINBASE, KRAKEN, MERCADO_BITCOIN
- clinicId obrigatório (multi-tenancy)
- apiSecret não exposto na API (omitido do JSON)

### CRY-FR-002: Geração de Endereço de Pagamento
**Description**: Gerar endereços de recebimento em criptomoedas.
**Priority**: Must Have
**Acceptance Criteria**:
- POST /api/crypto_config/payment-address
- Parâmetros: coin_type, wallet_id
- Endereço único por requisição
- Validação de clinicId

### CRY-FR-003: Conversão Crypto para BRL
**Description**: Converter valores em crypto para reais.
**Priority**: Must Have
**Acceptance Criteria**:
- POST /api/crypto/convert
- transactionId obrigatório
- Registro da conversão com taxa aplicada
- Retorno: valor em BRL, taxa de câmbio, timestamp

### CRY-FR-004: Emissão de Fatura Crypto
**Description**: Criar faturas de pagamento em criptomoedas.
**Priority**: Should Have
**Acceptance Criteria**:
- POST /api/crypto/invoice
- Suporte a múltiplas moedas
- Expiração configurável
- Status: PENDENTE, PAGA, EXPIRADA, CANCELADA

### CRY-FR-005: Gerenciamento de Carteiras Offline
**Description**: Gerenciar carteiras offline (cold storage).
**Priority**: Should Have
**Acceptance Criteria**:
- POST /api/crypto_config/offline-wallet/manage
- POST /api/crypto_config/offline-wallet/sync
- POST /api/crypto_config/offline-wallet/validate-xpub
- Validação de xpub com retorno de endereços derivados

### CRY-FR-006: Webhooks de Transação
**Description**: Receber e processar webhooks de transações.
**Priority**: Should Have
**Acceptance Criteria**:
- POST /api/crypto_config/webhooks/transaction
- Validação de IP e assinatura
- Atualização automática de status de pagamento
- Notificação em tempo real

### CRY-FR-007: Taxas em Tempo Real
**Description**: Consultar taxas de câmbio de criptomoedas.
**Priority**: Should Have
**Acceptance Criteria**:
- GET /api/crypto/rates
- Suporte a múltiplos pares (BTC/BRL, ETH/BRL, USDT/BRL)
- Cache de 5 minutos
- Fonte: exchanges configuradas

### CRY-FR-008: Alertas de Volatilidade
**Description**: Monitorar e alertar sobre volatilidade de preços.
**Priority**: Could Have
**Acceptance Criteria**:
- POST /api/crypto_config/workers/volatility
- Threshold configurável
- Notificações via sistema
- Histórico de alertas

---

## 4. Non-Functional Requirements

### Performance
- Geração de endereço: < 500ms
- Conversão: < 1s (incluindo chamada à exchange)
- Taxas em tempo real: < 300ms (com cache)

### Security
- apiSecret criptografado em repouso (AES-256)
- xpub validado antes de uso
- Webhooks com validação de IP e assinatura HMAC
- clinicId obrigatório em todas as operações
- Módulo desativável via ENABLE_CRYPTO_MODULE

### Usability
- Interface para configurar exchanges
- Visualização de portfolio consolidado
- Histórico de transações com filtros

---

## 5. Success Criteria

### CRY-SC-001: Taxa de Conversão
**Description**: Conversões de crypto para BRL completadas em menos de 2 minutos
**Target**: 95% das conversões < 2min
**Measurement**: Logs de API

### CRY-SC-002: Precisão de Taxas
**Description**: Taxas de câmbio dentro de 1% da média de mercado
**Target**: 99% das taxas dentro do threshold
**Measurement**: Comparação com CoinGecko/CoinMarketCap

---

## 6. User Scenarios & Testing

### Scenario 1: Configuração de Exchange
**Given** um administrador logado
**When** ele configura uma exchange Binance com API key e secret
**Then** a exchange é salva, criptografada, e aparece na lista

### Scenario 2: Pagamento em Crypto
**Given** um paciente na recepção
**When** a recepcionista gera um endereço BTC para pagamento
**Then** um endereço único é gerado e exibido como QR code

### Scenario 3: Conversão Automática
**Given** uma transação crypto recebida
**When** o sistema executa a conversão para BRL
**Then** o valor em reais é registrado e o saldo atualizado

---

## 7. Edge Cases

### EC-001: Exchange Desabilitada
**Condition**: ENABLE_CRYPTO_MODULE !== "true"
**Expected Behavior**: Todas as rotas retornam 503 "Crypto module is disabled"

### EC-002: API Key Inválida
**Condition**: Exchange configurada com credenciais inválidas
**Expected Behavior**: Erro 401 ao sincronizar, log de warning

### EC-003: xpub Inválido
**Condition**: xpub fornecido não é válido
**Expected Behavior**: Validação retorna erro com detalhes

---

## 8. Key Entities

### Entity: ExchangeConfig
**Attributes**:
- id (UUID)
- clinicId (String)
- exchangeType (Enum): BINANCE, COINBASE, KRAKEN, MERCADO_BITCOIN
- apiKey (String)
- apiSecret (String) — criptografado
- isActive (Boolean)
- lastSyncAt (DateTime)
- createdAt (DateTime)
- updatedAt (DateTime)

### Entity: CryptoPayment
**Attributes**:
- id (UUID)
- clinicId (String)
- transactionId (String)
- coinType (String)
- amount (Decimal)
- amountBrl (Decimal)
- exchangeRate (Decimal)
- status (Enum): PENDENTE, PAGA, EXPIRADA, CANCELADA
- walletAddress (String)
- createdAt (DateTime)
- updatedAt (DateTime)

### Entity: CryptoWallet
**Attributes**:
- id (UUID)
- clinicId (String)
- walletId (String)
- coinType (String)
- xpub (String)
- balance (Decimal)
- isOffline (Boolean)
- createdAt (DateTime)
- updatedAt (DateTime)

---

## 9. API Endpoints

### Crypto Config Routes (/api/crypto_config)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /exchanges | Listar exchanges configuradas |
| POST | /exchanges | Criar configuração de exchange |
| GET | /portfolio | Consultar portfolio consolidado |
| GET | /dca-strategies | Listar estratégias DCA |
| POST | /offline-wallet/manage | Gerenciar carteira offline |
| POST | /offline-wallet/sync | Sincronizar carteira |
| POST | /offline-wallet/validate-xpub | Validar xpub |
| GET | /realtime-notifications | Notificações em tempo real |
| POST | /workers/volatility | Processar alertas de volatilidade |
| POST | /webhooks/transaction | Webhook de transação |
| POST | /payment-address | Gerar endereço de pagamento |

### Crypto Routes (/api/crypto)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /convert | Converter crypto para BRL |
| POST | /invoice | Criar fatura crypto |
| GET | /manager/status | Status do gerenciador |
| GET | /rates | Taxas de câmbio |
| POST | /wallet/sync | Sincronizar wallet |
| POST | /wallet/validate-xpub | Validar xpub |
| POST | /webhook | Webhook genérico |
| POST | /wallet/offline | Gerenciar wallet offline |
| POST | /jobs/execute | Executar jobs |

---

## 10. Dependencies & Assumptions

### Dependencies
- `financeiro` — conversão e registro financeiro
- `faturamento` — emissão de notas fiscais
- `notifications` — alertas de volatilidade

### Assumptions
- Módulo desativado por padrão (ENABLE_CRYPTO_MODULE)
- Exchanges possuem APIs REST públicas
- Pacientes possuem carteiras crypto

---

## 11. Out of Scope

- Trading ativo e arbitragem
- Empréstimos colateralizados
- Staking e yield farming
- Integração com DeFi
- Suporte a NFTs

---

## 12. Notes

- Backend: módulos `crypto` e `crypto_config` com Prisma
- Módulo condicionalmente ativado via env var ENABLE_CRYPTO_MODULE
- clinicGuard obrigatório em todas as rotas
- apiSecret omitido do JSON de resposta (LGPD)
- Frontend: rota `/crypto-payment`
