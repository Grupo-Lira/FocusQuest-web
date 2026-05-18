# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

ARG NEXT_PUBLIC_API_URL=http://localhost:4000
ARG SOCKET_URL=http://localhost:4000
ARG BACKEND_INTERNAL_URL=http://backend:4000

ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV SOCKET_URL=${SOCKET_URL}
ENV BACKEND_INTERNAL_URL=${BACKEND_INTERNAL_URL}

# Copiar package files
COPY package*.json ./

# Instalar dependências
RUN npm ci

# Copiar código-fonte
COPY . .

# Build Next.js
RUN npm run build

# Remove dependências de desenvolvimento da árvore final.
RUN npm prune --omit=dev

# Runtime stage
FROM node:20-alpine

WORKDIR /app

ARG NEXT_PUBLIC_API_URL=http://localhost:4000
ARG SOCKET_URL=http://localhost:4000
ARG BACKEND_INTERNAL_URL=http://backend:4000

ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV SOCKET_URL=${SOCKET_URL}
ENV BACKEND_INTERNAL_URL=${BACKEND_INTERNAL_URL}

# Copiar apenas os artefatos necessários para execução
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts

# Exposer porta
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:3000 || exit 1

# Start aplicação exposta para fora do container
CMD ["npm", "run", "start", "--", "-H", "0.0.0.0", "-p", "3000"]
