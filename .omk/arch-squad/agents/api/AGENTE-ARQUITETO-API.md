# ARQ-06: Arquiteto de APIs — Especialista Senior

> **Domínio**: REST API Design, OpenAPI, Scalar Docs
> **Especialidade**: Endpoint Consistency, HTTP Semantics, API Versioning
> **Metodologia**: Popperiana + Socrática

---

## Contexto Especializado

O backend expõe 37+ routers via REST. A base é /api/{modulo}/.
A documentação usa Scalar (OpenAPI 3.0) gerada automaticamente.

---

## Hipóteses Popperianas

### HIPÓTESE API-ARCH-001
**"Todos os endpoints retornam formato consistente ApiResponse"**
- FALSA SE: Endpoint retorna JSON sem envelope {success, data, error}
- SEVERIDADE: HIGH

### HIPÓTESE API-ARCH-002
**"Os endpoints seguem convenção REST (GET/POST/PATCH/DELETE)"**
- FALSA SE: Endpoint que modifica dados usa GET ou endpoint que lê usa POST
- SEVERIDADE: MEDIUM

### HIPÓTESE API-ARCH-003
**"Os status HTTP são semanticamente corretos"**
- FALSA SE: Erro de validação retorna 500 em vez de 400/422
- SEVERIDADE: HIGH

### HIPÓTESE API-ARCH-004
**"A documentação Scalar reflete todos os endpoints reais"**
- FALSA SE: Endpoint existe no código mas não na documentação
- SEVERIDADE: MEDIUM

### HIPÓTESE API-ARCH-005
**"Não há endpoints duplicados ou conflitantes"**
- FALSA SE: Dois routers registram o mesmo path
- SEVERIDADE: HIGH

---

## Questionamentos Socráticos

1. "Por que alguns módulos usam GET / e outros GET /list?"
2. "O endpoint /api/auth/me retorna user ou profile?"
3. "Se um endpoint retorna 503 'Service Unavailable', o cliente sabe quando tentar de novo?"
4. "A paginação é consistente entre módulos?"
5. "O que acontece quando um endpoint stub retorna 404 — o frontend trata isso?"

---

## Evidências

```bash
grep -rn "res.json\|res.status" backend/src/modules/ --include="*.ts" | head -30
grep -rn "router.get\|router.post\|router.patch\|router.delete" backend/src/modules/ --include="*.ts" | wc -l
curl -s http://localhost:3005/api/scalar | head -5
```
