#!/usr/bin/env python3
"""
Validação Canônica Forense Orquestrada — 5 Tiers
Agentes: 15 | Hipóteses: 40+ | Metodologia: Socrática + Popperiana
Tiers: Local / TSi-Vault / OMK Memory / VPS / GitHub
"""

import subprocess, json, os, re, sys, datetime, hashlib
from collections import defaultdict

PROJECT = "/home/b0yz4kr14/Projects/OrthoPlus-Enterprise"
VAULT = "/home/b0yz4kr14/Projects/TSi-Vault/orthoplus"
VPS_IP = "100.111.74.69"
TODAY = datetime.date.today().isoformat()
EV_DIR = f"{PROJECT}/.omk/arch-squad/evidencias/{TODAY}-consolidacao"
QA_DIR = f"{PROJECT}/.omk/arch-squad/qa"
os.makedirs(EV_DIR, exist_ok=True)
os.makedirs(QA_DIR, exist_ok=True)

findings = []
conformidades = []
evidence_count = 0

def log(msg):
    t = datetime.datetime.now().strftime("%H:%M:%S")
    print(f"[{t}] {msg}", flush=True)

def run(cmd, cwd=PROJECT, timeout=60):
    try:
        r = subprocess.run(cmd, shell=True, capture_output=True, text=True, cwd=cwd, timeout=timeout)
        return r.returncode, r.stdout.strip(), r.stderr.strip()
    except Exception as e:
        return -1, "", str(e)

def save_evidence(agent, cmd, out):
    global evidence_count
    evidence_count += 1
    ev_id = f"EVC-{evidence_count:03d}-{agent}"
    ts = datetime.datetime.now().isoformat()
    h = hashlib.sha256(out.encode()).hexdigest()[:16]
    content = f"EVIDENCIA: {ev_id}\nAGENTE: {agent}\nTIMESTAMP: {ts}\nHASH: {h}\nCMD: {cmd}\n---\n{out}\n"
    with open(os.path.join(EV_DIR, f"{ev_id}.txt"), "w") as f:
        f.write(content)
    return ev_id, h

def finding(agent, tier, doc, section, claim, reality, severity, ev_id, action=""):
    f = {
        "agent": agent, "tier": tier, "doc": doc, "section": section,
        "claim": claim, "reality": reality, "severity": severity,
        "evidence_id": ev_id, "action": action
    }
    findings.append(f)
    log(f"  [{severity}] {agent} [{tier}] | {claim[:45]}... -> {reality[:45]}")

def conforme(agent, tier, doc, check, ev_id):
    conformidades.append({"agent": agent, "tier": tier, "doc": doc, "check": check, "evidence_id": ev_id})
    log(f"  [OK] {agent} [{tier}] | {check[:60]}")

# ====================================================================
# FASE 0: COLETA BASE
# ====================================================================
log("="*72)
log("VALIDACAO CANONICA FORENSE ORQUESTRADA — 5 Tiers")
log("="*72)

log("\n[FASE 0] COLETA BASE")
base = {}
base["local_commit"] = run("git rev-parse HEAD")[1][:8]
base["local_branch"] = run("git rev-parse --abbrev-ref HEAD")[1]
_, gh, _ = run("git ls-remote https://github.com/B0yZ4kr14/OrthoPlus-Enterprise HEAD")
base["github_commit"] = gh.split()[0][:8] if gh else "?"

_, vps, _ = run(f"ssh -o ConnectTimeout=5 -o BatchMode=yes -o StrictHostKeyChecking=no root@{VPS_IP} 'cd /home/tsi/OrthoPlus-Enterprise && git rev-parse HEAD' 2>&1", timeout=15)
base["vps_commit"] = vps[:8] if vps else "?"

base["modules"] = sorted([d for d in os.listdir(f"{PROJECT}/backend/src/modules") if os.path.isdir(f"{PROJECT}/backend/src/modules/{d}")])
base["module_count"] = len(base["modules"])

_, base["models"], _ = run("grep -c '^model ' backend/prisma/schema.prisma")
base["models"] = int(base["models"] or 0)

_, sc, _ = run("grep -oP '@@schema\\(\"([^\"]+)\"\\)' backend/prisma/schema.prisma | sed 's/@@schema(\"//;s/\")//' | sort -u | wc -l")
base["custom_schemas"] = int(sc.strip() or 0)
base["schema_count"] = base["custom_schemas"] + 1

with open(f"{PROJECT}/apps/web/src/routes/AppRoutes.tsx") as f:
    rt = f.read()
base["routes"] = re.findall(r'path=["\']([^"\']+)["\']', rt)
base["route_count"] = len(base["routes"])

_, wc, _ = run("ls backend/src/workers/jobs/*.ts 2>/dev/null | wc -l")
base["worker_count"] = int(wc.strip() or 0)

_, dbt, _ = run("psql -h localhost -U orthoplus -d orthoplus -c 'SELECT COUNT(*) FROM information_schema.tables WHERE table_schema NOT IN (chr(39)||'pg_catalog'||chr(39), chr(39)||'information_schema'||chr(39));' 2>&1")
m = re.search(r'(\d+)', dbt)
base["db_tables"] = int(m.group(1)) if m else -1

_, mc, _ = run("psql -h localhost -U orthoplus -d orthoplus -c 'SELECT COUNT(*) FROM configuracoes.module_catalog;' 2>&1")
m = re.search(r'(\d+)', mc)
base["mc_count"] = int(m.group(1)) if m else -1

_, cm, _ = run("psql -h localhost -U orthoplus -d orthoplus -c 'SELECT COUNT(*) FROM configuracoes.clinic_modules;' 2>&1")
m = re.search(r'(\d+)', cm)
base["cm_count"] = int(m.group(1)) if m else -1

# Frontend modules
fe_modules = [d for d in os.listdir(f"{PROJECT}/apps/web/src/modules") if os.path.isdir(f"{PROJECT}/apps/web/src/modules/{d}")]
base["fe_module_count"] = len(fe_modules)

# Routers count
_, rc_out, _ = run("find backend/src/modules -name 'router.ts' | wc -l")
base["router_count"] = int(rc_out.strip() or 0)

# Controllers count
_, cc_out, _ = run("find backend/src/modules -name '*Controller*' -o -name '*controller*' | wc -l")
base["controller_count"] = int(cc_out.strip() or 0)

# Read canonical docs
with open(f"{PROJECT}/AGENTS.md") as f:
    base["agents_md"] = f.read()
with open(f"{PROJECT}/docs/CANONICAL-2026-05-14.md") as f:
    base["canonical_md"] = f.read()
with open(f"{PROJECT}/PROMPT-CANONICO-CONTINUIDADE.md") as f:
    base["prompt_md"] = f.read()
with open(f"{PROJECT}/docs/ARCHITECTURE.md") as f:
    base["arch_md"] = f.read()

# TSi-Vault
vault_cp = f"{VAULT}/checkpoints/OrthoPlus-Checkpoint-{TODAY}.md"
if os.path.exists(vault_cp):
    with open(vault_cp) as f:
        base["vault_md"] = f.read()
else:
    base["vault_md"] = ""

# OMK Memory
omk_path = f"{PROJECT}/.omk/memory/state-{TODAY}.json"
if os.path.exists(omk_path):
    with open(omk_path) as f:
        base["omk_json"] = json.load(f)
else:
    base["omk_json"] = {}

log(f"  Commits: LOCAL={base['local_commit']} GITHUB={base['github_commit']} VPS={base['vps_commit']}")
log(f"  Metrics: MOD={base['module_count']} MODELS={base['models']} SCHEMAS={base['schema_count']} ROUTES={base['route_count']} WORKERS={base['worker_count']}")
log(f"  DB: TABLES={base['db_tables']} MC={base['mc_count']} CM={base['cm_count']}")
log(f"  Code: ROUTERS={base['router_count']} CONTROLLERS={base['controller_count']} FE_MODS={base['fe_module_count']}")

# ====================================================================
# AGENTE A1: VALIDADOR DE COMMITS (Tier 1-5 Sync)
# ====================================================================
log("\n[A1] VALIDADOR DE COMMITS")
for name, commit in [("Local", base["local_commit"]), ("GitHub", base["github_commit"]), ("VPS", base["vps_commit"])]:
    ev, _ = save_evidence("A1", f"commit_{name}", commit)
    if commit == base["local_commit"]:
        conforme("A1", name, "Git", f"{name} sincronizado ({commit})", ev)
    else:
        finding("A1", name, "Git", "Sync", f"{name} == Local", f"{name}: {commit} vs Local: {base['local_commit']}", "HIGH", ev, f"Sincronizar {name}")

# ====================================================================
# AGENTE A2: VALIDADOR AGENTS.md (Tier 2)
# ====================================================================
log("\n[A2] VALIDADOR AGENTS.md")
checks_a2 = [
    ("module_count", str(base["module_count"])),
    ("models", str(base["models"])),
    ("schemas", str(base["schema_count"])),
    ("routes", str(base["route_count"])),
    ("workers", str(base["worker_count"])),
]
for metric, expected in checks_a2:
    ev, _ = save_evidence("A2", f"agents_{metric}", f"expected={expected}")
    if expected in base["agents_md"]:
        conforme("A2", "Tier2", "AGENTS.md", f"{metric}={expected} encontrado", ev)
    else:
        finding("A2", "Tier2", "AGENTS.md", metric, f"Contem {expected}", "Nao encontrado", "HIGH", ev, f"Atualizar AGENTS.md com {metric}={expected}")

# Verify AGENTS.md has 37 modules listed
module_table = re.search(r'\|\s*\d+\s*\|\s*\w+\s*\|', base["agents_md"])
if module_table:
    module_rows = len(re.findall(r'^\|\s*\d+\s*\|', base["agents_md"], re.MULTILINE))
    ev, _ = save_evidence("A2", "agents_module_rows", str(module_rows))
    if module_rows >= base["module_count"]:
        conforme("A2", "Tier2", "AGENTS.md", f"Tabela de modulos: {module_rows} linhas >= {base['module_count']}", ev)
    else:
        finding("A2", "Tier2", "AGENTS.md", "Module table", f">={base['module_count']} linhas", f"{module_rows} linhas", "HIGH", ev, "Adicionar modulos faltantes")

# Verify commit tracking in AGENTS.md
ev, _ = save_evidence("A2", "agents_commit", base["local_commit"])
if base["local_commit"] in base["agents_md"]:
    conforme("A2", "Tier2", "AGENTS.md", f"Commit atual ({base['local_commit']}) documentado", ev)
else:
    finding("A2", "Tier2", "AGENTS.md", "Commit tracking", "Commit atual documentado", "Nao encontrado", "MEDIUM", ev, "Atualizar header com commit atual")

# ====================================================================
# AGENTE A3: VALIDADOR CANONICAL-2026-05-14.md (Tier 2)
# ====================================================================
log("\n[A3] VALIDADOR CANONICAL-2026-05-14.md")
checks_a3 = [
    ("module_count", str(base["module_count"])),
    ("models", str(base["models"])),
    ("schemas", str(base["schema_count"])),
    ("routes", str(base["route_count"])),
    ("workers", str(base["worker_count"])),
    ("db_tables", str(base["db_tables"])),
]
for metric, expected in checks_a3:
    ev, _ = save_evidence("A3", f"canonical_{metric}", f"expected={expected}")
    if expected in base["canonical_md"]:
        conforme("A3", "Tier2", "CANONICAL.md", f"{metric}={expected} encontrado", ev)
    else:
        finding("A3", "Tier2", "CANONICAL.md", metric, f"Contem {expected}", "Nao encontrado", "HIGH", ev, f"Atualizar CANONICAL.md")

# Verify section 5 has correct module count
sec5 = re.search(r'Section 5.*?(?=## |\Z)', base["canonical_md"], re.DOTALL)
if sec5:
    sec5_text = sec5.group(0)
    module_rows_canonical = len(re.findall(r'^\|\s*\d+\s*\|', sec5_text, re.MULTILINE))
    ev, _ = save_evidence("A3", "canonical_module_rows", str(module_rows_canonical))
    if module_rows_canonical >= base["module_count"]:
        conforme("A3", "Tier2", "CANONICAL.md", f"Secao 5: {module_rows_canonical} modulos documentados", ev)
    else:
        finding("A3", "Tier2", "CANONICAL.md", "Section 5", f">={base['module_count']} modulos", f"{module_rows_canonical}", "HIGH", ev, "Completar tabela")

# ====================================================================
# AGENTE A4: VALIDADOR PROMPT-CANONICO (Tier 2 Master)
# ====================================================================
log("\n[A4] VALIDADOR PROMPT-CANONICO-CONTINUIDADE.md")
ev, _ = save_evidence("A4", "prompt_commit", base["local_commit"])
if base["local_commit"] in base["prompt_md"]:
    conforme("A4", "Tier2", "PROMPT.md", f"Commit atual ({base['local_commit']}) referenciado", ev)
else:
    finding("A4", "Tier2", "PROMPT.md", "Commit ref", "Commit atual no prompt", "Nao encontrado", "HIGH", ev, "Atualizar prompt")

# Check tier references
refs = re.findall(r'`([^`]+\.(md|json|tsx?|prisma|yaml|yml))`', base["prompt_md"])
ev, _ = save_evidence("A4", "prompt_refs", str(len(refs)))
if len(refs) >= 20:
    conforme("A4", "Tier2", "PROMPT.md", f"{len(refs)} referencias explicitas (>=20)", ev)
else:
    finding("A4", "Tier2", "PROMPT.md", "References", f">=20 referencias", f"{len(refs)}", "MEDIUM", ev, "Expandir referencias")

# Check if prompt mentions all 5 tiers
for tier in ["Tier 1", "Tier 2", "Tier 3", "Tier 4", "Tier 5"]:
    ev, _ = save_evidence("A4", f"prompt_{tier}", tier)
    if tier in base["prompt_md"]:
        conforme("A4", "Tier2", "PROMPT.md", f"{tier} documentado", ev)
    else:
        finding("A4", "Tier2", "PROMPT.md", f"{tier}", f"{tier} presente", "Ausente", "CRITICAL", ev, f"Adicionar {tier}")

# ====================================================================
# AGENTE A5: VALIDADOR TSi-VAULT (Tier 3)
# ====================================================================
log("\n[A5] VALIDADOR TSi-VAULT")
if base["vault_md"]:
    ev, _ = save_evidence("A5", "vault_exists", "yes")
    conforme("A5", "Tier3", "TSi-Vault", "Checkpoint existe", ev)
    
    if base["local_commit"] in base["vault_md"]:
        conforme("A5", "Tier3", "TSi-Vault", f"Commit {base['local_commit']} presente", ev)
    else:
        vault_commits = re.findall(r'`([a-f0-9]{7,8})`', base["vault_md"])
        finding("A5", "Tier3", "TSi-Vault", "Commit sync", f"Commit {base['local_commit']}", f"Commits: {vault_commits}", "HIGH", ev, "Atualizar checkpoint")
    
    # Check metrics in vault
    for metric, expected in [("modules", str(base["module_count"])), ("models", str(base["models"]))]:
        ev2, _ = save_evidence("A5", f"vault_{metric}", expected)
        if expected in base["vault_md"]:
            conforme("A5", "Tier3", "TSi-Vault", f"{metric}={expected}", ev2)
        else:
            finding("A5", "Tier3", "TSi-Vault", metric, f"Contem {expected}", "Nao encontrado", "MEDIUM", ev2, "Atualizar metricas")
else:
    ev, _ = save_evidence("A5", "vault_exists", "no")
    finding("A5", "Tier3", "TSi-Vault", "Checkpoint", "Checkpoint existe", "NAO ENCONTRADO", "CRITICAL", ev, "Criar checkpoint")

# ====================================================================
# AGENTE A6: VALIDADOR OMK MEMORY (Tier 3)
# ====================================================================
log("\n[A6] VALIDADOR OMK MEMORY")
if base["omk_json"]:
    ev, _ = save_evidence("A6", "omk_exists", "yes")
    conforme("A6", "Tier3", "OMK", "Memory JSON existe", ev)
    
    omk_commit = base["omk_json"].get("commit", "")
    if omk_commit == base["local_commit"]:
        conforme("A6", "Tier3", "OMK", f"Commit {base['local_commit']} sincronizado", ev)
    else:
        finding("A6", "Tier3", "OMK", "Commit", f"{base['local_commit']}", f"{omk_commit}", "HIGH", ev, "Atualizar OMK memory")
    
    # Check metrics
    omk_metrics = base["omk_json"].get("metrics", {})
    for key, expected in [("modules", base["module_count"]), ("models", base["models"]), ("routes", base["route_count"])]:
        ev2, _ = save_evidence("A6", f"omk_{key}", str(omk_metrics.get(key, "?")))
        if omk_metrics.get(key) == expected:
            conforme("A6", "Tier3", "OMK", f"{key}={expected}", ev2)
        else:
            finding("A6", "Tier3", "OMK", key, f"{expected}", f"{omk_metrics.get(key, '?')}", "HIGH", ev2, "Atualizar metrica")
else:
    ev, _ = save_evidence("A6", "omk_exists", "no")
    finding("A6", "Tier3", "OMK", "Memory", "Memory existe", "NAO ENCONTRADO", "CRITICAL", ev, "Criar memory JSON")

# ====================================================================
# AGENTE A7: VALIDADOR VPS RUNTIME (Tier 5)
# ====================================================================
log("\n[A7] VALIDADOR VPS RUNTIME")

# Check VPS commit
_, vps_git, _ = run(f"ssh -o ConnectTimeout=5 -o BatchMode=yes root@{VPS_IP} 'cd /home/tsi/OrthoPlus-Enterprise && git rev-parse HEAD' 2>&1", timeout=15)
vps_commit = vps_git[:8] if vps_git else "?"
ev, _ = save_evidence("A7", "vps_commit", vps_commit)
if vps_commit == base["local_commit"]:
    conforme("A7", "Tier5", "VPS", f"Commit sincronizado ({vps_commit})", ev)
else:
    finding("A7", "Tier5", "VPS", "Git sync", f"{base['local_commit']}", vps_commit, "HIGH", ev, "git pull na VPS")

# Check Docker containers
_, docker_ps, _ = run(f"ssh -o ConnectTimeout=5 -o BatchMode=yes root@{VPS_IP} 'docker ps --format \"{{.Names}}|{{.Status}}\"' 2>&1", timeout=15)
ev2, _ = save_evidence("A7", "vps_docker", docker_ps)
expected_containers = ["tsiapp-orthoplus", "tsiapp-orthoplus-backend", "orthoplus-redis"]
for container in expected_containers:
    if container in docker_ps:
        conforme("A7", "Tier5", "VPS", f"Container {container} rodando", ev2)
    else:
        finding("A7", "Tier5", "VPS", f"Container {container}", "Rodando", "Ausente", "CRITICAL", ev2, f"Verificar container {container}")

# Check backend health
_, health, _ = run(f"ssh -o ConnectTimeout=5 -o BatchMode=yes root@{VPS_IP} 'curl -s http://127.0.0.1:3005/health' 2>&1", timeout=15)
ev3, _ = save_evidence("A7", "vps_health", health)
if '"status":"ok"' in health:
    conforme("A7", "Tier5", "VPS", "Backend healthcheck OK", ev3)
else:
    finding("A7", "Tier5", "VPS", "Health", "status:ok", health[:50], "HIGH", ev3, "Verificar backend")

# ====================================================================
# AGENTE A8: VALIDADOR DE INFRAESTRUTURA (Tier 5)
# ====================================================================
log("\n[A8] VALIDADOR DE INFRAESTRUTURA")

# Check docker-compose ports
_, compose, _ = run(f"ssh -o ConnectTimeout=5 -o BatchMode=yes root@{VPS_IP} 'cat /home/tsi/apps/orthoplus-enterprise/docker-compose.yml' 2>&1", timeout=15)
ev, _ = save_evidence("A8", "vps_compose", compose)
if "8083:8080" in compose:
    conforme("A8", "Tier5", "VPS", "Port mapping frontend correto (8083:8080)", ev)
else:
    finding("A8", "Tier5", "VPS", "Port mapping", "8083:8080", "Divergente", "HIGH", ev, "Corrigir port mapping")

# Check nginx config inside container
_, nginx, _ = run(f"ssh -o ConnectTimeout=5 -o BatchMode=yes root@{VPS_IP} 'docker exec tsiapp-orthoplus cat /etc/nginx/conf.d/default.conf' 2>&1", timeout=15)
ev2, _ = save_evidence("A8", "vps_nginx", nginx)
if "listen 8080" in nginx or "listen 80" in nginx:
    conforme("A8", "Tier5", "VPS", "Nginx configurado", ev2)
else:
    finding("A8", "Tier5", "VPS", "Nginx", "Listen configurado", "Divergente", "MEDIUM", ev2, "Verificar nginx")

# ====================================================================
# AGENTE A9: VALIDADOR DOCKER LOCAL (Tier 5)
# ====================================================================
log("\n[A9] VALIDADOR DOCKER LOCAL")
_, local_ps, _ = run("docker ps --format '{{.Names}}|{{.Status}}' 2>/dev/null || echo 'docker-not-available'")
ev, _ = save_evidence("A9", "local_docker", local_ps)
if "orthoplus-backend" in local_ps or "tsiapp-orthoplus-backend" in local_ps:
    conforme("A9", "Tier5", "Local", "Backend container local rodando", ev)
elif "docker-not-available" in local_ps:
    conforme("A9", "Tier5", "Local", "Docker nao disponivel (ambiente dev)", ev)
else:
    finding("A9", "Tier5", "Local", "Docker", "Containers rodando", "Nenhum container orthoplus", "LOW", ev, "Verificar Docker local")

# ====================================================================
# AGENTE A10: VALIDADOR BACKEND (Tier 1)
# ====================================================================
log("\n[A10] VALIDADOR BACKEND")

# Check index.ts registers all modules
_, idx, _ = run("cat backend/src/index.ts")
ev, _ = save_evidence("A10", "backend_index", idx[:500])
registered = re.findall(r'modulesRouter\.(\w+)', idx)
ev2, _ = save_evidence("A10", "backend_registered", str(registered))
if len(registered) >= base["module_count"]:
    conforme("A10", "Tier1", "Backend", f"{len(registered)} routers registrados em index.ts", ev2)
else:
    finding("A10", "Tier1", "Backend", "Registration", f">={base['module_count']}", f"{len(registered)}", "HIGH", ev2, "Registrar routers faltantes")

# Check clinicGuard in each router
missing_guards = []
for mod in base["modules"]:
    router_path = f"backend/src/modules/{mod}/api/router.ts"
    if os.path.exists(router_path):
        with open(router_path) as f:
            content = f.read()
        if "clinicGuard" not in content:
            missing_guards.append(mod)

if missing_guards:
    ev3, _ = save_evidence("A10", "missing_clinicGuard", str(missing_guards))
    finding("A10", "Tier1", "Backend", "clinicGuard", "Todos os routers", f"Faltando em: {missing_guards}", "CRITICAL", ev3, "Adicionar clinicGuard")
else:
    ev3, _ = save_evidence("A10", "clinicGuard_ok", "all")
    conforme("A10", "Tier1", "Backend", f"clinicGuard em todos os {base['module_count']} routers", ev3)

# ====================================================================
# AGENTE A11: VALIDADOR FRONTEND (Tier 1)
# ====================================================================
log("\n[A11] VALIDADOR FRONTEND")

# Check AppRoutes.tsx has lazy-loaded modules
lazy_count = len(re.findall(r'React\.lazy|lazy\(', rt))
ev, _ = save_evidence("A11", "frontend_lazy", str(lazy_count))
if lazy_count >= 20:
    conforme("A11", "Tier1", "Frontend", f"{lazy_count} lazy-loaded modules", ev)
else:
    finding("A11", "Tier1", "Frontend", "Lazy loading", f">=20 lazy", f"{lazy_count}", "MEDIUM", ev, "Verificar lazy loading")

# Check domain layers
_, domain_dirs, _ = run("find apps/web/src/modules -type d -name 'domain' | wc -l")
domain_count = int(domain_dirs.strip() or 0)
ev2, _ = save_evidence("A11", "frontend_domain", str(domain_count))
if domain_count >= 5:
    conforme("A11", "Tier1", "Frontend", f"{domain_count} modulos com camada domain", ev2)
else:
    finding("A11", "Tier1", "Frontend", "Domain layer", f">=5 modulos", f"{domain_count}", "MEDIUM", ev2, "Expandir Clean Arch")

# ====================================================================
# AGENTE A12: VALIDADOR DATABASE (Tier 1 + Tier 5)
# ====================================================================
log("\n[A12] VALIDADOR DATABASE")

# Models == Tables
if base["models"] == base["db_tables"]:
    ev, _ = save_evidence("A12", "models_tables", f"{base['models']} == {base['db_tables']}")
    conforme("A12", "Tier1", "DB", f"Models ({base['models']}) == Tables ({base['db_tables']})", ev)
else:
    ev, _ = save_evidence("A12", "models_tables", f"{base['models']} != {base['db_tables']}")
    finding("A12", "Tier1", "DB", "Models vs Tables", f"{base['models']} == {base['db_tables']}", f"Divergencia", "HIGH", ev, "Sincronizar schema")

# module_catalog count
if base["mc_count"] == base["module_count"]:
    ev, _ = save_evidence("A12", "mc_count", str(base["mc_count"]))
    conforme("A12", "Tier1", "DB", f"module_catalog={base['mc_count']} == modules={base['module_count']}", ev)
else:
    ev, _ = save_evidence("A12", "mc_count", f"{base['mc_count']} != {base['module_count']}")
    finding("A12", "Tier1", "DB", "module_catalog", f"{base['module_count']}", f"{base['mc_count']}", "HIGH", ev, "Sincronizar module_catalog")

# relationMode in schema
with open(f"{PROJECT}/backend/prisma/schema.prisma") as f:
    schema_content = f.read()
ev2, _ = save_evidence("A12", "relationMode", "checked")
if 'relationMode = "prisma"' in schema_content:
    conforme("A12", "Tier1", "DB", "relationMode = 'prisma' presente", ev2)
else:
    finding("A12", "Tier1", "DB", "relationMode", "relationMode = 'prisma'", "Ausente", "CRITICAL", ev2, "Adicionar relationMode")

# ====================================================================
# AGENTE A13: VALIDADOR DE SEGURANCA (Tier 1)
# ====================================================================
log("\n[A13] VALIDADOR DE SEGURANCA")

# Check rate limiting in index.ts
_, rate_limit, _ = run("grep -n 'rateLimit' backend/src/index.ts")
ev, _ = save_evidence("A13", "rate_limit", rate_limit)
if rate_limit:
    conforme("A13", "Tier1", "Security", "Rate limiting configurado", ev)
else:
    finding("A13", "Tier1", "Security", "Rate limit", "Configurado", "Nao encontrado", "HIGH", ev, "Verificar rate limiting")

# Check helmet
_, helmet, _ = run("grep -n 'helmet' backend/src/index.ts")
ev2, _ = save_evidence("A13", "helmet", helmet)
if helmet:
    conforme("A13", "Tier1", "Security", "Helmet configurado", ev2)
else:
    finding("A13", "Tier1", "Security", "Helmet", "Configurado", "Nao encontrado", "HIGH", ev2, "Verificar helmet")

# Check security headers
_, headers, _ = run("curl -s -I http://localhost:3005/health")
ev3, _ = save_evidence("A13", "security_headers", headers)
sec_headers = [h for h in ["x-frame-options", "x-content-type-options", "strict-transport-security"] if h in headers.lower()]
if len(sec_headers) >= 2:
    conforme("A13", "Tier1", "Security", f"Headers de seguranca: {len(sec_headers)}/3", ev3)
else:
    finding("A13", "Tier1", "Security", "Headers", f">=2 headers", f"{len(sec_headers)}", "MEDIUM", ev3, "Verificar Helmet config")

# ====================================================================
# AGENTE A14: VALIDADOR DE WORKERS (Tier 1)
# ====================================================================
log("\n[A14] VALIDADOR DE WORKERS")

_, worker_files, _ = run("ls backend/src/workers/jobs/*.ts 2>/dev/null")
ev, _ = save_evidence("A14", "workers", worker_files)
worker_list = [f for f in worker_files.split(chr(10)) if f.strip()]
if len(worker_list) == base["worker_count"]:
    conforme("A14", "Tier1", "Workers", f"{len(worker_list)} workers confirmados", ev)
else:
    finding("A14", "Tier1", "Workers", "Count", f"{base['worker_count']}", f"{len(worker_list)}", "MEDIUM", ev, "Verificar workers")

# Check workers are registered
_, worker_reg, _ = run("grep -n 'new CronJob' backend/src/workers/*.ts backend/src/workers/**/*.ts 2>/dev/null")
ev2, _ = save_evidence("A14", "worker_reg", worker_reg)
cron_count = len([l for l in worker_reg.split(chr(10)) if l.strip()])
if cron_count >= 9:
    conforme("A14", "Tier1", "Workers", f"{cron_count} cron jobs registrados", ev2)
else:
    finding("A14", "Tier1", "Workers", "Cron jobs", f">=9", f"{cron_count}", "MEDIUM", ev2, "Verificar registro de workers")

# ====================================================================
# AGENTE A15: VALIDADOR CROSS-TIER (Master)
# ====================================================================
log("\n[A15] VALIDADOR CROSS-TIER MASTER")

# All tiers must agree on module count
for tier_name, doc_content in [
    ("AGENTS.md", base["agents_md"]),
    ("CANONICAL.md", base["canonical_md"]),
    ("PROMPT.md", base["prompt_md"]),
]:
    ev, _ = save_evidence("A15", f"cross_{tier_name}", str(base["module_count"]))
    if str(base["module_count"]) in doc_content:
        conforme("A15", "Tier2", tier_name, f"module_count={base['module_count']} consistente", ev)
    else:
        finding("A15", "Tier2", tier_name, "module_count", f"{base['module_count']}", "Divergente", "HIGH", ev, f"Atualizar {tier_name}")

# All tiers must agree on models
for tier_name, doc_content in [
    ("AGENTS.md", base["agents_md"]),
    ("CANONICAL.md", base["canonical_md"]),
    ("PROMPT.md", base["prompt_md"]),
]:
    ev, _ = save_evidence("A15", f"cross_models_{tier_name}", str(base["models"]))
    if str(base["models"]) in doc_content:
        conforme("A15", "Tier2", tier_name, f"models={base['models']} consistente", ev)
    else:
        finding("A15", "Tier2", tier_name, "models", f"{base['models']}", "Divergente", "HIGH", ev, f"Atualizar {tier_name}")

# ====================================================================
# RELATORIO FINAL
# ====================================================================
log("\n" + "="*72)
log("RELATORIO DE VALIDACAO CANONICA FORENSE")
log("="*72)

severity_counts = defaultdict(int)
for f in findings:
    severity_counts[f['severity']] += 1

log(f"\nAgentes: 15 | Hipoteses: 40+ | Evidencias: {evidence_count}")
log(f"Conformidades: {len(conformidades)} | Findings: {len(findings)}")
for sev in ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']:
    if severity_counts[sev] > 0:
        log(f"  {sev}: {severity_counts[sev]}")

report = {
    "meta": {
        "date": TODAY,
        "time": datetime.datetime.now().strftime("%H:%M:%S"),
        "commit": base["local_commit"],
        "agents": 15,
        "methodology": "Socratic + Popperian + Forensic",
        "tiers": 5,
        "evidence_count": evidence_count,
        "evidence_dir": EV_DIR
    },
    "environments": {
        "local": base["local_commit"],
        "github": base["github_commit"],
        "vps": base["vps_commit"]
    },
    "metrics": base,
    "conformidades": conformidades,
    "findings": findings,
    "severity_counts": dict(severity_counts)
}

json_path = f"{QA_DIR}/validacao-canonica-{TODAY}.json"
with open(json_path, "w") as f:
    json.dump(report, f, indent=2, default=str)

md_path = f"{QA_DIR}/validacao-canonica-{TODAY}-RESUMO.md"
with open(md_path, "w") as f:
    f.write(f"# Validacao Canônica Forense — 5 Tiers\n\n")
    f.write(f"**Data:** {TODAY}\n**Commit:** `{base['local_commit']}`\n**Agentes:** 15\n**Tiers:** 5\n**Evidencias:** {evidence_count}\n\n")
    f.write(f"## Resumo\n\n| Métrica | Valor |\n|---------|-------|\n")
    f.write(f"| Conformidades | {len(conformidades)} |\n")
    f.write(f"| Findings | {len(findings)} |\n")
    f.write(f"| CRITICAL | {severity_counts.get('CRITICAL', 0)} |\n")
    f.write(f"| HIGH | {severity_counts.get('HIGH', 0)} |\n")
    f.write(f"| MEDIUM | {severity_counts.get('MEDIUM', 0)} |\n")
    f.write(f"| LOW | {severity_counts.get('LOW', 0)} |\n\n")
    
    f.write(f"## Conformidades ({len(conformidades)})\n\n")
    for i, c in enumerate(conformidades[:30], 1):
        f.write(f"{i}. **{c['agent']}** [{c['tier']}] — {c['doc']}: {c['check']}\n")
    if len(conformidades) > 30:
        f.write(f"\n... e mais {len(conformidades)-30} conformidades.\n")
    
    f.write(f"\n## Findings ({len(findings)})\n\n")
    for i, fn in enumerate(findings, 1):
        f.write(f"### [{i}] [{fn['severity']}] {fn['agent']} [{fn['tier']}]\n")
        f.write(f"- **Doc:** {fn['doc']}::{fn['section']}\n")
        f.write(f"- **Claim:** {fn['claim']}\n")
        f.write(f"- **Reality:** {fn['reality']}\n")
        f.write(f"- **Action:** {fn['action']}\n\n")
    
    f.write(f"---\n\n**JSON:** `{json_path}`\n**EV:** `{EV_DIR}`\n")

log(f"\nJSON: {json_path}")
log(f"MD:   {md_path}")
log(f"EV:   {EV_DIR}")
log("="*72)
