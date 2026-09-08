FROM node:22-alpine AS base

# ---- deps: install all dependencies (incl. devDependencies for build) ----
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# --ignore-scripts: the "postinstall" script runs `prisma generate`, which
# needs prisma/schema.prisma — not copied into the image until the "build"
# stage below, which calls `prisma generate` explicitly after COPY . .
RUN npm ci --ignore-scripts

# ---- build: generate Prisma client and build the Next.js app ----
# Also used directly (via `docker compose run`) to execute one-off
# `prisma migrate deploy` / `npm run db:seed` commands, since it still has
# the full node_modules, TypeScript source and the Prisma CLI available.
FROM base AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# ---- runtime: minimal standalone image, only serves the app ----
FROM base AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

COPY --from=build /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
