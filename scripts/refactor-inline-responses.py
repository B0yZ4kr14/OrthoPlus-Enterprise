import re
import os
import glob

MODULES_DIR = "/home/b0yz4kr14/Projects/OrthoPlus-Enterprise/backend/src/modules"
TARGET_MODULES = ["fidelidade", "inadimplencia", "lgpd", "nfe", "orcamentos",
                  "procedimentos", "split_pagamento", "tiss", "ia_radiografia"]

pattern = re.compile(
    r'res\.status\((\d+)\)\.json\(\{\s*error:\s*"([^"]+)"\s*\}\);\s*return;',
    re.MULTILINE,
)

def add_errors_import(content):
    if 'import { Errors } from "@/middleware/errorHandler"' in content:
        return content
    if 'from "@/middleware/errorHandler"' in content:
        content = re.sub(
            r'import \{([^}]+)\} from "@/middleware/errorHandler";',
            lambda m: f'import {{{m.group(1).strip()}, Errors}} from "@/middleware/errorHandler";',
            content)
        return content
    lines = content.split("\n")
    import_idx = 0
    for i, line in enumerate(lines):
        if line.startswith("import "):
            import_idx = i + 1
    lines.insert(import_idx, 'import { Errors } from "@/middleware/errorHandler";')
    return "\n".join(lines)

def map_status(status_code, message):
    if status_code == "400":
        return f'throw Errors.validation("{message}");'
    if status_code == "401":
        return f'throw Errors.unauthorized("{message}");'
    if status_code == "403":
        return f'throw Errors.forbidden("{message}");'
    if status_code == "404":
        if " not found" in message.lower():
            resource = message.replace(" not found", "").replace(" not Found", "").strip()
            return f'throw Errors.notFound("{resource}");'
        return f'throw Errors.notFound("{message}");'
    if status_code == "409":
        return f'throw Errors.conflict("{message}");'
    if status_code == "412":
        return f'throw Errors.conflict("{message}");'
    if status_code == "500":
        return f'throw Errors.internal("{message}");'
    return f'throw Errors.internal("{message}");'

def process_file(path):
    with open(path, "r") as f:
        content = f.read()
    count = 0
    def repl(m):
        nonlocal count
        count += 1
        return map_status(m.group(1), m.group(2))
    new_content = pattern.sub(repl, content)
    if count > 0:
        new_content = add_errors_import(new_content)
        with open(path, "w") as f:
            f.write(new_content)
        print(f"  {path}: {count}")
    return count

total = 0
for mod in TARGET_MODULES:
    module_dir = os.path.join(MODULES_DIR, mod)
    if not os.path.isdir(module_dir):
        continue
    for root, dirs, files in os.walk(module_dir):
        for fname in files:
            if not fname.endswith(".ts"):
                continue
            if "router" in fname or "schema" in fname or "test" in fname:
                continue
            fpath = os.path.join(root, fname)
            total += process_file(fpath)

print(f"\nTotal: {total}")
