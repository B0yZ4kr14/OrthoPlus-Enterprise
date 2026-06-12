## Context

O OrthoPlus Enterprise possui um arquivo `docker-compose.yml` em `/opt/tsi-stack/apps/orthoplus-enterprise` que já está razoavelmente alinhado com a TSiAPP Stack: usa rede `tsi-network`, containers com prefixo `tsi-orthoplus-*`, volumes com prefixo `tsi_orthoplus_*`, labels Traefik com `letsencrypt` e healthchecks. No entanto, o `README.md` do repositório local ainda descreve um path legado (`/opt/tsi-stack/orthoplus`), redes legadas (`tsi-stack-public`/`tsi-stack-internal`) e cert resolver `cloudflare`. Além disso, não existe `.agent-manifest.json` no workspace, e o spec OpenSpec em `.openspec/specs/tsiapp-deploy.spec` contém valores desatualizados (nome do container, imagem, volumes).

## Goals / Non-Goals

**Goals:**
- Tornar o `README.md` a fonte de verdade local consistente com o deploy real em `/opt/tsi-stack/apps/orthoplus-enterprise`.
- Atualizar o spec OpenSpec de deploy para refletir a infraestrutura real e as convenções da TSiAPP Stack.
- Criar `.agent-manifest.json` padronizado para agentes de IA descobrirem o workspace.
- Validar que todos os agent configs (`config.json`/`config.toml`) declarem `tsi-network` e o protocolo de secrets.

**Non-Goals:**
- Alterar código-fonte da aplicação, esquema de banco ou APIs.
- Reconfigurar produção diretamente (o deploy em `/opt/tsi-stack` é feito por processo separado).
- Mudar a imagem Docker de `registry.tsiapp.io/orthoplus-enterprise:latest` para outra tag (documentaremos a recomendação de fixar tag).

## Decisions

- **Usar `/opt/tsi-stack/apps/orthoplus-enterprise` como path canônico**: o diretório já existe e é o deploy real; o README legado com `/opt/tsi-stack/orthoplus` está incorreto.
- **Manter `tsi-network`**: o compose real já usa essa rede, e as convenções da stack a definem como rede externa obrigatória. Não introduziremos `tsi-stack-public`/`tsi-stack-internal`.
- **Usar `letsencrypt` como cert resolver no spec e no README**: as convenções da stack definem `letsencrypt` como padrão. O README legado mencionava `cloudflare`.
- **Criar `.agent-manifest.json` no padrão OTOBO**: incluir `project`, `generated_at`, `base_dir`, `production_deploy_note`, `docs_scraped` e lista de repositórios/submódulos relevantes.
- **Não migrar `.openspec/specs/` para `openspec/specs/`**: o spec existente permanece em `.openspec/specs/tsiapp-deploy.spec` por compatibilidade; o novo delta spec da change fica em `openspec/changes/.../specs/tsiapp-deploy/spec.md` e será aplicado ao spec principal na archive/sync.

## Risks / Trade-offs

- [Risk] O path `/opt/tsi-stack/apps/orthoplus-enterprise` pode diferir de expectativas de documentação antiga → Mitigação: validar contra o compose real.
- [Risk] A imagem `registry.tsiapp.io/orthoplus-enterprise:latest` viola a convenção de não usar `latest` → Mitigação: adicionar nota no README e no spec recomendando tag fixa, sem forçar mudança agora.
- [Risk] Agentes antigos podem ainda referenciar `tsi-stack-public` → Mitigação: atualizar README e spec, que são fontes de contexto para agentes.

## Migration Plan

1. Escrever proposal, design e specs da change.
2. Aplicar correções ao `README.md`, criar `.agent-manifest.json` e atualizar `.openspec/specs/tsiapp-deploy.spec`.
3. Arquivar a change e, se aplicável, sincronizar delta specs.
4. Validar consistência entre README, manifest, spec e compose real.

## Open Questions

- Nenhuma.
