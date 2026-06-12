## Why

A documentação local de deploy do OrthoPlus Enterprise (`README.md`) e o spec OpenSpec de deploy (`.openspec/specs/tsiapp-deploy.spec`) estão desalinhados com a estrutura canônica da TSiAPP Stack. O README referencia path legado (`/opt/tsi-stack/orthoplus`), redes Docker legadas (`tsi-stack-public`/`tsi-stack-internal`) e cert resolver `cloudflare`, enquanto o deploy real em `/opt/tsi-stack/apps/orthoplus-enterprise` e as convenções da stack exigem `tsi-network`, labels `letsencrypt` e prefixos `tsi-`/`tsi_`. Esse desalinhamento pode induzir agentes de IA e operadores a erros de deploy, exposição de secrets e configuração de rede incorreta.

## What Changes

- Corrigir `README.md` para refletir o path canônico `/opt/tsi-stack/apps/orthoplus-enterprise`, rede `tsi-network`, cert resolver `letsencrypt` e convenções de nomenclatura `tsi-`/`tsi_`.
- Criar `.agent-manifest.json` com metadados do workspace, nota de deploy de produção e referências aos repos/documentação.
- Atualizar `.openspec/specs/tsiapp-deploy.spec` para alinhar nome do app (`orthoplus-enterprise`), imagem, containers, volumes, network e secrets provider com o compose real e convenções da TSiAPP Stack.
- Garantir que todos os agent configs existentes (`.kimi/config.json`, `.codex/config.toml`, `.opencode/config.json`, `.gemini/config.json`, `.zed/settings.json`) estejam consistentes com as regras da stack.

## Capabilities

### New Capabilities
- Nenhuma.

### Modified Capabilities
- `tsiapp-deploy`: atualizar o spec de infraestrutura para refletir path, network, labels, containers e volumes canônicos da TSiAPP Stack.

## Impact

- Documentação de deploy local (`README.md`).
- Especificação OpenSpec de deploy (`.openspec/specs/tsiapp-deploy.spec`).
- Manifesto do agente (`.agent-manifest.json`).
- Nenhuma alteração de código de aplicação, banco ou API.
