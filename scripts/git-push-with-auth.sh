#!/bin/bash
# Script para push com autenticação GitHub
# Uso: ./scripts/git-push-with-auth.sh [TOKEN]

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  OrthoPlus Git Push with Auth${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Verificar se estamos no diretório correto
if [ ! -d ".git" ]; then
    echo -e "${RED}Erro: Não estamos em um repositório Git${NC}"
    exit 1
fi

# Branch atual
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${BLUE}Branch atual:${NC} $CURRENT_BRANCH"

# Verificar se há commits para push
if git diff --quiet HEAD origin/$CURRENT_BRANCH 2>/dev/null; then
    echo -e "${YELLOW}Não há commits para push${NC}"
    exit 0
fi

# Configurar URL com token se fornecido
if [ -n "$1" ]; then
    TOKEN="$1"
    echo -e "${BLUE}Configurando remote com token...${NC}"
    git remote set-url origin "https://${TOKEN}@github.com/B0yZ4kr14/OrthoPlus-Enterprise.git"
    echo -e "${GREEN}✓ Remote configurado${NC}"
fi

# Adicionar arquivos não rastreados
echo -e "${BLUE}Adicionando novos arquivos...${NC}"
git add -A

# Verificar se há mudanças para commit
if git diff --cached --quiet; then
    echo -e "${YELLOW}Nenhuma mudança para commit${NC}"
else
    # Commit
    echo -e "${BLUE}Criando commit...${NC}"
    git commit -m "chore: add validation reports and prisma baseline

- Add PROMPT-KIMI-VALIDATION.md for OpenSquad orchestration
- Add Prisma baseline migration for existing database
- Add validation reports from complete system check

Refs: priority-fixes squad"
    echo -e "${GREEN}✓ Commit criado${NC}"
fi

# Push
echo -e "${BLUE}Executando push...${NC}"
if git push origin $CURRENT_BRANCH; then
    echo -e "${GREEN}✓ Push realizado com sucesso!${NC}"
else
    echo -e "${RED}✗ Falha no push${NC}"
    echo -e "${YELLOW}Dica: Configure um token GitHub e execute:${NC}"
    echo -e "  ./scripts/git-push-with-auth.sh ghp_<REMOVED>"
    exit 1
fi

# Restaurar URL original (sem token)
if [ -n "$1" ]; then
    git remote set-url origin "https://github.com/B0yZ4kr14/OrthoPlus-Enterprise.git"
    echo -e "${GREEN}✓ URL original restaurada${NC}"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Push concluído!${NC}"
echo -e "${GREEN}========================================${NC}"
