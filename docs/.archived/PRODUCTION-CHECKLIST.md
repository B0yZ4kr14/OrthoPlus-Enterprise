# PRODUCTION-CHECKLIST.md — OrthoPlus Go-Live

> **Objetivo:** Este checklist garante que todos os itens críticos foram verificados antes de colocar o OrthoPlus em produção.  
> Execute cada item e marque como concluído antes do go-live.

---

## 1. Configuração de Ambiente (.env)

- [ ] Arquivo `.env.production` criado a partir de `.env.production.example`
- [ ] `NODE_ENV=production`
- [ ] `PORT=3005` (consistente com nginx.conf e docker-compose.prod.yml)
- [ ] `JWT_SECRET` gerado com `openssl rand -base64 32` (mínimo 32 caracteres)
- [ ] `AUTH_ALLOW_MOCK=false` — **NUNCA** deixar `true` em produção
- [ ] `ENABLE_DANGEROUS_ADMIN_ENDPOINTS=false` — **NUNCA** deixar `true` em produção
- [ ] `DB_SSL=true` e `DATABASE_URL` com `sslmode=require`
- [ ] `REDIS_PASSWORD` definido com senha forte (mínimo 16 caracteres)
- [ ] `ALLOWED_ORIGINS` configurado com o(s) domínio(s) de produção (nunca `*`)
- [ ] `SMTP_*` configurado e testado (envio de email funcional)
- [ ] `AGORA_APP_ID` e `AGORA_APP_CERTIFICATE` configurados (se teleodontologia ativa)
- [ ] `GRAFANA_PASSWORD` definido com senha forte
- [ ] Executar script de validação: `./scripts/validate-production.sh`

---

## 2. DNS e SSL/TLS

- [ ] Registro DNS apontando para o IP do servidor de produção
  - [ ] Registro A para `orthoplus.com.br` (ou domínio real)
  - [ ] Registro A para `www.orthoplus.com.br`
- [ ] Certificado SSL/TLS válido instalado em `./ssl/cert.pem` e `./ssl/key.pem`
  - [ ] Opção A: Let's Encrypt via Certbot
  - [ ] Opção B: Certificado comercial (DV, OV ou EV)
- [ ] `dhparam.pem` gerado: `openssl dhparam -out ./ssl/dhparam.pem 4096`
- [ ] `server_name` no `nginx.conf` substituído pelo domínio real
- [ ] Testar grau SSL em [SSL Labs](https://www.ssllabs.com/ssltest/) — meta: nota **A+**
- [ ] HSTS preload ativo no nginx.conf (`Strict-Transport-Security`)

---

## 3. Build e Deploy

- [ ] Build de produção completo sem erros:
  ```bash
  docker compose -f docker-compose.prod.yml build --no-cache
  ```
- [ ] Todos os serviços com status `healthy`:
  ```bash
  docker compose -f docker-compose.prod.yml ps
  ```
- [ ] Migrations de banco de dados executadas:
  ```bash
  docker compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy
  ```
- [ ] Health check de todos os serviços: `./scripts/health-check.sh`
- [ ] Rollback testado e documentado

---

## 4. Segurança

- [ ] `npm audit` executado no frontend — zero vulnerabilidades critical/high
  ```bash
  npm audit --audit-level=high
  ```
- [ ] `npm audit` executado no backend — zero vulnerabilidades critical/high
  ```bash
  cd backend && npm audit --audit-level=high
  ```
- [ ] Firewall configurado (apenas portas 80, 443 e SSH expostas)
- [ ] SSH por chave (password auth desativado)
- [ ] Usuário de banco de dados com privilégios mínimos (sem superuser)
- [ ] Redis não acessível externamente (apenas na rede Docker interna)
- [ ] Secrets não commitados no repositório (verificar com `git log --all -p | grep -i secret`)
- [ ] Rate limiting ativo no nginx.conf (zonas global, api, auth, upload)
- [ ] Logs não expõem dados sensíveis (senhas, tokens, PII)

---

## 5. Backup e Recovery

- [ ] Estratégia de backup de banco de dados definida e implementada
  - [ ] Backup automático diário (worker `backupJobs` ativo)
  - [ ] Retenção mínima: 30 dias
  - [ ] Backup criptografado (conforme SECURITY.md)
- [ ] Restore testado com sucesso em ambiente isolado
- [ ] Backup do Redis configurado (se dados críticos no Redis)
- [ ] Documentação de recovery atualizada

---

## 6. Monitoramento

- [ ] Prometheus coletando métricas do backend em `/metrics`
- [ ] Dashboards Grafana acessíveis e alimentados com dados reais
- [ ] Alertas configurados para:
  - [ ] Error rate > 5%
  - [ ] Latência P95 > 2s
  - [ ] Disco > 80%
  - [ ] Memória > 85%
  - [ ] CPU > 90% por mais de 5 minutos
- [ ] Logs centralizados e com retenção adequada (mínimo 90 dias)
- [ ] PM2 monitoramento ativo (`pm2 monit`)

---

## 7. Testes Antes do Go-Live

### Testes Automatizados

- [ ] Suite de testes unitários passando: `npm run test`
- [ ] Suite de testes do backend passando: `cd backend && npm test`
- [ ] Testes E2E passando: `npx playwright test`
- [ ] Lint e type-check limpos: `npm run lint && npx tsc --noEmit`

### Fluxos Críticos de Negócio (Teste Manual em Staging)

| # | Fluxo | Status |
|---|-------|--------|
| 1 | Login → Dashboard → Logout | ☐ |
| 2 | Cadastrar Paciente → Agendar Consulta → Criar Prontuário | ☐ |
| 3 | Criar Orçamento → Aprovar → Registrar Pagamento | ☐ |
| 4 | Multi-tenancy: Clínica A não vê dados da Clínica B | ☐ |
| 5 | Upload de Radiografia/Arquivo (DICOM) | ☐ |
| 6 | Teleodontologia (Agora — chamada de vídeo) | ☐ |
| 7 | Exportação de Relatório PDF/Excel | ☐ |
| 8 | Notificações em tempo real (SSE) | ☐ |
| 9 | Backup e Restore do banco de dados | ☐ |
| 10 | LGPD — solicitação de anonimização/exclusão de dados | ☐ |

---

## 8. Documentação

- [x] `ARCHITECTURE.md` — atualizado
- [x] `SECURITY.md` — completo
- [x] `DEPLOY.md` — presente
- [x] `CONTRIBUTING.md` — presente
- [x] `CHANGELOG.md` — presente
- [x] `LICENSE` — presente
- [ ] `PRODUCTION-CHECKLIST.md` este arquivo — preenchido e revisado
- [ ] Runbook de operações (resposta a incidentes) disponível para o time

---

## 9. Configuração de CI/CD

- [ ] Pipeline de build passando na branch `main`
- [ ] Testes automatizados passando no CI
- [ ] Workflow de validação de produção (`production-validation.yml`) passando
- [ ] Deploy automático configurado e testado para staging
- [ ] Deploy para produção requer aprovação manual (proteção de branch)
- [ ] Secrets do GitHub Actions configurados:
  - [ ] `SSH_PRIVATE_KEY`
  - [ ] `PRODUCTION_HOST`
  - [ ] `PRODUCTION_USER`

---

## 10. Contatos e Escalação

| Função | Responsável | Contato |
|--------|-------------|---------|
| **Tech Lead / DevOps** | — | — |
| **DBA** | — | — |
| **Segurança** | — | security@orthoplus.com.br |
| **Suporte N1** | — | — |
| **TSI Telecom** | — | contato@tsitelecom.com.br |

### Procedimento de Escalação

1. **Incidente P1 (produção fora):** Acionar Tech Lead imediatamente, abrir war room
2. **Incidente P2 (degradação):** Notificar Tech Lead em até 30 minutos
3. **Incidente de Segurança:** Acionar responsável de segurança + Tech Lead imediatamente

---

## Aprovação Final

Antes do go-live, as seguintes pessoas devem revisar e aprovar este checklist:

| Papel | Nome | Data | Aprovação |
|-------|------|------|-----------|
| Tech Lead | | | ☐ |
| QA | | | ☐ |
| Segurança | | | ☐ |
| Gerente de Produto | | | ☐ |

---

*Última atualização: 2026 — OrthoPlus por TSI Telecom*
