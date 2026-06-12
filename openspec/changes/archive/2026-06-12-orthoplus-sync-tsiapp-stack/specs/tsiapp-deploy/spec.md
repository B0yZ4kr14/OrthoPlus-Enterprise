## MODIFIED Requirements

### Requirement: DeploymentSpec metadata
O spec de deploy DEVE identificar a aplicação pelo nome canônico `orthoplus-enterprise` e manter o subdomínio `orthoplus.tsiapp.io`.

#### Scenario: Metadata correta
- **WHEN** o spec é lido por agentes de IA ou ferramentas de deploy
- **THEN** `metadata.name` é `orthoplus-enterprise` e `metadata.subdomain` é `orthoplus.tsiapp.io`

### Requirement: Container principal do OrthoPlus
O container principal DEVE usar nome canônico `tsi-orthoplus-app`, imagem do registry interno, healthcheck, limits de recursos e labels Traefik na rede `tsi-network`.

#### Scenario: Definição do container web
- **WHEN** o `docker-compose.yml` é interpretado
- **THEN** existe um container `tsi-orthoplus-app` com imagem `registry.tsiapp.io/orthoplus-enterprise:latest`, porta `3000`, healthcheck para `/health`, limits de CPU/memória e labels Traefik apontando para `orthoplus.tsiapp.io` com cert resolver `letsencrypt` na rede `tsi-network`

### Requirement: Container de banco de dados
O banco de dados PostgreSQL DEVE ser declarado como dependência com healthcheck e volumes persistentes.

#### Scenario: Definição do container db
- **WHEN** o `docker-compose.yml` é interpretado
- **THEN** existe um container `tsi-orthoplus-db` com imagem `postgres:16-alpine`, healthcheck `pg_isready`, volume `tsi_orthoplus_postgres_data` e rede `tsi-network`

### Requirement: Container Redis
O cache Redis DEVE ser declarado como dependência com healthcheck e volume persistente.

#### Scenario: Definição do container redis
- **WHEN** o `docker-compose.yml` é interpretado
- **THEN** existe um container `tsi-orthoplus-redis` com imagem `redis:7-alpine`, healthcheck `redis-cli ping`, volume `tsi_orthoplus_redis_data` e rede `tsi-network`

### Requirement: Volumes nomeados
Os dados persistentes DEVEm usar volumes nomeados com prefixo `tsi_orthoplus_`.

#### Scenario: Lista de volumes
- **WHEN** o `docker-compose.yml` é interpretado
- **THEN** existem volumes `tsi_orthoplus_uploads`, `tsi_orthoplus_postgres_data` e `tsi_orthoplus_redis_data`

### Requirement: Secrets provider
O provider de secrets DEVE ser o Infisical CE com token de serviço armazenado em path canônico e projeto `orthoplus`.

#### Scenario: Configuração do Infisical
- **WHEN** agentes precisam ler secrets do OrthoPlus
- **THEN** o service token está em `/opt/tsi-stack/vault/.agent-access/orthoplus-agent.token`, a URL do vault é `https://vault.tsiapp.io`, o projeto é `orthoplus` e o ambiente é `production`

## ADDED Requirements

### Requirement: Recomendação de tag fixa para imagens
A documentação DEVE recomendar o uso de tags fixas para imagens Docker em produção, mesmo quando o registry interno publica `latest`.

#### Scenario: README e spec documentam a convenção
- **WHEN** um operador consulta o README ou spec de deploy
- **THEN** há uma nota explícita para fixar a tag da imagem `registry.tsiapp.io/orthoplus-enterprise` em produção e nunca confiar implicitamente em `latest`
