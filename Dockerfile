# Ortho+ Docker Image — Monorepo pnpm build
# Desenvolvido por TSI Telecom © 2025

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar pnpm
RUN npm install -g pnpm@10.33.0

# Copiar arquivos de configuração raiz
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# Copiar package.json de todos os workspaces para cache eficiente
COPY apps/web/package.json ./apps/web/
COPY backend/package.json ./backend/
COPY shared-types/package.json ./shared-types/
COPY categories/@orthoplus/admin-devops/package.json ./categories/@orthoplus/admin-devops/
COPY categories/@orthoplus/core/packages/hooks/package.json ./categories/@orthoplus/core/packages/hooks/
COPY categories/@orthoplus/core/packages/types/package.json ./categories/@orthoplus/core/packages/types/
COPY categories/@orthoplus/core/packages/ui/package.json ./categories/@orthoplus/core/packages/ui/
COPY categories/@orthoplus/core/packages/utils/package.json ./categories/@orthoplus/core/packages/utils/

# Instalar dependências (incluindo workspace links)
RUN pnpm install --frozen-lockfile

# Copiar código fonte completo
COPY . .

# VITE_ variables must be available at build time (they are embedded by Vite)
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Build da aplicação via turbo (builda shared-types, packages e web)
RUN pnpm run build

# Stage 2: Serve com nginx
FROM nginx:1.25-alpine

# Copiar configuração nginx para SPA routing (try_files, gzip, cache headers)
COPY nginx-frontend.conf /etc/nginx/conf.d/default.conf

# Copiar build do stage anterior para o nginx
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

# Expor porta padrão do nginx
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Iniciar nginx
CMD ["nginx", "-g", "daemon off;"]
