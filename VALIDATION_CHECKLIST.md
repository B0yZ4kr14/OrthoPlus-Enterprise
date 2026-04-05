# Validation Checklist - Antigravity

> Checklist para validar o ambiente antes de começar as correções

---

## ✅ Checklist de Ambiente Local

### Repositório

- [ ] Código está em `~/Projects/OrthoPlus-Enterprise/`
- [ ] Branch correta (normalmente `main`)
- [ ] Pull realizado (`git pull origin main`)

### Backend (Node.js)

- [ ] Node.js 20+ instalado (`node --version`)
- [ ] Dependências instaladas (`npm ci`)
- [ ] `.env` configurado
- [ ] Database acessível
- [ ] Redis rodando

```bash
cd backend
npm run dev
# Verificar: http://localhost:3005/health
```

### Agno Agent Service (Python)

- [ ] Python 3.14+ instalado
- [ ] venv criado e ativado
- [ ] Dependências instaladas (`pip install -r requirements.txt`)
- [ ] `.env` configurado com API keys
- [ ] Model Router funcionando

```bash
cd agent-service
source venv/bin/activate
python src/main.py
# Verificar: http://localhost:8000/health
```

### Frontend (React)

- [ ] Node.js 20+ instalado
- [ ] Dependências instaladas (`npm ci`)
- [ ] Build funciona (`npm run build`)

```bash
cd apps/web
npm run dev
# Verificar: http://localhost:5173
```

---

## ✅ Checklist de API Keys

### Gemini (Google AI Studio)

- [ ] `GOOGLE_API_KEY` configurado em `.env`
- [ ] API key é válida (começa com `AIzaSy`)
- [ ] Quota disponível (não excedida)

Teste:
```bash
cd agent-service
source venv/bin/activate
python -c "from src.config import GOOGLE_API_KEY; print('OK:', bool(GOOGLE_API_KEY))"
```

### OpenRouter

- [ ] `OPENROUTER_API_KEY` configurado em `.env`
- [ ] API key é válida (começa com `sk-or-v1`)
- [ ] Créditos disponíveis (se não for plano gratuito)

---

## ✅ Checklist de Integração

### Model Router

- [ ] Router identifica ambos os providers
- [ ] Fallback funciona quando Gemini falha

Teste:
```bash
cd agent-service
source venv/bin/activate
python -c "
from src.models.model_router import get_model_router
router = get_model_router()
status = router.get_status()
print(f'Providers: {status[\"available_providers\"]}/{status[\"total_providers\"]}')
for p in status['providers']:
    print(f'  - {p[\"name\"]}: {\"✅\" if p[\"available\"] else \"❌\"}')
"
```

### Backend ↔ Agent Service

- [ ] Backend consegue chamar Agent Service
- [ ] Endpoints `/api/agents/*` respondem

Teste:
```bash
# Com ambos os serviços rodando:
curl http://localhost:3005/api/agents/health
```

---

## ✅ Checklist de VPS (se aplicável)

### Acesso

- [ ] SSH funcionando
- [ ] Usuário `orthoplus` existe
- [ ] Permissões corretas em `/var/www/orthoplus/`

### Serviços

- [ ] PostgreSQL rodando
- [ ] Redis rodando
- [ ] Nginx rodando
- [ ] Backend (PM2) rodando
- [ ] Agent Service (systemd) rodando

```bash
# Na VPS:
sudo systemctl status postgresql
sudo systemctl status redis
sudo systemctl status nginx
pm2 status
sudo systemctl status orthoplus-agent
```

### Health Checks

- [ ] `https://your-domain.com/health` responde
- [ ] `https://your-domain.com/api/agents/health` responde

---

## ✅ Checklist de Logs

### Sem Erros Críticos

- [ ] Backend logs sem erros de conexão
- [ ] Agent Service logs sem erros de API key
- [ ] Nginx error log vazio ou só warnings

```bash
# Backend
pm2 logs orthoplus-backend --lines 50

# Agent Service
sudo journalctl -u orthoplus-agent -n 50

# Nginx
sudo tail -n 50 /var/log/nginx/error.log
```

---

## ✅ Checklist de Documentação

### Obsidian Vault

- [ ] Vault acessível em `~/Documents/ObsidianVault/`
- [ ] Documentações sincronizadas
- [ ] Índice atualizado (`00-INDEX.md`)

### Prompts

- [ ] Prompts em `~/.config/Antigravity/.../prompts/`
- [ ] `init.md` atualizado
- [ ] `agno-assistant.md` disponível
- [ ] `orthoplus-developer.md` disponível
- [ ] `deploy-assistant.md` disponível

### Skills

- [ ] `agno-framework/SKILL.md` em `~/.agents/skills/`
- [ ] `agno-agent-service/SKILL.md` em `~/.agents/skills/`

---

## 🚀 Ready to Go!

Se todos os checkboxes acima estiverem marcados:

1. ✅ Ambiente pronto para desenvolvimento
2. ✅ Serviços rodando corretamente
3. ✅ Integrações funcionando
4. ✅ Documentações disponíveis

**Próximos passos:**
1. Escolher tarefa do `current-state.md`
2. Atualizar `current-state.md` ao terminar
3. Sincronizar documentações no Obsidian Vault

---

## 🐛 Se Algo Falhar

### Gemini API Key Inválida

```bash
# Verificar
python -c "from src.config import GOOGLE_API_KEY; print(GOOGLE_API_KEY[:20])"

# Obter nova em: https://aistudio.google.com/app/apikey
```

### Backend Não Conecta ao Agent Service

```bash
# Verificar variável
head backend/.env | grep AGENT_SERVICE_URL

# Deve ser: http://localhost:8000 (local) ou http://localhost:8000 (VPS)
```

### Agent Service Não Encontra Providers

```bash
# Verificar API keys
cat agent-service/.env | grep -E '(GOOGLE|OPENROUTER)'

# Recarregar router
python -c "
from src.models.model_router import get_model_router
router = get_model_router()
print(router.get_status())
"
```

---

*Validation Checklist - v1.0*  
*Updated: 2026-04-03*
