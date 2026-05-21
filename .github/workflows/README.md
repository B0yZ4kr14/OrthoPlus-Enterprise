# GitHub Actions Workflows

## Workflows Disponíveis

### `deploy-vps-tsi-02.yml`
Deploy automático para a VPS vps-tsi-02 (Tailscale: 100.111.74.69).

**Trigger:**
- Push para branch `main`
- Manual (workflow_dispatch)

**Jobs:**
1. Build backend
2. Build frontend
3. Deploy via SCP
4. Restart PM2 e Nginx
5. Health check

**Secrets necessários:**
- `VPS_TSI_02_HOST`: 100.111.74.69 (ou IP público quando DNS configurado)
- `VPS_TSI_02_USER`: ubuntu
- `VPS_TSI_02_SSH_KEY`: Chave SSH privada (id_ed25519_b0yz4kr14)

### Outros Workflows

- `build.yml`: Build do projeto
- `ci.yml`: Integração contínua
- `test.yml`: Testes unitários
- `e2e-tests.yml`: Testes E2E com Playwright
- `quality-check.yml`: Verificação de qualidade
- `security.yml`: Scan de segurança

## Configuração de Secrets

Acesse: Settings → Secrets and variables → Actions

Adicione os seguintes secrets:

```
VPS_TSI_02_HOST=100.111.74.69
VPS_TSI_02_USER=tsi
VPS_TSI_02_SSH_KEY=-----BEGIN OPENSSH PRIVATE KEY-----
...
-----END OPENSSH PRIVATE KEY-----
```

Para obter a chave SSH:
```bash
cat ~/.ssh/id_ed25519_b0yz4kr14
```

## Status dos Workflows

| Workflow | Status | Última execução |
|----------|--------|-----------------|
| deploy-vps-tsi-02 | ⏳ Aguardando secrets | - |
| build | ✅ | Ver GitHub Actions |
| ci | ✅ | Ver GitHub Actions |
