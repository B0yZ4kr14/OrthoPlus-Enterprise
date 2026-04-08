# Playbook: Redeploy Produção Robust (Monorepo)

Este documento descreve o fluxo de deploy otimizado para o OrthoPlus Enterprise no VPS.

## 1. Fluxo de Sincronização
Utilize o `rsync` com a chave de deploy para sincronizar a estrutura monorepo completa, excluindo artefatos locais.

\`\`\`bash
rsync -avz --delete \\
  --exclude="node_modules" \\
  --exclude=".git" \\
  --exclude="dist" \\
  -e "ssh -i deploy_key" \\
  . ubuntu@100.111.74.69:/home/ubuntu/OrthoPlus-Enterprise/
\`\`\`

## 2. Fluxo de Build (Remoto)
Sempre realizar o build no VPS para garantir resolução de dependências \`workspace:*\`.

\`\`\`bash
# No VPS
npx pnpm install --no-frozen-lockfile
cd backend && npm run build
pm2 reload orthoplus-backend
# Frontend
cd ../apps/web && npm run build
sudo cp -rv dist/* /var/www/orthoplus/
\`\`\`

## 3. Resolução de Aliases (@/)
O backend utiliza \`tsconfig-paths\`. No VPS, o \`tsconfig.prod.json\` deve apontar para as pastas em \`dist/\`.

