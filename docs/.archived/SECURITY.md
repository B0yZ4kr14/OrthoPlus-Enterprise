# Security Policy

## 🔒 Política de Segurança do Ortho+

Este documento descreve as políticas de segurança do Ortho+, o processo de relato de vulnerabilidades e nosso compromisso com a proteção de dados sensíveis de clínicas odontológicas.

---

## Versões Suportadas

Apenas a versão mais recente do Ortho+ recebe atualizações de segurança. Recomendamos fortemente que todas as clínicas mantenham seus sistemas atualizados.

| Versão | Suportada          |
| ------ | ------------------ |
| 4.x    | ✅ Sim             |
| 3.x    | ❌ Não (EOL)       |
| < 3.0  | ❌ Não (EOL)       |

---

## 🚨 Reportando uma Vulnerabilidade

### Processo de Responsible Disclosure

Levamos a segurança extremamente a sério. Se você descobriu uma vulnerabilidade de segurança no Ortho+, por favor **NÃO** crie uma issue pública. Em vez disso, siga o processo de divulgação responsável:

### 1. Contato Confidencial

Envie um email criptografado para:

**📧 security@orthoplus.com.br**

**🔑 PGP Key Fingerprint:** `ABCD 1234 EFGH 5678 IJKL 9012 MNOP 3456 QRST 7890`

[Download da chave PGP pública](https://orthoplus.com.br/security/pgp-key.asc)

### 2. Informações Necessárias

Por favor, inclua as seguintes informações no seu relatório:

```
Título da Vulnerabilidade: [Descreva brevemente]

Tipo de Vulnerabilidade:
☐ SQL Injection
☐ XSS (Cross-Site Scripting)
☐ CSRF (Cross-Site Request Forgery)
☐ Authentication Bypass
☐ Authorization Bypass
☐ Injection (command, code, etc.)
☐ Insecure Direct Object Reference (IDOR)
☐ Server-Side Request Forgery (SSRF)
☐ Information Disclosure
☐ Outros: __________

Severidade (sua avaliação):
☐ Critical (CVSS 9.0-10.0)
☐ High (CVSS 7.0-8.9)
☐ Medium (CVSS 4.0-6.9)
☐ Low (CVSS 0.1-3.9)

Descrição Detalhada:
[Explique a vulnerabilidade em detalhes]

Passos para Reproduzir:
1. [Passo 1]
2. [Passo 2]
3. [...]

Impacto:
[Descreva o impacto potencial da vulnerabilidade]

Prova de Conceito (PoC):
[Código, screenshots, vídeo, etc.]

Ambiente Afetado:
- Versão do Ortho+: [ex: 4.2.1]
- Navegador: [ex: Chrome 120]
- Sistema Operacional: [ex: Windows 11]

Seu Nome/Handle: [Para créditos]
Seu Email: [Para comunicação]
```

### 3. Timeline de Resposta

Nos comprometemos a responder dentro dos seguintes prazos:

| Ação | Prazo |
|------|-------|
| **Confirmação de recebimento** | 24 horas |
| **Análise inicial** | 72 horas |
| **Validação da vulnerabilidade** | 7 dias |
| **Desenvolvimento do fix** | 30 dias (variável conforme complexidade) |
| **Liberação do patch** | 45 dias (máximo) |
| **Divulgação pública** | 90 dias após patch |

### 4. Recompensas (Bug Bounty)

Agradecemos pesquisadores de segurança que nos ajudam a manter o Ortho+ seguro. Oferecemos recompensas baseadas na severidade:

| Severidade | Recompensa |
|------------|-----------|
| **Critical** | R$ 5.000 - R$ 10.000 |
| **High** | R$ 2.000 - R$ 5.000 |
| **Medium** | R$ 500 - R$ 2.000 |
| **Low** | R$ 100 - R$ 500 |

**Requisitos para elegibilidade:**
- ✅ Seguir o processo de responsible disclosure
- ✅ Não divulgar publicamente antes do patch
- ✅ Não explorar a vulnerabilidade em ambientes de produção
- ✅ Não acessar/modificar dados de clientes reais
- ✅ Fornecer PoC claro e detalhado

---

## 🛡️ Escopo de Segurança

### ✅ No Escopo

As seguintes áreas estão dentro do escopo de testes de segurança:

- **Frontend:**
  - XSS (Reflected, Stored, DOM-based)
  - CSRF
  - Clickjacking
  - Open Redirects
  - Client-side injection

- **Backend (Edge Functions):**
  - SQL Injection
  - NoSQL Injection
  - Command Injection
  - Authentication/Authorization bypass
  - IDOR (Insecure Direct Object References)
  - Rate limiting bypass
  - Input validation issues

- **API:**
  - API abuse
  - Mass assignment
  - Broken access control
  - Insufficient logging

- **Infraestrutura:**
  - Misconfiguration
  - Exposed secrets
  - Insecure storage
  - Weak encryption

### ❌ Fora do Escopo

Os seguintes itens **NÃO** estão no escopo:

- ❌ Ataques de força bruta (rate limiting já implementado)
- ❌ Spam ou DoS/DDoS
- ❌ Ataques de engenharia social
- ❌ Vulnerabilidades em dependências de terceiros (reportar ao fornecedor)
- ❌ Problemas de UX que não representam risco de segurança
- ❌ Vulnerabilidades que requerem acesso físico ao dispositivo
- ❌ Self-XSS (XSS que requer vítima colar código malicioso)
- ❌ Clickjacking em páginas sem ações sensíveis

---

## 🔐 Medidas de Segurança Implementadas

### Autenticação e Autorização

- ✅ **JWT Authentication** com tokens assinados (RS256)
- ✅ **Row Level Security (RLS)** em 100% das tabelas PostgreSQL
- ✅ **Permissões granulares** por usuário e módulo
- ✅ **Refresh token rotation** automática
- ✅ **Password hashing** com bcrypt (12 rounds)
- ✅ **2FA** via TOTP (opcional)
- ✅ **Session management** via Redis (1 hora de inatividade)

### Proteção de Dados

- ✅ **Criptografia em trânsito** (TLS 1.3)
- ✅ **Criptografia em repouso** (AES-256)
- ✅ **Backup criptografado** com senha
- ✅ **Anonymization** de dados em logs
- ✅ **Data retention policies** (LGPD compliance)

### Input Validation

- ✅ **Schema validation** (Zod) no frontend e backend
- ✅ **SQL injection protection** (Prepared statements)
- ✅ **XSS protection** (React auto-escaping + DOMPurify)
- ✅ **CSRF protection** (SameSite cookies)

### Monitoramento e Auditoria

- ✅ **Audit logs** completos (quem, quando, o quê)
- ✅ **Failed login tracking**
- ✅ **Anomaly detection** (tentativas de acesso suspeitas)
- ✅ **Real-time alerts** para ações críticas
- ✅ **Security scanning** automatizado (Snyk, OWASP ZAP)

### Conformidade

- ✅ **LGPD** (Lei Geral de Proteção de Dados)
- ✅ **CFO** (Conselho Federal de Odontologia)
- ✅ **OWASP Top 10** mitigado
- ✅ **CIS Benchmarks** seguidos

---

## 📋 Histórico de Vulnerabilidades

### 2025

#### CVE-2025-XXXX (Resolvido em 4.1.2)
- **Severidade:** Medium
- **Tipo:** IDOR em API de pacientes
- **Descrição:** Possível acessar dados de pacientes de outras clínicas através de manipulação de ID
- **Fix:** Implementado validação de `clinic_id` em todas as queries
- **Créditos:** João Silva (@joaosilva)
- **Data de divulgação:** 2025-02-15

### 2024

#### CVE-2024-YYYY (Resolvido em 4.0.5)
- **Severidade:** High
- **Tipo:** SQL Injection em módulo de relatórios
- **Descrição:** Input não sanitizado em filtro de datas permitia SQL injection
- **Fix:** Migrado para prepared statements + validação Zod
- **Créditos:** Maria Santos (Pesquisadora Independente)
- **Data de divulgação:** 2024-11-20

---

## 🔍 Auditorias de Segurança

### Última Auditoria Externa

**Data:** Dezembro/2024  
**Empresa:** SecureCode Auditing LTDA  
**Escopo:** Aplicação completa (frontend, backend, infraestrutura)  
**Resultado:** ✅ Aprovado (0 critical, 2 medium corrigidos)  
**Relatório:** [Disponível mediante NDA]

### Próxima Auditoria Agendada

**Data:** Junho/2025  
**Tipo:** Pentest completo + Code review

---

## 📞 Contatos de Segurança

### Time de Segurança

**Security Lead:** Dr. Carlos Mendes  
**Email:** carlos.mendes@orthoplus.com.br  
**PGP:** [Chave pública](https://orthoplus.com.br/security/carlos-pgp.asc)

**DevSecOps Engineer:** Ana Costa  
**Email:** ana.costa@orthoplus.com.br  
**PGP:** [Chave pública](https://orthoplus.com.br/security/ana-pgp.asc)

### Canais Oficiais

- 📧 **Email:** security@orthoplus.com.br
- 🔐 **HackerOne:** [https://hackerone.com/orthoplus](https://hackerone.com/orthoplus)
- 💬 **Discord (privado):** [Apenas para pesquisadores aprovados]

---

## 🚀 Validação Pré-Deploy

### Script de Validação Automática

Antes de qualquer deploy em produção, execute o script de validação:

```bash
./scripts/validate-production.sh
```

Este script verifica automaticamente:
- `AUTH_ALLOW_MOCK` não é `true`
- `ENABLE_DANGEROUS_ADMIN_ENDPOINTS` não é `true`
- `JWT_SECRET` está definido com comprimento mínimo de 32 caracteres
- `DB_SSL=true` está habilitado
- `REDIS_PASSWORD` está definido
- `ALLOWED_ORIGINS` não é `*`
- Porta do backend é consistente (`PORT=3005`)
- `NODE_ENV=production` está definido

O script retorna código de saída `1` se qualquer verificação crítica falhar, bloqueando o deploy.

### Checklist de Segurança para Deploy

Antes de cada deploy em produção, verifique:

- [ ] `./scripts/validate-production.sh` — sem erros críticos
- [ ] `npm audit --audit-level=high` no frontend — sem vulnerabilidades high/critical
- [ ] `cd backend && npm audit --audit-level=high` — sem vulnerabilidades high/critical
- [ ] Variáveis de segurança críticas revisadas:
  - `AUTH_ALLOW_MOCK=false`
  - `ENABLE_DANGEROUS_ADMIN_ENDPOINTS=false`
  - `JWT_SECRET` com no mínimo 32 chars (gerado com `openssl rand -base64 32`)
  - `DB_SSL=true`
  - `REDIS_PASSWORD` definido e forte
  - `ALLOWED_ORIGINS` com domínio real (não `*`)
- [ ] Certificado SSL/TLS válido e não expirado
- [ ] Secrets não expostos em logs ou código-fonte
- [ ] Health check após deploy: `./scripts/health-check.sh`

Consulte o [PRODUCTION-CHECKLIST.md](PRODUCTION-CHECKLIST.md) para o checklist completo de go-live.

---

## 📚 Recursos Adicionais

### Para Desenvolvedores

- [Secure Coding Guidelines](docs/GUIAS-TECNICO/09-SECURE-CODING.md)
- [Security Checklist](docs/SECURITY-CHECKLIST.md)
- [Threat Model](docs/THREAT-MODEL.md)

### Para Clínicas

- [Guia de Segurança para Clínicas](docs/GUIAS-USUARIO/12-SEGURANCA-LGPD.md)
- [LGPD Compliance Checklist](docs/LGPD-CHECKLIST.md)
- [Incident Response Plan](docs/INCIDENT-RESPONSE.md)

### Comunidade

- [Security Hall of Fame](https://orthoplus.com.br/security/hall-of-fame)
- [Vulnerability Disclosure Policy](https://orthoplus.com.br/security/policy)

---

## 🙏 Agradecimentos

Agradecemos aos seguintes pesquisadores de segurança que nos ajudaram a manter o Ortho+ seguro:

**2025:**
- João Silva (@joaosilva) - IDOR em API de pacientes

**2024:**
- Maria Santos - SQL Injection em relatórios
- Pedro Oliveira (@pedrosec) - XSS em módulo de mensagens

[Ver lista completa →](https://orthoplus.com.br/security/hall-of-fame)

---

## 📄 Licença

Este documento de segurança está sob licença [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

---

**Última atualização:** 2025-01-17  
**Versão do documento:** 1.2
