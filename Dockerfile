FROM ghcr.io/diced/prisma-binaries:4.7.x as prisma

FROM node:19-alpine as builder
WORKDIR /paperplane

# Install and run Turbo
COPY . .
RUN yarn global add turbo
RUN turbo prune --docker

FROM node:19-alpine as installer
WORKDIR /paperplane

# Prisma binary libraries
COPY --from=prisma /prisma-engines /prisma-engines
ENV PRISMA_QUERY_ENGINE_BINARY=/prisma-engines/query-engine \
  PRISMA_MIGRATION_ENGINE_BINARY=/prisma-engines/migration-engine \
  PRISMA_INTROSPECTION_ENGINE_BINARY=/prisma-engines/introspection-engine \
  PRISMA_FMT_BINARY=/prisma-engines/prisma-fmt \
  PRISMA_CLI_QUERY_ENGINE_TYPE=binary \
  PRISMA_CLIENT_ENGINE_TYPE=binary
RUN apk update \
  && apk add openssl1.1-compat

# Copy yarn executables
COPY .yarnrc.yml ./.yarnrc.yml
COPY .yarn ./.yarn

# Copy and install dependencies
COPY --from=builder /paperplane/out/json/ .
COPY --from=builder /paperplane/out/yarn.lock ./yarn.lock
RUN yarn install --immutable

# Build the application
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json
RUN yarn turbo run build

FROM node:19-alpine as runner
WORKDIR /paperplane

# Create user PaperPlane
RUN addgroup --system --gid 1639 paperplane
RUN adduser --system --uid 1639 paperplane

COPY --from=installer /paperplane/apps/web/next.config.js ./apps/web/next.config.js
COPY --from=installer /paperplane/apps/web/package.json ./apps/web/package.json

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=installer --chown=paperplane:paperplane /paperplane/apps/web/.next/standalone ./
COPY --from=installer --chown=paperplane:paperplane /paperplane/apps/web/.next/static ./apps/web/.next/static

COPY --from=installer /paperplane/apps/server/package.json ./apps/server/package.json
COPY --from=installer /paperplane/apps/server/dist/ ./apps/server/dist/

cmd node apps/server/dist/index.js