FROM node:20-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm@10.33.0
COPY package.json pnpm-workspace.yaml turbo.json ./
COPY tsconfig*.json ./ tailwind.config.ts ./
COPY backend/package.json backend/
COPY shared-types/package.json shared-types/
COPY apps/web/package.json apps/web/
COPY categories/@orthoplus/core/packages/*/package.json categories/@orthoplus/core/packages/*/
RUN pnpm install
COPY shared-types/ shared-types/
COPY apps/web/ apps/web/
COPY categories/@orthoplus/core/packages/ categories/@orthoplus/core/packages/
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN cd shared-types && pnpm run build
RUN ./apps/web/node_modules/.bin/tailwindcss -i apps/web/src/index.css -o apps/web/src/index.css --config tailwind.config.ts
RUN pnpm --filter @orthoplus/web run build

FROM nginx:1.25-alpine
RUN rm -rf /docker-entrypoint.d /etc/nginx/conf.d/default.conf && mkdir -p /var/cache/nginx /var/run /var/log/nginx && chown -R nginx:nginx /var/cache/nginx /var/run /var/log/nginx /usr/share/nginx/html && chmod -R 755 /usr/share/nginx/html && touch /var/run/nginx.pid && chown nginx:nginx /var/run/nginx.pid
COPY nginx-frontend.conf /etc/nginx/conf.d/default.conf
COPY --from=builder --chown=nginx:nginx /app/apps/web/dist /usr/share/nginx/html
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:8080/ || exit 1
USER nginx
CMD ["nginx", "-g", "daemon off;"]
