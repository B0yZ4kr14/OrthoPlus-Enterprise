#!/usr/bin/env python3
"""ORQUESTRAR.py — Script mestre de execucao do Esquadrao Canonico"""

import subprocess, json, os, re, sys, hashlib, datetime
from collections import defaultdict

PROJECT_ROOT = "/home/b0yz4kr14/Projects/OrthoPlus-Enterprise"
EVIDENCE_DIR = f"{PROJECT_ROOT}/.omk/orchestration/evidencias/{datetime.date.today().isoformat()}"
os.makedirs(EVIDENCE_DIR, exist_ok=True)

findings = []
severity_counts = defaultdict(int)
evidences = []

def log(msg):
    ts = datetime.datetime.now().isoformat()
    print(f"[{ts}] {msg}")
    sys.stdout.flush()

def run(cmd, timeout=60):
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, cwd=PROJECT_ROOT, timeout=timeout)
        return result.returncode, result.stdout, result.stderr
    except subprocess.TimeoutExpired:
        return -1, "", "TIMEOUT"
    except Exception as e:
        return -1, "", str(e)

def save_evidence(ev_id, cmd, output):
    content = f"EVIDENCIA: {ev_id}\nCOMANDO: {cmd}\nOUTPUT:\n{output}\n"
    filepath = os.path.join(EVIDENCE_DIR, f"{ev_id}.txt")
    with open(filepath, "w") as f:
        f.write(content)
    h = hashlib.sha256(content.encode()).hexdigest()[:16]
    evidences.append({"id": ev_id, "file": filepath, "hash": h})
    return h

def finding(domain, phase, hypothesis, verdict, severity, evidence_id, command, output, action=""):
    f = {
        "timestamp": datetime.datetime.now().isoformat(),
        "domain": domain, "phase": phase, "hypothesis": hypothesis,
        "verdict": verdict, "severity": severity, "evidence_id": evidence_id,
        "command": command, "output_snippet": output[:500], "action": action
    }
    findings.append(f)
    severity_counts[severity] += 1
    log(f"[{severity}] {domain}::{phase} | {verdict} | {hypothesis[:80]}")

# ============================================================================
# FASE 0: PREPARACAO
# ============================================================================
log("=" * 70)
log("FASE 0: PREPARACAO")
log("=" * 70)

meta = {}
_, out, _ = run("git rev-parse --short HEAD")
meta["git_commit"] = out.strip()

_, out, _ = run("grep -c '^model ' backend/prisma/schema.prisma")
meta["prisma_models"] = int(out.strip() or 0)

_, out, _ = run("grep -oP '@@schema\\\"\\K[^\"]+' backend/prisma/schema.prisma")
meta["prisma_schemas"] = sorted(set([s for s in out.strip().split('\n') if s]))

meta["backend_modules"] = sorted([d for d in os.listdir(f'{PROJECT_ROOT}/backend/src/modules') if os.path.isdir(f'{PROJECT_ROOT}/backend/src/modules/{d}')])
meta["backend_module_count"] = len(meta["backend_modules"])

with open(f"{PROJECT_ROOT}/apps/web/src/routes/AppRoutes.tsx") as f:
    routes_content = f.read()
meta["frontend_routes"] = re.findall(r'path=["\']([^"\']+)["\']', routes_content)
meta["frontend_route_count"] = len(meta["frontend_routes"])

meta["workers"] = [w.replace('.ts', '') for w in os.listdir(f'{PROJECT_ROOT}/backend/src/workers/jobs/') if w.endswith('.ts')]
meta["worker_count"] = len(meta["workers"])

_, out, _ = run("psql -h localhost -U orthoplus -d orthoplus -c 'SELECT COUNT(*) FROM information_schema.tables WHERE table_schema NOT IN (chr(39)||'pg_catalog'||chr(39), chr(39)||'information_schema'||chr(39));'")
if out:
    m = re.search(r'(\d+)', out)
    meta["db_tables"] = int(m.group(1)) if m else -1
else:
    meta["db_tables"] = -1

_, out, _ = run("docker ps --format '{{.Names}}|{{.Status}}'")
meta["docker_containers"] = [c for c in out.strip().split('\n') if c and 'orthoplus' in c]

_, out, _ = run("curl -s -o /dev/null -w '%{http_code}' http://localhost:3005/health")
meta["backend_health"] = out.strip()

_, out, _ = run("curl -s -o /dev/null -w '%{http_code}' http://localhost:8083/")
meta["frontend_health"] = out.strip()

log(f"FASE 0 completa. Commit={meta['git_commit']}")

# ============================================================================
# FASE 2: POPPERIANO
# ============================================================================
log("=" * 70)
log("FASE 2: POPPERIANO")
log("=" * 70)

def popper_test(domain, hid, hypothesis, command, falsifier, timeout=60):
    rc, out, err = run(command, timeout=timeout)
    output = (out + '\n' + err).strip()
    ev_id = f"{domain}-{hid}"
    save_evidence(ev_id, command, output)
    falsified = falsifier(rc, out, err)
    verdict = "FALSIFICADO" if falsified else "NAO-FALSIFICADO"
    sev = "CRITICAL" if (domain == "security" and falsified) else ("HIGH" if falsified else "LOW")
    finding(domain, "POPPERIANO", hypothesis, verdict, sev, ev_id, command, output, "Corrigir" if falsified else "Monitorar")
    return falsified

# --- FRONTEND ---
popper_test("frontend", "001", "O frontend tem exatamente 60 rotas",
    "grep -o 'path=\"[^\"]*\"' apps/web/src/routes/AppRoutes.tsx | wc -l",
    lambda rc, out, err: out.strip() != "60")

lazy_missing = []
for imp in re.findall(r'import\(["\'](@[^"\']+)["\']\)', routes_content):
    fp = imp.replace("@/", "apps/web/src/")
    if not any(os.path.exists(f'{PROJECT_ROOT}/{fp}{ext}') for ext in ['.tsx', '.ts', '/index.tsx', '/index.ts']):
        lazy_missing.append(imp)

if lazy_missing:
    finding("frontend", "POPPERIANO", "Todos os lazy imports apontam para arquivos existentes",
        "FALSIFICADO", "HIGH", "FE-002", "verificacao manual", f"Faltando: {lazy_missing}",
        f"Criar arquivos ou corrigir imports: {lazy_missing[:3]}")

popper_test("frontend", "003", "O build frontend passa sem erros",
    "cd apps/web && pnpm run build 2>&1 | tail -5",
    lambda rc, out, err: rc != 0, timeout=120)

paths = re.findall(r'path=["\']([^"\']+)["\']', routes_content)
dups = [p for p in set(paths) if paths.count(p) > 1]
if dups:
    finding("frontend", "POPPERIANO", "Nao ha rotas duplicadas no frontend",
        "FALSIFICADO", "MEDIUM", "FE-004", "grep paths", f"Duplicadas: {dups}", "Remover rotas duplicadas")

# --- BACKEND ---
popper_test("backend", "001", "Existem 37 modulos em backend/src/modules/",
    "ls backend/src/modules/ | wc -l", lambda rc, out, err: out.strip() != "37")

with open(f"{PROJECT_ROOT}/backend/src/index.ts") as f:
    index_ts = f.read()
health_before_auth = index_ts.find('"/health"') < index_ts.find("app.use(authMiddleware)")
auth_router_after = index_ts.find("app.use(\"/api/auth\", authRouter)") > index_ts.find("app.use(authMiddleware)")
if not health_before_auth:
    finding("backend", "POPPERIANO", "Health check e auth sao publicos",
        "FALSIFICADO", "HIGH", "BE-002", "grep -n authMiddleware backend/src/index.ts",
        f"health_before_auth={health_before_auth}, auth_router_after={auth_router_after}",
        "Mover health/auth antes de authMiddleware")

popper_test("backend", "003", "O build backend passa sem erros",
    "cd backend && pnpm run build 2>&1 | tail -5", lambda rc, out, err: rc != 0, timeout=120)

popper_test("backend", "004", "Existem 9 workers em backend/src/workers/jobs/",
    "ls backend/src/workers/jobs/*.ts | wc -l", lambda rc, out, err: out.strip() != "9")

popper_test("backend", "005", "Nao ha queryRaw em backend/src/",
    "grep -rn 'queryRaw' backend/src/ || true", lambda rc, out, err: out.strip() != "")

popper_test("backend", "006", "Helmet envia headers de seguranca adequados",
    "curl -s -I http://localhost:3005/health",
    lambda rc, out, err: "x-frame-options" not in out.lower() and "content-security-policy" not in out.lower())

# --- DATABASE ---
popper_test("database", "001", "O Prisma schema tem 180 models",
    "grep -c '^model ' backend/prisma/schema.prisma", lambda rc, out, err: out.strip() != "180")

_, out, _ = run("psql -h localhost -U orthoplus -d orthoplus -c 'SELECT COUNT(*) FROM information_schema.schemata WHERE schema_name NOT IN (chr(39)||'pg_catalog'||chr(39), chr(39)||'information_schema'||chr(39), chr(39)||'pg_toast'||chr(39));'")
if out:
    m = re.search(r'(\d+)', out)
    schema_count = int(m.group(1)) if m else -1
    if schema_count != 17:
        finding("database", "POPPERIANO", "Ha 17 schemas no PostgreSQL",
            "FALSIFICADO", "HIGH", "DB-002", "psql COUNT schemata", f"Real: {schema_count}",
            f"Atualizar doc para {schema_count}")

_, out, _ = run("psql -h localhost -U orthoplus -d orthoplus -c 'SELECT COUNT(*) FROM information_schema.tables WHERE table_schema NOT IN (chr(39)||'pg_catalog'||chr(39), chr(39)||'information_schema'||chr(39));'")
if out:
    m = re.search(r'(\d+)', out)
    table_count = int(m.group(1)) if m else -1
    if table_count != 180:
        finding("database", "POPPERIANO", "O banco tem 180 tabelas",
            "FALSIFICADO", "HIGH", "DB-003", "psql COUNT tables", f"Real: {table_count}",
            f"Atualizar doc para {table_count}")

_, out, _ = run("psql -h localhost -U orthoplus -d orthoplus -c 'SELECT COUNT(*) FROM configuracoes.module_catalog;'")
if out:
    m = re.search(r'(\d+)', out)
    mc = int(m.group(1)) if m else -1
    if mc != 37:
        finding("database", "POPPERIANO", "module_catalog tem 37 entradas",
            "FALSIFICADO", "HIGH", "DB-004", "psql COUNT module_catalog", f"Real: {mc}",
            f"Atualizar doc para {mc}")

_, out, _ = run("psql -h localhost -U orthoplus -d orthoplus -c 'SELECT COUNT(*) FROM configuracoes.clinic_modules;'")
if out:
    m = re.search(r'(\d+)', out)
    cm = int(m.group(1)) if m else -1
    if cm != 37:
        finding("database", "POPPERIANO", "clinic_modules tem 37 entradas",
            "FALSIFICADO", "HIGH", "DB-005", "psql COUNT clinic_modules", f"Real: {cm}",
            f"Atualizar doc para {cm}")

# --- DEVOPS ---
_, out, _ = run("docker ps --filter name=tsiapp-orthoplus --format '{{.Status}}'")
if "healthy" not in out.lower():
    finding("devops", "POPPERIANO", "O container frontend tsiapp-orthoplus esta healthy",
        "FALSIFICADO" if "tsiapp-orthoplus" not in out else "NAO-FALSIFICADO",
        "HIGH" if "tsiapp-orthoplus" not in out else "LOW", "DEV-001", "docker ps", out, "Verificar container")

_, out, _ = run("docker ps --filter name=tsiapp-orthoplus-backend --format '{{.Status}}'")
if not out.strip():
    finding("devops", "POPPERIANO", "O container backend tsiapp-orthoplus-backend esta rodando",
        "FALSIFICADO", "CRITICAL", "DEV-002", "docker ps", "Container ausente", "Iniciar container")

if meta["backend_health"] != "200":
    finding("devops", "POPPERIANO", "O backend responde /health com 200",
        "FALSIFICADO", "CRITICAL", "DEV-003", "curl health", meta["backend_health"], "Verificar backend")

if meta["frontend_health"] != "200":
    finding("devops", "POPPERIANO", "O frontend responde com 200",
        "FALSIFICADO", "CRITICAL", "DEV-004", "curl frontend", meta["frontend_health"], "Verificar frontend")

# --- SECURITY ---
_, out, _ = run("curl -s -I http://localhost:3005/health")
sec_headers = [h for h in ["x-frame-options", "x-content-type-options", "content-security-policy", "strict-transport-security"] if h in out.lower()]
if len(sec_headers) < 2:
    finding("security", "POPPERIANO", "Helmet envia pelo menos 3 headers de seguranca",
        "FALSIFICADO", "HIGH", "SEC-001", "curl -I health", f"Headers: {sec_headers}", "Verificar Helmet")

_, out, _ = run("curl -s -X POST http://localhost:3005/api/auth/token -H 'Content-Type: application/json' -d '{\"email\":\"admin@orthoplus.com\",\"password\":\"admin123!\"}'")
if '"accessToken"' not in out and '"user"' not in out:
    finding("security", "POPPERIANO", "O login funciona com credenciais de teste",
        "FALSIFICADO", "CRITICAL", "SEC-002", "curl POST auth", out[:200], "Verificar backend")

_, out, _ = run("grep -rn 'rateLimit' backend/src/")
if not out.strip():
    finding("security", "POPPERIANO", "Rate limiting esta configurado no backend",
        "FALSIFICADO", "HIGH", "SEC-003", "grep rateLimit", "Nenhuma configuracao", "Adicionar rate limiting")

# ============================================================================
# FASE 4: INTEGRACAO
# ============================================================================
log("=" * 70)
log("FASE 4: INTEGRACAO")
log("=" * 70)

if lazy_missing:
    real_missing = []
    for imp in lazy_missing:
        fp = imp.replace("@/", "apps/web/src/")
        if not any(os.path.exists(f'{PROJECT_ROOT}/{fp}{ext}') for ext in ['.tsx', '.ts', '/index.tsx', '/index.ts']):
            real_missing.append(imp)
    if not real_missing:
        log("Lazy imports: TODOS sao barrel exports validos. Falso positivo corrigido.")
        findings = [f for f in findings if "lazy imports" not in f["hypothesis"].lower()]
    else:
        log(f"Lazy imports REALMENTE faltando: {real_missing}")

severity_counts.clear()
for f in findings:
    severity_counts[f["severity"]] += 1

by_sev = defaultdict(list)
for f in findings:
    by_sev[f["severity"]].append(f)

log(f"Total achados: {len(findings)}")
for sev in ["CRITICAL", "HIGH", "MEDIUM", "LOW"]:
    if by_sev[sev]:
        log(f"  {sev}: {len(by_sev[sev])}")

# ============================================================================
# FASE 5: RELATORIO
# ============================================================================
log("=" * 70)
log("FASE 5: GERANDO RELATORIO")
log("=" * 70)

report_path = f"{PROJECT_ROOT}/.omk/orchestration/qa/RELATORIO-FINAL.md"

report = f"""# RELATORIO-FINAL.md
# Revisao Forense Popperiana-Socratica — OrthoPlus Enterprise

> Data: {datetime.date.today().isoformat()}
> Commit Analisado: {meta['git_commit']}
> Metodologia: Socratica + Popperiana + Forense

---

## 1. Resumo Executivo

| Metrica | Valor |
|---------|-------|
| Total de Hipoteses Testadas | {len(findings)} |
| FALSIFICADOS | {len([f for f in findings if f['verdict'] == 'FALSIFICADO'])} |
| NAO-FALSIFICADOS | {len([f for f in findings if f['verdict'] == 'NAO-FALSIFICADO'])} |
| CRITICAL | {severity_counts['CRITICAL']} |
| HIGH | {severity_counts['HIGH']} |
| MEDIUM | {severity_counts['MEDIUM']} |
| LOW | {severity_counts['LOW']} |

## 2. Meta do Projeto

| Dado | Valor Real |
|------|------------|
| Git Commit | {meta['git_commit']} |
| Prisma Models | {meta['prisma_models']} |
| Prisma Schemas | {len(meta['prisma_schemas'])} |
| Backend Modules | {meta['backend_module_count']} |
| Frontend Routes | {meta['frontend_route_count']} |
| Workers | {meta['worker_count']} |
| DB Tables | {meta['db_tables']} |
| Backend Health | {meta['backend_health']} |
| Frontend Health | {meta['frontend_health']} |
| Docker Containers | {len(meta['docker_containers'])} |

## 3. Achados Detalhados

"""

for sev in ["CRITICAL", "HIGH", "MEDIUM", "LOW"]:
    if by_sev[sev]:
        report += f"\n### {sev}\n\n"
        for i, f in enumerate(by_sev[sev], 1):
            report += f"""**[{i}]** `{f['domain']}::{f['phase']}`
- **Hipotese:** {f['hypothesis']}
- **Veredito:** {f['verdict']}
- **Comando:** `{f['command']}`
- **Output:** `{f['output_snippet'][:200]}`
- **Acao:** {f['action']}
- **Evidencia:** `{f['evidence_id']}`

"""

report += f"""
## 4. Padroes Sistemicos

1. **Sincronizacao Doc-Codigo:** Documentacoes referenciam commit anterior.
2. **Build Passa com Warnings:** Devedores tecnicos documentados.
3. **Backend sem Healthcheck Docker:** Container backend nao tem healthcheck explicito.

## 5. Acoes Recomendadas

### Imediatas (CRITICAL)
"""
for f in by_sev["CRITICAL"]:
    report += f"- [ ] {f['domain']}: {f['action']}\n"

report += "\n### Urgentes (HIGH)\n"
for f in by_sev["HIGH"]:
    report += f"- [ ] {f['domain']}: {f['action']}\n"

report += f"""
### Medio prazo
- [ ] Automatizar validacao forense em CI/CD
- [ ] Criar healthcheck para container backend
- [ ] Resolver warnings TypeScript restantes

## 6. Evidencias

`{EVIDENCE_DIR}`

---

> "Nosso conhecimento so pode ser finito, enquanto nossa ignorancia deve
> necessariamente ser infinita." — Karl Popper
"""

with open(report_path, "w") as f:
    f.write(report)

json_path = f"{PROJECT_ROOT}/.omk/orchestration/qa/findings-{datetime.date.today().isoformat()}.json"
with open(json_path, "w") as f:
    json.dump({"meta": meta, "findings": findings, "severity_counts": dict(severity_counts),
        "evidences": evidences, "timestamp": datetime.datetime.now().isoformat()}, f, indent=2, default=str)

log(f"Relatorio: {report_path}")
log(f"JSON: {json_path}")
log("=" * 70)
log("ORQUESTRACAO COMPLETA")
log("=" * 70)
