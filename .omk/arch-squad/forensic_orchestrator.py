#!/usr/bin/env python3
"""Orchestracao Forense Arquitetural — 10 Agentes"""
import subprocess, json, os, re, sys, datetime, hashlib
from collections import defaultdict

PROJECT = "/home/b0yz4kr14/Projects/OrthoPlus-Enterprise"
VAULT = "/home/b0yz4kr14/Projects/TSi-Vault/orthoplus"
VPS_IP = "100.111.74.69"
TODAY = datetime.date.today().isoformat()
EV_DIR = f"{PROJECT}/.omk/arch-squad/evidencias/{TODAY}"
QA_DIR = f"{PROJECT}/.omk/arch-squad/qa"
os.makedirs(EV_DIR, exist_ok=True)
os.makedirs(QA_DIR, exist_ok=True)

findings = []
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
    ev_id = f"EV-{evidence_count:03d}-{agent}"
    ts = datetime.datetime.now().isoformat()
    h = hashlib.sha256(out.encode()).hexdigest()[:16]
    content = f"EVIDENCIA: {ev_id}\nAGENTE: {agent}\nTIMESTAMP: {ts}\nHASH: {h}\nCMD: {cmd}\n---\n{out}\n"
    with open(os.path.join(EV_DIR, f"{ev_id}.txt"), "w") as f:
        f.write(content)
    return ev_id, h

def finding(agent, doc, section, claim, reality, severity, ev_id, action=""):
    f = {
        "agent": agent, "doc": doc, "section": section,
        "claim": claim, "reality": reality, "severity": severity,
        "evidence_id": ev_id, "action": action
    }
    findings.append(f)
    log(f"  [{severity}] {agent} | {claim[:50]}... -> {reality[:50]}")

log("="*70)
log("ORQUESTRACAO FORENSE ARQUITETURAL")
log("="*70)

log("\n[FASE 1] COLETA BASE")
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

with open(f"{PROJECT}/AGENTS.md") as f:
    base["agents_md"] = f.read()
with open(f"{PROJECT}/docs/CANONICAL-2026-05-14.md") as f:
    base["canonical_md"] = f.read()
with open(f"{PROJECT}/PROMPT-CANONICO-CONTINUIDADE.md") as f:
    base["prompt_md"] = f.read()

log(f"  Commits: LOCAL={base['local_commit']} GITHUB={base['github_commit']} VPS={base['vps_commit']}")
log(f"  Metrics: MOD={base['module_count']} MODELS={base['models']} SCHEMAS={base['schema_count']} ROUTES={base['route_count']} WORKERS={base['worker_count']}")
log(f"  DB: TABLES={base['db_tables']} MC={base['mc_count']} CM={base['cm_count']}")

# ARQ-01 BACKEND
log("\n[ARQ-01] ARQUITETO DE BACKEND")
rc, out, _ = run("grep -n 'clinicGuard' backend/src/index.ts")
ev1, _ = save_evidence("ARQ-01", "grep clinicGuard", out)
clinic_guard_count = out.count("clinicGuard")
if clinic_guard_count < base["module_count"]:
    finding("ARQ-01", "Codigo", "clinicGuard", f"clinicGuard em {base['module_count']} routers", f"Apenas {clinic_guard_count}", "HIGH", ev1, "Verificar routers sem clinicGuard")

rc, out, _ = run("grep -rn 'queryRaw' backend/src/modules/ --include='*.ts'")
ev2, _ = save_evidence("ARQ-01", "grep queryRaw", out)
queryraw_count = len([l for l in out.split(chr(10)) if l.strip()])
if queryraw_count > 0:
    finding("ARQ-01", "Codigo", "queryRaw", f"queryRaw: {queryraw_count} ocorrencias", f"Documentado como ~14", "MEDIUM", ev2, "Reclassificar se necessario")

rc, out, _ = run("find backend/src/modules -name '*Controller*' -o -name '*controller*' | sort")
ev3, _ = save_evidence("ARQ-01", "find controllers", out)
ctrl_count = len([l for l in out.split(chr(10)) if l.strip()])
if ctrl_count < 30:
    finding("ARQ-01", "Codigo", "Controllers", f">=30 controllers", f"{ctrl_count} controllers", "MEDIUM", ev3, "Verificar stubs")

# ARQ-02 FRONTEND
log("\n[ARQ-02] ARQUITETO DE FRONTEND")
rc, out, _ = run("find apps/web/src/modules -type d -name 'domain' | wc -l")
ev5, _ = save_evidence("ARQ-02", "find domain dirs", out)
domain_count = int(out.strip() or 0)
rc, out2, _ = run("find apps/web/src/modules -path '*/application/use-cases*' -type d | wc -l")
ev6, _ = save_evidence("ARQ-02", "find use-cases dirs", out2)
fe_modules = len([d for d in os.listdir(f"{PROJECT}/apps/web/src/modules") if os.path.isdir(f"{PROJECT}/apps/web/src/modules/{d}")])
ca_ratio = (domain_count / fe_modules * 100) if fe_modules > 0 else 0
if ca_ratio < 30:
    finding("ARQ-02", "Codigo", "Clean Arch", f"Clean Arch em >=30% dos modulos", f"{ca_ratio:.0f}% ({domain_count}/{fe_modules})", "MEDIUM", ev5, "Documentar como marginal ou expandir")

rc, out, _ = run("grep -rn '@ts-ignore' apps/web/src/ --include='*.ts' --include='*.tsx' | wc -l")
ev8, _ = save_evidence("ARQ-02", "TS violations", out)
violations = int(out.strip() or 0)
if violations > 100:
    finding("ARQ-02", "Codigo", "TS Violations", f"<100 violations", f"{violations} violations", "LOW", ev8, "Refatorar gradualmente")

# ARQ-03 DATABASE
log("\n[ARQ-03] ARQUITETO DE DADOS")
if base["models"] != base["db_tables"]:
    finding("ARQ-03", "DB", "Models vs Tables", f"Models ({base['models']}) == Tables ({base['db_tables']})", f"Divergencia", "HIGH", None, "Sincronizar schema")

rc, out, _ = run("grep -B1 '^model ' backend/prisma/schema.prisma | grep -v '@@schema' | grep '^model'")
ev9, _ = save_evidence("ARQ-03", "models without schema", out)
if out.strip():
    finding("ARQ-03", "Schema", "@@schema", "Todos models tem @@schema", f"Models sem schema", "HIGH", ev9, "Adicionar @@schema")

rc, out, _ = run("grep 'relationMode' backend/prisma/schema.prisma")
ev10, _ = save_evidence("ARQ-03", "relationMode", out)
if "prisma" not in out:
    finding("ARQ-03", "Schema", "relationMode", "relationMode = 'prisma'", "Nao encontrado", "CRITICAL", ev10, "Adicionar relationMode")

# ARQ-04 DEVOPS
log("\n[ARQ-04] ARQUITETO DEVOPS")
rc, out, _ = run("grep -i 'HEALTHCHECK' backend/Dockerfile")
ev11, _ = save_evidence("ARQ-04", "HEALTHCHECK backend", out)
if not out.strip():
    finding("ARQ-04", "Docker", "HEALTHCHECK", "Backend Dockerfile tem HEALTHCHECK", "Nao encontrado", "MEDIUM", ev11, "Adicionar HEALTHCHECK (DEV-001)")

rc, out, _ = run("grep -i 'HEALTHCHECK' Dockerfile")
ev12, _ = save_evidence("ARQ-04", "HEALTHCHECK frontend", out)
if not out.strip():
    finding("ARQ-04", "Docker", "HEALTHCHECK FE", "Frontend Dockerfile tem HEALTHCHECK", "Nao encontrado", "LOW", ev12, "Adicionar HEALTHCHECK")

# ARQ-05 SECURITY
log("\n[ARQ-05] ARQUITETO DE SEGURANCA")
rc, out, _ = run("curl -s -I http://localhost:3005/health")
ev14, _ = save_evidence("ARQ-05", "security headers", out)
sec_headers = [h for h in ["x-frame-options", "x-content-type-options", "strict-transport-security"] if h in out.lower()]
if len(sec_headers) < 2:
    finding("ARQ-05", "Security", "Headers", f">=2 headers de seguranca", f"Apenas {len(sec_headers)}", "HIGH", ev14, "Verificar Helmet config")

# ARQ-06 API
log("\n[ARQ-06] ARQUITETO DE APIs")
rc, out, _ = run("grep -rn 'router.get' backend/src/modules/ --include='*.ts' | wc -l")
ev17, _ = save_evidence("ARQ-06", "router methods", out)

# ARQ-07 TESTING
log("\n[ARQ-07] ARQUITETO DE TESTES")
rc, out, _ = run("find tests/e2e -name '*.spec.ts' | wc -l")
ev19, _ = save_evidence("ARQ-07", "e2e specs", out)
e2e_count = int(out.strip() or 0)
if e2e_count < 37:
    finding("ARQ-07", "Testes", "E2E", f">=37 specs E2E", f"{e2e_count} specs", "MEDIUM", ev19, "Adicionar specs")

rc, out, _ = run("find backend/tests -name '*.spec.ts' -o -name '*.test.ts' | wc -l")
ev18, _ = save_evidence("ARQ-07", "backend test files", out)
be_test_count = int(out.strip() or 0)
if be_test_count < 10:
    finding("ARQ-07", "Testes", "Backend", f">=10 arquivos de teste", f"{be_test_count}", "MEDIUM", ev18, "Adicionar testes")

# ARQ-08 SOCRATES
log("\n[ARQ-08] SOCRATES ARQUITETURAL")
rc, out, _ = run("find apps/web/src/modules -type d -name 'domain' | wc -l")
domain_modules = int(out.strip() or 0)
ev20, _ = save_evidence("ARQ-08", "domain modules count", f"{domain_modules}/{fe_modules}")
if domain_modules < fe_modules * 0.3:
    finding("ARQ-08", "Arquitetura", "Clean Arch FE", f"'Parcial' = >=30%", f"{domain_modules}/{fe_modules} = {domain_modules/fe_modules*100:.0f}%", "MEDIUM", ev20, "Refinar definicao")

rc, out, _ = run("grep -rn 'queryRaw' backend/src/modules/ --include='*.ts'")
ev21, _ = save_evidence("ARQ-08", "queryRaw classification", out)
if out.strip():
    finding("ARQ-08", "Arquitetura", "queryRaw", "Criterio claro para 'legitimo'", f"Ocorrencias sem classificacao formal", "MEDIUM", ev21, "Criar documento de classificacao")

stubs_modules = ["backups", "github_tools", "configuracoes", "terminal", "comm", "crypto_config", "analytics", "dashboard"]
ev22, _ = save_evidence("ARQ-08", "stub modules", str(stubs_modules))
finding("ARQ-08", "Arquitetura", "Stub Definition", "8 modulos com stubs", "Definicao de 'completo' vs 'stub' nao formalizada", "MEDIUM", ev22, "Documentar criterios de completude")

# ARQ-09 POPPER
log("\n[ARQ-09] POPPER ARQUITETURAL")
for doc_name, content, expected in [
    ("AGENTS.md", base["agents_md"], base["module_count"]),
    ("AGENTS.md", base["agents_md"], base["models"]),
    ("CANONICAL.md", base["canonical_md"], base["module_count"]),
    ("CANONICAL.md", base["canonical_md"], base["models"]),
]:
    if str(expected) not in content:
        finding("ARQ-09", doc_name, "Sync", f"{doc_name} contem {expected}", f"{expected} nao encontrado", "HIGH", None, f"Atualizar {doc_name}")

if base["local_commit"] != base["vps_commit"]:
    finding("ARQ-09", "VPS", "Sync", "VPS sincronizada com GitHub", f"VPS: {base['vps_commit']} vs LOCAL: {base['local_commit']}", "MEDIUM", None, "git pull na VPS")

# ARQ-10 FORENSE
log("\n[ARQ-10] FORENSE ARQUITETURAL")
if base["local_commit"] == base["github_commit"]:
    log("  [OK] Local == GitHub")
else:
    finding("ARQ-10", "Sync", "GitHub", "Local == GitHub", "DIVERGENCIA", "HIGH", None, "git push")

if base["models"] == base["db_tables"]:
    log("  [OK] Models == DB Tables")
else:
    finding("ARQ-10", "Sync", "DB", "Models == DB Tables", f"{base['models']} != {base['db_tables']}", "HIGH", None, "Sincronizar")

if base["mc_count"] == base["module_count"]:
    log("  [OK] module_catalog == modules")
else:
    finding("ARQ-10", "Sync", "module_catalog", f"module_catalog == {base['module_count']}", f"{base['mc_count']}", "HIGH", None, "Sincronizar")

vault_cp = f"{VAULT}/checkpoints/OrthoPlus-Checkpoint-{TODAY}.md"
if os.path.exists(vault_cp):
    with open(vault_cp) as f:
        vault_content = f.read()
    if base["local_commit"] in vault_content:
        log("  [OK] TSi-Vault sincronizado")
    else:
        finding("ARQ-10", "Sync", "TSi-Vault", "TSi-Vault tem commit atual", "DESATUALIZADO", "HIGH", None, "Atualizar checkpoint")
else:
    finding("ARQ-10", "Sync", "TSi-Vault", "TSi-Vault checkpoint existe", "NAO ENCONTRADO", "HIGH", None, "Criar checkpoint")

omk_path = f"{PROJECT}/.omk/memory/state-{TODAY}.json"
if os.path.exists(omk_path):
    with open(omk_path) as f:
        omk_content = f.read()
    if base["local_commit"] in omk_content:
        log("  [OK] OMK memory sincronizada")
    else:
        finding("ARQ-10", "Sync", "OMK", "OMK tem commit atual", "DESATUALIZADO", "HIGH", None, "Atualizar OMK")

refs = re.findall(r'`([^`]+\.(md|json|tsx?|prisma|yaml|yml))`', base["prompt_md"])
ev23, _ = save_evidence("ARQ-10", "prompt references", str(len(refs)))
if len(refs) < 20:
    finding("ARQ-10", "PROMPT", "References", f">=20 referencias explicitas", f"{len(refs)} referencias", "MEDIUM", ev23, "Expandir referencias")

# RELATORIO
log("\n" + "="*70)
log("RELATORIO FORENSE ARQUITETURAL")
log("="*70)

severity_counts = defaultdict(int)
for f in findings:
    severity_counts[f['severity']] += 1

total = len(findings)
log(f"\nAgentes: 10 | Evidencias: {evidence_count} | Findings: {total}")
for sev in ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']:
    if severity_counts[sev] > 0:
        log(f"  {sev}: {severity_counts[sev]}")

report = {
    "meta": {
        "date": TODAY,
        "time": datetime.datetime.now().strftime("%H:%M:%S"),
        "commit": base["local_commit"],
        "agents": 10,
        "methodology": "Socratic + Popperian + Forensic",
        "evidence_count": evidence_count,
        "evidence_dir": EV_DIR
    },
    "environments": {
        "local": base["local_commit"],
        "github": base["github_commit"],
        "vps": base["vps_commit"]
    },
    "metrics": {
        "modules": base["module_count"],
        "models": base["models"],
        "schemas": base["schema_count"],
        "routes": base["route_count"],
        "workers": base["worker_count"],
        "db_tables": base["db_tables"],
        "module_catalog": base["mc_count"],
        "clinic_modules": base["cm_count"]
    },
    "findings": findings,
    "severity_counts": dict(severity_counts)
}

json_path = f"{QA_DIR}/relatorio-forense-arquitetural-{TODAY}.json"
with open(json_path, "w") as f:
    json.dump(report, f, indent=2)

md_path = f"{QA_DIR}/relatorio-forense-arquitetural-{TODAY}-RESUMO.md"
with open(md_path, "w") as f:
    f.write(f"# Relatorio Forense Arquitetural\n\n**Data:** {TODAY}\n**Commit:** `{base['local_commit']}`\n**Agentes:** 10\n**Evidencias:** {evidence_count}\n\n## Resumo\n\n| Metrica | Valor |\n|---------|-------|\n| Findings | {total} |\n| CRITICAL | {severity_counts.get('CRITICAL', 0)} |\n| HIGH | {severity_counts.get('HIGH', 0)} |\n| MEDIUM | {severity_counts.get('MEDIUM', 0)} |\n| LOW | {severity_counts.get('LOW', 0)} |\n\n## Findings\n\n")
    for i, fn in enumerate(findings, 1):
        f.write(f"### [{i}] [{fn['severity']}] {fn['agent']}\n- **Doc:** {fn['doc']}::{fn['section']}\n- **Claim:** {fn['claim']}\n- **Reality:** {fn['reality']}\n- **Action:** {fn['action']}\n\n")
    f.write(f"---\n\n**JSON:** `{json_path}`\n**EV:** `{EV_DIR}`\n")

log(f"\nJSON: {json_path}")
log(f"MD:   {md_path}")
log(f"EV:   {EV_DIR}")
log("="*70)

if __name__ == "__main__":
    pass
