# Plano de Migração: localStorage → HttpOnly Cookies

## Status
- **Data**: 2026-05-18
- **Prioridade**: Alta (Security Constitution §2.1)
- **Risco**: Médio — afeta todos os 37 módulos e fluxo de autenticação

## Contexto

O `security_constitution.md` proíbe explicitamente o armazenamento de tokens de autenticação em `localStorage` ou `sessionStorage` (DOM-accessible storage é vulnerável a XSS extraction).

Atualmente, o frontend ainda armazena tokens no `localStorage` como fallback, embora o backend já emita cookies HttpOnly, Secure, SameSite=Strict.

## Estado Atual

### Backend (✅ Pronto)
- AuthController já usa `res.cookie()` para access e refresh tokens
- authMiddleware já prioriza leitura do cookie antes do header Authorization
- Logout já limpa os cookies com `res.clearCookie()`

### Frontend (⚠️ Migração Parcial)
- apiClient já envia cookies (`withCredentials: true`)
- AuthContext ainda usa `localStorage.getItem()` para access token em `checkSession()`
- AuthContext ainda faz `localStorage.setItem()` no login
- signOut não limpa explicitamente tokens do legacy storage

## Plano de Migração

### Fase 1: Remover Dependência de localStorage no AuthContext (1-2 dias)

**Arquivo**: `apps/web/src/contexts/AuthContext.tsx`

1. Remover `localStorage.getItem()` de `checkSession()`
   - O `/auth/me` já recebe o cookie automaticamente via `withCredentials: true`
   - Se não houver cookie, o backend retorna 401 → AuthContext trata como sessão inválida

2. Remover `localStorage.setItem()` do `signIn()`
   - O backend já seta o cookie na resposta
   - O frontend não precisa mais armazenar o token manualmente

3. Adicionar limpeza de tokens legados no logout
   - `localStorage.removeItem()` para access e refresh tokens
   - Garante que sessões antigas sejam invalidadas

4. Manter fallback de `/auth/profile` por 1 sprint
   - Depois de 100% dos usuários terem cookies ativos, remover o fallback

### Fase 2: Atualizar E2E Tests (1 dia)

- O teste de login via UI continua funcionando (cookies são gerenciados automaticamente pelo browser)
- O `storageState` do Playwright já captura cookies automaticamente
- Verificar se o `test-server.py` proxy preserva cookies entre requests

### Fase 3: Cleanup de Código Legado (1 dia)

- Remover qualquer `localStorage.getItem()` fora do AuthContext
- Verificar se há outros módulos acessando `localStorage` diretamente para tokens
- Atualizar `AGENTS.md` para refletir a nova política

### Fase 4: Testes de Segurança (1 dia)

- Verificar via DevTools que `document.cookie` não expõe access_token (HttpOnly)
- Verificar que `localStorage` não contém tokens após login
- Testar XSS simulado: injetar script que tenta ler `localStorage` — deve retornar null para tokens

## Rollback Plan

Se houver problemas com cookies em ambientes específicos (ex: mobile híbrido, electron):

1. Reverter para dual-mode: cookie preferencial, localStorage como fallback
2. Adicionar feature flag `AUTH_STORAGE_MODE=cookie|localStorage`
3. Monitorar taxa de erro 401 no backend

## Critérios de Aceitação

- [ ] `localStorage` não contém tokens de autenticação após login
- [ ] Requisições autenticadas funcionam sem header Authorization explícito
- [ ] Logout limpa tanto cookies quanto legacy storage
- [ ] E2E tests passam sem alterações nos cenários de login
- [ ] Nenhum novo `localStorage.setItem` para tokens é introduzido

## Referências

- `security_constitution.md` §2.1 — Authentication tokens
- `backend/src/modules/auth/api/AuthController.ts` — Cookie emission
- `backend/src/middleware/authMiddleware.ts` — Cookie reading
- `apps/web/src/lib/api/apiClient.ts` — `withCredentials: true`
- `apps/web/src/contexts/AuthContext.tsx` — LocalStorage dependency
