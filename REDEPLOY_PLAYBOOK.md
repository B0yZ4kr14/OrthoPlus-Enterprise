# Playbook: Redeploy Produção Robust (Monorepo)

Este documento descreve o fluxo de deploy otimizado para o OrthoPlus Enterprise no VPS.

## 1. Fluxo de Sincronização

Utilize o `rsync` com a chave de deploy para sincronizar a estrutura monorepo completa, excluindo artefatos locais.

```bash
rsync -avz --delete \
--exclude="node_modules" \
--exclude=".git" \
--exclude="dist" \
--exclude=".turbo" \
--exclude="playwright-report" \
-e "ssh -i ~/.ssh/id_ed25519_b0yz4kr14" \
. tsi@100.111.74.69:/home/tsi/OrthoPlus-Enterprise/
```

## 2. Fluxo de Build (Remoto)

Sempre realizar o build no VPS para garantir resolução de dependências `workspace:*`.

```bash
# No VPS
cd /home/tsi/OrthoPlus-Enterprise

# Instalar dependências
pnpm install

# Backend
cd backend
pnpm build
pm2 reload orthoplus-backend

# Aguardar health check
curl -s --max-time 10 http://localhost:3005/health

# Frontend
cd ../apps/web
pnpm build
sudo cp -rv dist/* /var/www/orthoplus/

# Recarregar nginx
sudo nginx -t && sudo systemctl reload nginx
```

## 3. Resolução de Aliases (@/)

O backend utiliza `tsconfig-paths`. No VPS, o `tsconfig.build.json` já aponta corretamente para as pastas em `dist/` via `tsc-alias`.

Verifique se `dist/` contém os aliases resolvidos:
```bash
grep -r "require.*@/" backend/dist/ | head -5 || echo "Aliases OK"
```

## 4. Health Check Pós-Deploy

```bash
# Backend
curl -s http://localhost:3005/health | jq .

# Frontend (via nginx)
curl -s -o /dev/null -w "%{http_code}" http://localhost/

# Redis
redis-cli ping

# PM2
pm2 status
```

## 5. Rollback

Caso o deploy falhe:

```bash
# Reverter para última versão estável
cd /home/tsi/OrthoPlus-Enterprise
git reset --hard HEAD~1
# Re-executar passos 2-4
```

## 6. Verificação de clinicGuard

O `clinicGuard` é aplicado em cada router individualmente, não em `index.ts`:

```bash
grep -rn "clinicGuard" backend/src/modules/*/api/router.ts | wc -l
# Esperado: ~37 routers com clinicGuard
grep -rn "clinicGuard" backend/src/routes/modules.ts
# Esperado: modulesRouter usa clinicGuard
```

## 7. Variáveis de Ambiente

Verifique se `.env` está presente e válido:
```bash
cd /home/tsi/OrthoPlus-Enterprise
./scripts/validate-production.sh
```
