# ─────────────────────────────────────────────────────────────────────────────
# PulseEarth — Multi-Stage Production Dockerfile
# Stage 1: deps      Install production + dev deps
# Stage 2: builder   Build Next.js standalone output
# Stage 3: runner    Minimal Alpine image (~150 MB)
#
# Requires: output: 'standalone' in next.config.ts (already configured)
# ─────────────────────────────────────────────────────────────────────────────

# ── Stage 1: Install dependencies ────────────────────────────────────────────
FROM node:20-alpine AS deps

# libc6-compat required for some native Node modules on Alpine
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy lockfile first to maximise layer caching
COPY package.json package-lock.json ./

# Install all deps (including devDependencies — needed for build)
RUN npm ci


# ── Stage 2: Build application ────────────────────────────────────────────────
FROM node:20-alpine AS builder

RUN apk add --no-cache libc6-compat

WORKDIR /app

# Bring in installed node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source
COPY . .

# Next.js collects anonymous telemetry — disable in CI/production
ENV NEXT_TELEMETRY_DISABLED=1

# Build arguments — passed at build time for public env vars only.
# SECRET keys (ANTHROPIC_API_KEY, AWS_*, etc.) must NOT be build args;
# they are runtime env vars injected via docker run / compose.
ARG NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}

# Produce a standalone build (smallest possible runtime image)
RUN npm run build


# ── Stage 3: Production runner ────────────────────────────────────────────────
FROM node:20-alpine AS runner

RUN apk add --no-cache libc6-compat

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create a non-root system user + group for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nextjs

# Copy only the minimal standalone output from the builder
# .next/standalone contains the full server + required node_modules
COPY --from=builder /app/public              ./public
COPY --from=builder --chown=nextjs:nodejs \
     /app/.next/standalone                   ./
COPY --from=builder --chown=nextjs:nodejs \
     /app/.next/static                       ./.next/static

# Drop to non-root user
USER nextjs

EXPOSE 3000

# Runtime environment variables are provided via:
#   docker run --env-file .env.local ...
#   OR docker compose (see docker-compose.yml)
#
# Required at runtime:
#   ANTHROPIC_API_KEY
#   AWS_REGION
#   AWS_ACCESS_KEY_ID
#   AWS_SECRET_ACCESS_KEY
#   DYNAMODB_TABLE_NAME
#
# Optional:
#   GEMINI_API_KEY
#   HUGGING_FACE_TOKEN
#   CRON_SECRET
#   NEXT_PUBLIC_APP_URL

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3000/ || exit 1

CMD ["node", "server.js"]
