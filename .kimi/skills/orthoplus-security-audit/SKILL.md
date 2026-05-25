---
name: orthoplus-security-audit
description: OrthoPlus Enterprise — Security Audit skill para detecção de secrets, tokens em localStorage, e vulnerabilidades.
metadata:
  author: OrthoPlus AI Team
  scope: project
---

# OrthoPlus Security Audit

Skill customizada para auditoria de segurança no projeto OrthoPlus Enterprise.

## Commands

### /security.audit
Executa `scripts/speckit-security-audit.sh` para detectar:
- Secrets hardcoded no código
- Tokens em localStorage (XSS risk)
- eval() e innerHTML perigosos
- Console.log em produção
- Auth checks desabilitados

### /security.tokens
Verifica especificamente uso de localStorage para tokens de autenticação.

## Rules

- Security audit DEVE passar antes de release
- Violations CRITICAL bloqueiam merge imediatamente
- localStorage NUNCA deve armazenar tokens (HttpOnly cookies only)
