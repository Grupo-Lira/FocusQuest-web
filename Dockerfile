# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependências
RUN npm ci

# Copiar código-fonte
COPY . .

# Build Next.js
RUN npm run build

# Runtime stage
FROM node:20-alpine

WORKDIR /app

# Copiar dependências (apenas produção)
COPY package*.json ./
RUN npm ci --only=production

# Copiar build otimizado
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

# Exposer porta
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:3000 || exit 1

# Start aplicação
CMD ["npm", "start"]
