# ---- Build stage ----
FROM node:22-alpine AS build
WORKDIR /app

# Instala dependências primeiro (melhor cache)
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
# VITE_* são embutidas no build. Em CI/k8s passe via --build-arg ou .env.
ARG VITE_REPORTS_API_BASE_URL
ARG VITE_REPORTS_API_KEY
ENV VITE_REPORTS_API_BASE_URL=$VITE_REPORTS_API_BASE_URL \
    VITE_REPORTS_API_KEY=$VITE_REPORTS_API_KEY
RUN npm run build

# ---- Runtime stage (serve estático do dist em 8080) ----
FROM node:22-alpine AS runtime
WORKDIR /app

RUN npm i -g serve@14 \
    && adduser -D appuser

COPY --from=build /app/dist ./dist

USER appuser
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:8080/ | grep -qi "<!doctype html" || exit 1

CMD ["serve", "-s", "dist", "-l", "8080"]
