# PLAYBOOK-FE.md
# Procedimentos do Dominio Frontend

## Comandos Padrao

### Contar Rotas
grep -o 'path="[^"]*"' apps/web/src/routes/AppRoutes.tsx | wc -l

### Verificar Lazy Imports
python3 -c "
import re, os
with open('apps/web/src/routes/AppRoutes.tsx') as f:
    content = f.read()
imports = re.findall(r'import\\([\"\'](@[^\"\']+)[\"\']\\)', content)
missing = []
for imp in imports:
    fp = imp.replace('@/', 'apps/web/src/')
    if not any(os.path.exists(fp + ext) for ext in ['.tsx', '.ts', '/index.tsx', '/index.ts']):
        missing.append(imp)
print('Missing:', missing)
"

### Verificar Build
cd apps/web && pnpm run build 2>&1 | tail -10

### Verificar Type Errors
cd apps/web && npx tsc --noEmit 2>&1 | head -20

### Verificar as any
grep -rn "as any" apps/web/src/ | wc -l

### Verificar ts-ignore
grep -rn "ts-ignore" apps/web/src/ | wc -l
