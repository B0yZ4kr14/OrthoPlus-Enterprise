## 1. Documentação de Deploy

- [x] 1.1 Atualizar `README.md` com path canônico `/opt/tsi-stack/apps/orthoplus-enterprise`, rede `tsi-network` e cert resolver `letsencrypt`.
- [x] 1.2 Corrigir labels Traefik no README para refletir `traefik.docker.network=tsi-network` e `letsencrypt`.
- [x] 1.3 Atualizar convenções de nomenclatura no README para prefixos `tsi-` e `tsi_`.
- [x] 1.4 Atualizar comandos de deploy no README para `cd /opt/tsi-stack/apps/orthoplus-enterprise`.
- [x] 1.5 Adicionar nota sobre fixação de tag da imagem Docker.

## 2. Manifesto do Workspace

- [x] 2.1 Criar `.agent-manifest.json` com metadados do projeto, nota de deploy e referências.

## 3. Especificação OpenSpec

- [x] 3.1 Atualizar `.openspec/specs/tsiapp-deploy.spec` com `metadata.name: orthoplus-enterprise`.
- [x] 3.2 Atualizar containers no spec para `tsi-orthoplus-app`, `tsi-orthoplus-db` e `tsi-orthoplus-redis`.
- [x] 3.3 Adicionar volumes `tsi_orthoplus_uploads`, `tsi_orthoplus_postgres_data` e `tsi_orthoplus_redis_data` ao spec.
- [x] 3.4 Adicionar recomendação de tag fixa para imagem no spec.

## 4. Validação

- [x] 4.1 Verificar que README, manifest, spec e compose real estão consistentes.
- [x] 4.2 Confirmar que nenhum secret está hardcoded nos arquivos editados.
