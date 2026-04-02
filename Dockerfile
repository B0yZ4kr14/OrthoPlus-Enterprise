# Ortho+ Docker Image
# Desenvolvido por TSI Telecom © 2025

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar todas as dependências (incluindo devDependencies para o build)
RUN npm ci --legacy-peer-deps

# Copiar código fonte
COPY . .

# VITE_ variables must be available at build time (they are embedded by Vite)
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Build da aplicação
RUN npm run build

# Stage 2: Serve com nginx
FROM nginx:1.25-alpine

# Copiar configuração nginx para SPA routing (try_files, gzip, cache headers)
COPY nginx-frontend.conf /etc/nginx/conf.d/default.conf

# Copiar build do stage anterior para o nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Expor porta padrão do nginx
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Iniciar nginx
CMD ["nginx", "-g", "daemon off;"]
