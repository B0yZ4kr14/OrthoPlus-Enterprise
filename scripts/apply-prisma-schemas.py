#!/usr/bin/env python3
"""
Script de migração: injeta @@schema nos models do Prisma schema
com base nas migrations SQL manuais em backend/migrations/.

Uso:
  python3 scripts/apply-prisma-schemas.py
"""

import re
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
MIGRATIONS_DIR = PROJECT_ROOT / "backend" / "migrations"
SCHEMA_PATH = PROJECT_ROOT / "backend" / "prisma" / "schema.prisma"

# Mapeamentos manuais para casos onde o nome do model difere da tabela SQL
MANUAL_MAPPINGS = {
    "appointments": ("eventos", "pacientes"),
    "blocked_times": ("eventos", "pacientes"),
    "budgets": ("orcamentos", "financeiro"),
    "caixa_incidentes": ("caixa_movimentos", "pdv"),
    "campaign_sends": ("campanhas", "pacientes"),
    "campaign_templates": ("campanhas", "pacientes"),
    "campaign_triggers": ("campanhas", "pacientes"),
    "campanha_envios": ("campanhas", "pacientes"),
    "campanhas_inadimplencia": ("campanhas", "pacientes"),
    "campanhas_marketing": ("campanhas", "pacientes"),
    "clinics": ("clinicas", "configuracoes"),
    "cloud_storage_configs": ("parametros_sistema", "configuracoes"),
    "collection_actions": ("campanhas", "pacientes"),
    "collection_automation_config": ("parametros_sistema", "configuracoes"),
    "contrato_anexos": ("anexos", "pep"),
    "contrato_templates": ("convenios", "faturamento"),
    "contratos": ("convenios", "faturamento"),
    "crypto_payments": ("crypto_transacoes", "financeiro"),
    "crypto_price_alerts": ("crypto_transacoes", "financeiro"),
    "crypto_candlestick_data": ("crypto_transacoes", "financeiro"),
    "dentist_schedules": ("eventos", "pacientes"),
    "estoque_pedidos": ("estoque_movimentacoes", "inventario"),
    "estoque_pedidos_config": ("parametros_sistema", "configuracoes"),
    "estoque_pedidos_itens": ("inventario_itens", "inventario"),
    "event_store": ("eventos", "pacientes"),
    "fechamento_caixa": ("caixa_movimentos", "pdv"),
    "financial_categories": ("categorias", "financeiro"),
    "financial_transactions": ("fluxo_caixa", "financeiro"),
    "fiscal_config": ("parametros_sistema", "configuracoes"),
    "funcionarios": ("usuarios", "configuracoes"),
    "nfce_carta_correcao": ("nfce", "pdv"),
    "nfce_contingencia": ("nfce", "pdv"),
    "nfce_emitidas": ("nfce", "pdv"),
    "nfce_inutilizacao": ("nfce", "pdv"),
    "odontogramas": ("odontograma", "pep"),
    "orcamentos": ("convenios", "faturamento"),
    "pdv_produtos": ("produtos", "inventario"),
    "pdv_vendas": ("vendas", "pdv"),
    "pep_anexos": ("anexos", "pep"),
    "pep_evolucoes": ("evolucoes", "pep"),
    "pep_odontograma": ("odontograma", "pep"),
    "pep_odontograma_data": ("odontograma", "pep"),
    "pep_odontograma_history": ("odontograma", "pep"),
    "pep_tratamentos": ("tratamentos", "pep"),
    "permission_audit_logs": ("audit_logs", "configuracoes"),
    "produto_categorias": ("categorias_produto", "inventario"),
    "produto_fornecedores": ("fornecedores", "inventario"),
    "split_pagamento_regras": ("split_pagamentos", "financeiro"),
    "split_pagamento_transacoes": ("split_pagamentos", "financeiro"),
    "tabela_tiss": ("guias_tiss", "faturamento"),
    "users": ("usuarios", "configuracoes"),
    "venda_itens": ("venda_itens", "pdv"),
    "venda_pagamentos": ("venda_pagamentos", "pdv"),
}


def extract_sql_mappings():
    mapping = {}
    for sql_file in sorted(MIGRATIONS_DIR.glob("*.sql")):
        content = sql_file.read_text(encoding="utf-8")
        for match in re.finditer(r'CREATE TABLE\s+([a-z_]+)\.([a-z_]+)', content, re.IGNORECASE):
            mapping[match.group(2).lower()] = match.group(1).lower()
    return mapping


def apply_schemas():
    sql_mapping = extract_sql_mappings()
    schema_text = SCHEMA_PATH.read_text(encoding="utf-8")

    # Primeiro: remover qualquer @@schema malformado existente
    schema_text = re.sub(r'\n\s*@@schema\("[^"]+"\)\}?', '', schema_text)

    models = []
    idx = 0
    while True:
        m = re.search(r'^model\s+(\w+)\s*\{', schema_text[idx:], re.MULTILINE)
        if not m:
            break
        start = idx + m.start()
        name = m.group(1)
        brace_count = 0
        end = start
        for i in range(start, len(schema_text)):
            if schema_text[i] == '{':
                brace_count += 1
            elif schema_text[i] == '}':
                brace_count -= 1
                if brace_count == 0:
                    end = i + 1
                    break
        models.append({"name": name, "start": start, "end": end, "close_brace": end - 1})
        idx = end

    changed = 0
    skipped = []

    for model in reversed(models):
        name = model["name"]
        if name in MANUAL_MAPPINGS:
            _, schema = MANUAL_MAPPINGS[name]
        else:
            snake = re.sub(r'(?<!^)(?=[A-Z])', '_', name).lower()
            schema = sql_mapping.get(snake)
            if not schema:
                alt = snake[:-1] if snake.endswith('s') else snake + 's'
                schema = sql_mapping.get(alt)

        if not schema:
            skipped.append(name)
            continue

        # Inserir @@schema antes do }, em uma linha própria
        pos = model["close_brace"]
        line_prefix = "\n  @@schema(\"" + schema + "\")\n"
        schema_text = schema_text[:pos] + line_prefix + schema_text[pos:]
        changed += 1
        print(f"[OK] {name} -> {schema}")

    SCHEMA_PATH.write_text(schema_text, encoding="utf-8")
    print(f"\nTotal alterados: {changed}/{len(models)}")
    if skipped:
        print(f"\nNão mapeados ({len(skipped)}):")
        for s in sorted(skipped):
            print(f"  - {s}")


if __name__ == "__main__":
    apply_schemas()
