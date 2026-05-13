# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm and prisma for build
RUN npm install -g pnpm@10.33.0 prisma@6.19.3

# Copy root configurations
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy packages needed for build
COPY backend/package.json ./backend/
COPY shared-types/package.json ./shared-types/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY backend ./backend
COPY shared-types ./shared-types

# Build shared types first, then backend
RUN pnpm --filter @orthoplus/shared-types run build
# Generate Prisma client before TypeScript build (needs types)
RUN pnpm exec prisma generate --schema=backend/prisma/schema.prisma
RUN pnpm --filter orthoplus-backend run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Install pnpm and prisma for production
RUN npm install -g pnpm@10.33.0 prisma@6.19.3

# Copy root configurations and lockfile
COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./

# Copy backend and shared-types package files
COPY --from=builder /app/backend/package.json ./backend/
COPY --from=builder /app/shared-types/package.json ./shared-types/package.json

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile

# Copy build outputs
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/shared-types/dist ./shared-types/dist

# Also copy prisma schema if needed for production (usually yes)
COPY --from=builder /app/backend/prisma ./backend/prisma
# Generate prisma client in production stage
RUN cd backend && pnpm prisma generate

WORKDIR /app/backend
EXPOSE 3005
CMD ["node", "dist/index.js"]
