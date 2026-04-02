# Ortho+ Backend - Node.js API Gateway
FROM node:20-alpine AS builder

WORKDIR /app

# Install all dependencies (including devDependencies for TypeScript compilation)
COPY package*.json ./
RUN npm ci

# Copy source code and prisma schema
COPY . .

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Copy package files and install production-only dependencies
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev

# Copy build output and prisma schema
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Generate Prisma client for production
RUN npx prisma generate

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Create logs directory for Winston file transports
RUN mkdir -p /app/logs && chown nodejs:nodejs /app/logs

# Set ownership
RUN chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3005

ENV NODE_ENV=production \
    PORT=3005

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3005/health', (r) => {if (r.statusCode !== 200) throw new Error('Health check failed')})"

CMD ["node", "dist/index.js"]
