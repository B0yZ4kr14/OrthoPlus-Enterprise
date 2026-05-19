# Architecture Guard Report — Frontend Scan

**Generated**: 2026-05-19  
**Scope**: `apps/web/src/`  
**Method**: madge + grep analysis + Constitution validation  

---

## Summary

| Category | Count | Critical | High | Medium | Low |
|----------|-------|----------|------|--------|-----|
| Circular Dependencies | 7 | 0 | 7 | 0 | 0 |
| Boundary Erosion | 18 | 0 | 0 | 18 | 0 |
| Constitution Breach | 18 | 0 | 0 | 18 | 0 |
| Missing Abstractions | 2 | 0 | 0 | 2 | 0 |
| **TOTAL** | **45** | **0** | **7** | **38** | **0** |

---

## Circular Dependencies (7) — SEVERITY: HIGH

### CD-001: Exchange Factory ↔ Adapters (crypto)
```
infrastructure/external/exchanges/ExchangeFactory.ts
  → BTCPayAdapter.ts
  → BinanceAdapter.ts
  → CoinbaseAdapter.ts
  → KrakenAdapter.ts
  → MercadoBitcoinAdapter.ts
```

**Impact**: Dificulta testes unitários, aumenta bundle size, quebra tree-shaking  
**Fix**: Inverter dependência — Factory receber adapters como injeção  
**Effort**: M  

### CD-002: usePatientsAPI ↔ usePatientsUnified (pacientes)
```
modules/pacientes/hooks/usePatientsAPI.ts
  → modules/pacientes/hooks/usePatientsUnified.ts
```

**Impact**: Hooks acoplados, dificulta manutenção  
**Fix**: Extrair lógica compartilhada para hook utilitário  
**Effort**: S  

### CD-003: TabOdontograma ↔ OdontogramaContent ↔ lazy/index (pep)
```
modules/pep/components/lazy/TabOdontograma.tsx
  → modules/pep/components/tabs/OdontogramaContent.tsx
  → modules/pep/components/lazy/index.ts
```

**Impact**: Lazy loading pode falhar, bundle não otimizado  
**Fix**: Remover index.ts intermediário, importar diretamente  
**Effort**: S  

---

## Boundary Erosion (18) — SEVERITY: MEDIUM

### BE-001: Direct `fetch()` calls bypassing apiClient

**Constitution AP-3 MUST**: "Never use fetch or raw axios — always use apiClient"

| # | File | Line | Call |
|---|------|------|------|
| 1 | `application/use-cases/agenda/SendConfirmacaoWhatsAppUseCase.ts` | 74 | `fetch(webhookUrl, ...)` |
| 2 | `components/crypto/crypto-performance-report/marketData.ts` | 10 | `fetch(btcUrl)` |
| 3 | `components/crypto/crypto-portfolio-dashboard/usePortfolioData.ts` | 21 | `fetch(portfolioUrl)` |
| 4 | `components/crypto/dca-backtesting/useDCABacktesting.ts` | 27 | `fetch(dcaUrl)` |
| 5 | `components/crypto/krux-integration/useKruxIntegration.ts` | 30 | `fetch("/api/crypto/broadcast")` |
| 6 | `components/crypto/psbt-builder/usePSBTBuilder.ts` | 19 | `fetch("/api/crypto/create-psbt")` |
| 7 | `components/crypto/CryptoCalculator.tsx` | 127 | `fetch(...)` |
| 8 | `components/crypto/CryptoPerformanceReport.tsx` | 250 | `fetch(btcUrl)` |
| 9 | `components/crypto/CryptoPortfolioDashboard.tsx` | 45 | `fetch(...)` |
| 10 | `components/crypto/DCABacktesting.tsx` | 67 | `fetch(...)` |
| 11 | `components/crypto/KruxIntegration.tsx` | 49 | `fetch("/api/crypto/broadcast")` |
| 12 | `components/crypto/PSBTBuilder.tsx` | 38 | `fetch("/api/crypto/create-psbt")` |
| 13 | `components/dashboard/market-rates-widget/hooks/useMarketRates.ts` | 18 | `fetch(btcUrl)` |
| 14 | `components/dashboard/market-rates-widget/hooks/useMarketRates.ts` | 24 | `fetch(usdUrl)` |
| 15 | `components/dashboard/MarketRatesWidget.tsx` | 27 | `fetch(btcUrl)` |
| 16 | `components/dashboard/MarketRatesWidget.tsx` | 33 | `fetch(usdUrl)` |
| 17 | `components/settings/backend-selector/useBackendStatus.ts` | 21 | `fetch(${backend.url}/health)` |
| 18 | `components/settings/BackendSelector.tsx` | 43 | `fetch(${backend.url}/health)` |

**Pattern**: Todos os 18 estão em componentes UI (não em infrastructure/), violando a camada de abstração.  
**Fix**: Refatorar para usar `apiClient` ou criar hooks em `infrastructure/`  
**Effort**: M (18 arquivos)  

---

## Missing Abstractions (2) — SEVERITY: MEDIUM

### MA-001: Duplicate fetch logic for crypto APIs

`marketData.ts`, `usePortfolioData.ts`, `useDCABacktesting.ts`, `useMarketRates.ts`, `CryptoCalculator.tsx`, `CryptoPerformanceReport.tsx`, `CryptoPortfolioDashboard.tsx`, `DCABacktesting.tsx` — todos fazem fetch para APIs de preço BTC/USD.

**Fix**: Criar `infrastructure/external/cryptoPriceClient.ts` com caching  
**Effort**: S  

### MA-002: Duplicate PSBT/Broadcast logic

`useKruxIntegration.ts` + `KruxIntegration.tsx` e `usePSBTBuilder.ts` + `PSBTBuilder.tsx` duplicam chamadas para `/api/crypto/broadcast` e `/api/crypto/create-psbt`.

**Fix**: Criar hook `useCryptoTransaction()` em `modules/crypto/infrastructure/hooks/`  
**Effort**: S  

---

## Recommendations

| Priority | Action | Effort | Impact |
|----------|--------|--------|--------|
| 1 | Resolver 7 circular dependencies | M | Alto — melhora tree-shaking e testes |
| 2 | Refatorar 18 `fetch()` para `apiClient` | M | Alto — alinhamento com Constituição |
| 3 | Criar abstrações para crypto APIs | S | Médio — elimina duplicação |
| 4 | Adicionar lint rule para bloquear `fetch` | XS | Alto — previne regressão |

---

## Cross-References

- **Constitution**: `.specify/memory/constitution.md` AP-3
- **Playbook**: `PB06-architecture-guard.md`
- **Project Profile**: `P0-project-profile.md`
