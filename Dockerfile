FROM node:20-slim AS base

FROM base AS deps
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_APP_URL=http://localhost:3000
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV POSTGRES_URL="postgresql://dummy:dummy@localhost:5432/dummy"
ENV NEXTAUTH_SECRET="dummy-secret-for-build"
ENV RESEND_API_KEY="re_dummy_key_for_build"
ENV STRIPE_SECRET_KEY="sk_test_dummy_key_for_build"

RUN rm -rf .next

RUN npm run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN groupadd --system --gid 1001 nodejs
RUN useradd --system --uid 1001 nextjs

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /home/nextjs/.npm/_logs && chown -R nextjs:nodejs /home/nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/email-templates ./email-templates
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER nextjs

# Railway will set PORT dynamically (usually 8080)
EXPOSE 8080

ENV HOSTNAME="0.0.0.0"

# Run Next.js directly (not via npm) for proper signal handling
CMD ["node", "node_modules/next/dist/bin/next", "start"] 