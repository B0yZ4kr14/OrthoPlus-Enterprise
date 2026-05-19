/**
 * Seed script for wiki_pages table
 * Populates /admin/wiki with content from docs/WIKI.md
 * Run: npx tsx backend/scripts/seed-wiki-pages.ts
 */
import { prisma } from "../src/infrastructure/database/prismaClient";

const WIKI_SEED_DATA = [
  {
    title: "1. DevOps / SRE",
    slug: "devops-sre",
    category: "devops",
    content: `# 1. DevOps / SRE

## 1.1 Visao Geral do Pipeline

O OrthoPlus Enterprise suporta 6 estrategias de deploy. Prioridade de consolidacao: unificar para 2 arquivos (dev + prod).

## 1.2 Docker Compose

**Stack local completa:**\n\`\`\`bash\ndocker compose up -d\n\`\`\`

Servicos: frontend (8083), backend (3005), postgres (16), redis (7), nginx, prometheus, grafana (3000).

> **Conflito:** Grafana na porta 3000 conflita com Vite dev server.

## 1.3 Scripts de Deploy

| Script | Proposito |
|---|---|
| \`deploy-orthoplus-full.sh\` | Build local + rsync + PM2 reload |
| \`deploy-vps.sh\` | Rsync + build no servidor |
| \`deploy-prod.sh\` | Docker Compose producao |
| \`deploy-ubuntu.sh\` | Bootstrap Ubuntu Server |
| \`validate-production.sh\` | Validacao de env vars (pre-deploy) |
| \`health-check.sh\` | Verifica stack (pos-deploy) |

> **RISCO CRITICO:** \`deploy-orthoplus-full.sh\` contem \`prisma db push --accept-data-loss\` como fallback. **Remover imediatamente**.

## 1.4 CI/CD — GitHub Actions (15 workflows)

## 1.5 Nginx

Configuracao hardened: TLS 1.2/1.3, rate limiting, CSP, HSTS, OCSP stapling.

## 1.6 Variaveis de Ambiente Criticas

| Variavel | Obrig | Descricao |
|---|---|---|
| \`DATABASE_URL\` | Sim | PostgreSQL connection string |
| \`JWT_SECRET\` | Sim | Chave JWT (min. 256 bits) |
| \`REDIS_URL\` | Sim | Redis connection string |
| \`NODE_ENV\` | Sim | development / production |
| \`FRONTEND_URL\` | Sim | URL publica |
| \`ALLOWED_ORIGINS\` | Sim | CORS whitelist |
| \`DB_SSL\` | Producao | true em producao |
| \`ENABLE_MOCK_AUTH\` | Nao | **Proibido em producao** |
| \`ENABLE_DANGEROUS_ADMIN\` | Nao | **Proibido em producao** |

## 1.7 Checklist Pre-Deploy

- [ ] \`validate-production.sh\` passa
- [ ] \`pnpm build\` passa no root
- [ ] \`pnpm test\` passa
- [ ] \`pnpm lint\` passa
- [ ] Nenhuma credencial no codigo
- [ ] \`.env\` nao commitado
- [ ] \`clinicGuard\` em novos routers
- [ ] Backup executado

## 1.8 Gaps Criticos DevOps (Prioridade)

| Prioridade | Gap | Acao |
|---|---|---|
| **CRITICO** | README-orthoplus-deploy.md expoe IPs/credenciais | Sanitizar |
| **CRITICO** | \`db push --accept-data-loss\` em deploy | Remover |
| **CRITICO** | docker-compose.ubuntu.yml DATABASE_URL hardcoded | Usar variaveis |
| **CRITICO** | Redis onprem sem senha | Adicionar --requirepass |
| **ALTO** | Agent Service ausente dos compose | Adicionar servico Python |
| **ALTO** | 4 compose com configs divergentes | Consolidar para 2 |
| **ALTO** | Workflows de deploy duplicados | Remover duplicata |
| **ALTO** | SSL expira em breve | Renovar |`,
    is_published: true,
    tags: ["devops", "deploy", "docker", "ci-cd"],
    version: 1,
  },
  {
    title: "2. Administradores",
    slug: "administradores",
    category: "admin",
    content: `# 2. Administradores

## 2.1 Primeiro Acesso e Setup

1. Acesse a URL de producao
2. Login com credenciais de admin
3. **Configuracoes -> Clinica** — configure a clinica principal
4. **Configuracoes -> Dentistas** — cadastre os dentistas
5. **Configuracoes -> Agenda** — horarios de atendimento
6. Importe pacientes via CSV

## 2.2 Multi-Tenancy por clinic_id

Cada clinica tem um UUID unico. Todo dado esta vinculado a esse ID. O middleware \`clinicGuard\` garante isolamento.

## 2.3 Matriz de Permissoes (RBAC)

| Papel | Acesso |
|---|---|
| **Superadmin** | Todas as clinicas, todas as funcoes |
| **Admin de Clinica** | Configuracoes, relatorios, gestao de usuarios |
| **Dentista** | Agenda, PEP, orcamentos, procedimentos |
| **Recepcionista** | Agenda, pacientes, orcamentos (somente visualizar) |
| **Auxiliar** | Agenda, estoque (limitado) |
| **Financeiro** | Contas a pagar/receber, conciliacao, relatorios |

## 2.4 Backup e Recuperacao

**Automatico:** Cron no servidor, retencao 7 dias, local \`/opt/orthoplus/backups/\`.

**Manual:**\n\`\`\`bash\ncd backend\npnpm prisma db execute --file backup.sql\n\`\`\`

**Restauracao:**\n\`\`\`bash\ndocker exec -i orthoplus-postgres psql -U orthoplus < backup.sql\n\`\`\`

## 2.5 LGPD e Compliance

- **Logs de auditoria:** Schema \`audit\` registra acoes sensiveis
- **Consentimento:** Anamnese inclui termo de consentimento
- **Anonimizacao:** Endpoint para exclusao de dados
- **Exportacao:** Pacientes podem solicitar copia dos dados

## 2.6 Troubleshooting Comum

| Problema | Causa | Solucao |
|---|---|---|
| Erro 401 | JWT expirado | Logout/login |
| Erro 403 | clinicId ausente | Verificar cadastro |
| Agenda nao carrega | Cache | Ctrl+Shift+R |
| Orcamento nao salva | Paciente nao selecionado | Selecionar paciente |
| Imagens nao aparecem | MinIO URL errada | Verificar S3_ENDPOINT |
| E-mails nao enviam | SMTP nao configurado | Verificar SMTP no .env |`,
    is_published: true,
    tags: ["admin", "rbac", "backup", "lgpd"],
    version: 1,
  },
  {
    title: "3. Dentistas",
    slug: "dentistas",
    category: "clinical",
    content: `# 3. Dentistas

## 3.1 Acesso ao Sistema

Login -> Dashboard -> selecione seu modulo.

## 3.2 Agenda

- **Visualizacoes:** Dia, semana, mes, lista
- **Criar consulta:** Click no horario -> paciente -> tipo
- **Bloqueios:** Click direito -> "Bloquear"
- **Recorrencia:** Semanal, mensal
- **Confirmacoes:** Sistema envia lembrete automatico

## 3.3 Pacientes — PEP

- **Anamnese:** Formularios personalizaveis
- **Odontograma:** Visualizacao SVG com marcacoes
- **Imagens:** Upload de radiografias, fotos (DICOM suportado)
- **Procedimentos:** Vinculados a consultas
- **Prescricoes:** Geracao de receitas

## 3.4 Orcamentos

- **Status:** RASCUNHO -> PENDENTE -> APROVADO/REJEITADO
- **Envio:** Por e-mail/WhatsApp
- **Aprovar:** Paciente aprova via link

## 3.5 Dicas

- \`Ctrl + K\` — Busca global
- \`Ctrl + Shift + A\` — Nova consulta rapida
- Favorite pacientes com estrela`,
    is_published: true,
    tags: ["dentista", "pep", "odontograma", "orcamento"],
    version: 1,
  },
  {
    title: "4. Recepcionistas",
    slug: "recepcionistas",
    category: "clinical",
    content: `# 4. Recepcionistas

## 4.1 Agenda — Gerenciamento Diario

- Visualize agenda de todos os dentistas
- Marque, remarque e cancele consultas
- Gerencie confirmacoes e faltas
- Bloqueie horarios para reunioes

## 4.2 Pacientes

- **Cadastro rapido:** Nome, telefone, CPF, nascimento
- **Busca avancada:** Por nome, CPF, telefone, ultima visita
- **Importacao:** CSV para migracao

## 4.3 Fila de Espera

- Pacientes sem horario na fila
- Ordenacao por prioridade
- Notificacao automatica em desistencias

## 4.4 Comunicacao

- Envie lembretes (SMS/e-mail)
- Confirme consultas
- Registre observacoes no prontuario`,
    is_published: true,
    tags: ["recepcionista", "agenda", "pacientes", "fila"],
    version: 1,
  },
  {
    title: "5. Auxiliares",
    slug: "auxiliares",
    category: "clinical",
    content: `# 5. Auxiliares

## 5.1 Estoque

- Consulte disponibilidade
- Registre consumo em procedimentos
- Receba alertas de estoque baixo

## 5.2 Preparo de Sala

- Checklist de materiais
- Esterilizacao de instrumentos
- Registro de limpeza

## 5.3 Auxilio em Procedimentos

- Acesse PEP durante consulta
- Registre materiais utilizados
- Anote observacoes do dentista`,
    is_published: true,
    tags: ["auxiliar", "estoque", "procedimentos"],
    version: 1,
  },
  {
    title: "6. Gestores Financeiros",
    slug: "gestores-financeiros",
    category: "finance",
    content: `# 6. Gestores Financeiros

## 6.1 Contas a Receber

- Parcelas de orcamentos aprovados
- Controle de pagamentos parciais
- Inadimplencia e cobranca

## 6.2 Contas a Pagar

- Despesas da clinica
- Controle de vencimentos
- Programacao de pagamentos

## 6.3 Conciliacao Bancaria

- Importacao de extratos (OFX, CSV)
- Match automatico
- Identificacao de divergencias

## 6.4 Caixa / PDV

- Registro de entradas/saidas diarias
- Fechamento de caixa

## 6.5 Relatorios

- Faturamento por periodo/dentista/procedimento
- DRE e Fluxo de caixa`,
    is_published: true,
    tags: ["financeiro", "caixa", "relatorios"],
    version: 1,
  },
];

async function seedWikiPages() {
  console.log("Starting wiki pages seed...");

  // Default clinic_id for seed (adjust as needed)
  const clinicId = process.env.SEED_CLINIC_ID || "default-clinic";
  const createdBy = process.env.SEED_USER_ID || "system-seed";

  for (const page of WIKI_SEED_DATA) {
    const existing = await prisma.wiki_pages.findFirst({
      where: { slug: page.slug, clinic_id: clinicId },
    });

    if (existing) {
      console.log(`Wiki page "${page.title}" already exists, skipping.`);
      continue;
    }

    await prisma.wiki_pages.create({
      data: {
        ...page,
        clinic_id: clinicId,
        created_by: createdBy,
      },
    });
    console.log(`Created wiki page: ${page.title}`);
  }

  console.log("Wiki seed completed.");
}

seedWikiPages()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
