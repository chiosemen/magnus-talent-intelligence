FROM node:20-alpine AS deps
WORKDIR /app
COPY magnus-talent-agent/pnpm-lock.yaml magnus-talent-agent/package.json ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable pnpm
COPY --from=deps /app/node_modules ./node_modules
COPY magnus-talent-agent ./
CMD ["pnpm", "worker"]
