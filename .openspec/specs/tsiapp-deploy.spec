---
apiVersion: openspec.io/v1
kind: DeploymentSpec
metadata:
  name: orthoplus-enterprise
  stack: tsiapp
  subdomain: orthoplus.tsiapp.io
  updated: 2026-06-12
spec:
  infrastructure:
    host: /opt/tsi-stack/apps/orthoplus-enterprise
    network: tsi-network
    reverseProxy: traefik-v3
    ssl: letsencrypt-http01
    ipPublic: 177.10.116.10
    ipTailscale: 100.77.216.67
  secrets:
    provider: infisical-ce
    endpoint: https://vault.tsiapp.io
    project: orthoplus
    env: production
    protocol: vault-get.sh
  containers:
    - name: tsi-orthoplus-app
      image: registry.tsiapp.io/orthoplus-enterprise:latest
      port: 3000
      labels:
        - traefik.enable=true
        - traefik.http.routers.orthoplus.rule=Host(`orthoplus.tsiapp.io`)
        - traefik.http.routers.orthoplus.entrypoints=websecure
        - traefik.http.routers.orthoplus.tls.certresolver=letsencrypt
        - traefik.http.routers.orthoplus.tls=true
        - traefik.http.services.orthoplus.loadbalancer.server.port=3000
        - traefik.docker.network=tsi-network
      network: tsi-network
      volumes:
        - tsi_orthoplus_uploads:/app/uploads
        - /opt/tsi-stack/apps/orthoplus-enterprise/config:/app/config:ro
      healthcheck:
        test: ["CMD", "wget", "-q", "--spider", "http://localhost:3000/health"]
        interval: 15s
        timeout: 5s
        retries: 3
        start_period: 30s
      deploy:
        resources:
          limits:
            cpus: '1.5'
            memory: 1G
    - name: tsi-orthoplus-db
      image: postgres:16-alpine
      port: 5432
      network: tsi-network
      volumes:
        - tsi_orthoplus_postgres_data:/var/lib/postgresql/data
      healthcheck:
        test: ["CMD-SHELL", "pg_isready -U $${DB_USER:-orthoplus}"]
        interval: 10s
        timeout: 5s
        retries: 5
      deploy:
        resources:
          limits:
            cpus: '1.0'
            memory: 512M
    - name: tsi-orthoplus-redis
      image: redis:7-alpine
      port: 6379
      network: tsi-network
      volumes:
        - tsi_orthoplus_redis_data:/data
      healthcheck:
        test: ["CMD", "redis-cli", "ping"]
        interval: 10s
        timeout: 3s
        retries: 5
      deploy:
        resources:
          limits:
            cpus: '0.25'
            memory: 128M
  volumes:
    - tsi_orthoplus_uploads
    - tsi_orthoplus_postgres_data
    - tsi_orthoplus_redis_data
  dependencies:
    - name: traefik
      path: /opt/tsi-stack/global/traefik
    - name: infisical
      path: /opt/tsi-stack/vault/infisical
  dns:
    provider: cloudflare
    zone: tsiapp.io
    proxied: false
    type: A
    value: 177.10.116.10

  secretsProvider:
    name: infisical-ce
    version: latest
    image: infisical/infisical:latest-postgres
    repoOfficial: /Projects/Infisical
    docsOfficial: /Projects/Infisical/docs-scraped
    composeOfficial: /Projects/Infisical/docker-compose.prod.yml
    envVarsDoc: https://infisical.com/docs/self-hosting/configuration/envars
    requiredEnvVars:
      - ENCRYPTION_KEY
      - AUTH_SECRET
      - DB_CONNECTION_URI
      - REDIS_URL
      - SITE_URL
    recommendedEnvVars:
      - HOST=0.0.0.0
      - PORT=8080
      - TELEMETRY_ENABLED=false
    authMethods:
      - universal-auth
      - oidc-auth
      - service-token (deprecated)
      - api-key (deprecated)
    apiEndpoints:
      secretsRead: GET /api/v3/secrets?environment=production&workspaceId=orthoplus
      secretsCreate: POST /api/v3/secrets
      universalAuthLogin: POST /api/v1/auth/universal-auth/login
      oidcAuthLogin: POST /api/v1/auth/oidc-auth/login
    githubActions:
      action: Infisical/secrets-action
      auth: OIDC
      doc: https://infisical.com/docs/integrations/cicd/githubactions
    serviceTokenPath: /opt/tsi-stack/vault/.agent-access/orthoplus-agent.token
    vaultUrl: https://vault.tsiapp.io
    vaultProject: orthoplus
    vaultEnvironment: production
  gitnexus:
    indexed: true
    endpoint: https://gitnexus.tsiapp.io
    auth: basicauth
    username: tsiadmin
    repoPath: /Projects/OrthoPlus-Enterprise
    workspacePath: /workspace/OrthoPlus-Enterprise
