# Plan: Crypto Pagamentos

## Overview
Integrar pagamentos via criptomoedas (Bitcoin, Ethereum, stablecoins) como alternativa de recebimento para clínicas, gerenciando exchanges, carteiras offline, conversão para BRL e webhooks de transações.

## Architecture
- Frontend: `apps/web/src/modules/crypto/` — páginas de configuração, portfolio, faturas
- Backend: `backend/src/modules/crypto/` e `backend/src/modules/crypto_config/` — controllers, serviços de exchange
- Database: schema `crypto_config` com tabelas `ExchangeConfig`, `CryptoPayment`, `CryptoWallet`

## Phases
### Phase 1: Foundation
- [ ] Revisar código existente em `backend/src/modules/crypto/` e `crypto_config/`
- [ ] Verificar/criar tabelas `ExchangeConfig`, `CryptoPayment`, `CryptoWallet` no schema `crypto_config`
- [ ] Implementar middleware condicional `ENABLE_CRYPTO_MODULE`
- [ ] Configurar variáveis de ambiente para exchanges (API keys)

### Phase 2: Implementation
- [ ] Implementar CRUD de configurações de exchange (Binance, Coinbase, Kraken, Mercado Bitcoin)
- [ ] Implementar geração de endereços de pagamento por tipo de moeda
- [ ] Implementar endpoint de conversão crypto para BRL com taxa em tempo real
- [ ] Implementar emissão de faturas crypto com expiração configurável
- [ ] Implementar gerenciamento de carteiras offline (xpub, sincronização)
- [ ] Implementar webhooks de transação com validação HMAC
- [ ] Implementar monitoramento de volatilidade e alertas

### Phase 3: Polish
- [ ] Criar interface de configuração de exchanges
- [ ] Criar dashboard de portfolio consolidado
- [ ] Implementar geração de QR code para pagamentos
- [ ] Adicionar cache de 5 minutos para taxas de câmbio
- [ ] Adicionar testes e documentar limitações do módulo

## Risks
- Módulo desativado por padrão — requer ativação explícita
- apiSecret deve ser criptografado (AES-256) — nunca exposto na API
- Volatilidade de crypto pode causar prejuízos se conversão não for automática
- Webhooks requerem validação rigorosa de assinatura
