# FROM ghcr.io/diced/prisma-binaries:4.8.x as prisma

FROM node:21-alpine as builder
WORKDIR /paperplane
RUN apk add --no-cache libc6-compat

# Install and run Turbo
COPY . .

RUN yarn install
RUN yarn turbo prune --scope=web --docker
RUN yarn turbo prune --scope=server --docker

FROM node:21-alpine as installer
WORKDIR /paperplane
RUN apk add --no-cache libc6-compat

# Prisma binary libraries
# COPY --from=prisma /prisma-engines /prisma-engines
# ENV PRISMA_QUERY_ENGINE_BINARY=/prisma-engines/query-engine \
#   PRISMA_MIGRATION_ENGINE_BINARY=/prisma-engines/migration-engine \
#   PRISMA_INTROSPECTION_ENGINE_BINARY=/prisma-engines/introspection-engine \
#   PRISMA_FMT_BINARY=/prisma-engines/prisma-fmt \
#   PRISMA_CLI_QUERY_ENGINE_TYPE=binary \
#   PRISMA_CLIENT_ENGINE_TYPE=binary \

# RUN apk update
# RUN apk add --no-cache libc6-compat
# RUN apk add --no-cache openssl1.1-compat-dev

# Copy yarn executables
COPY .yarnrc.yml ./.yarnrc.yml
COPY --from=builder /paperplane/.yarn ./.yarn

# Copy and install dependencies
COPY --from=builder /paperplane/out/json/ .
COPY --from=builder /paperplane/yarn.lock ./yarn.lock
RUN yarn install

# Copy build files
COPY --from=builder /paperplane/out/full/ .
COPY tsconfig.json ./tsconfig.json
COPY turbo.json turbo.json
COPY tailwind.config.cjs ./tailwind.config.cjs

# Build the application
RUN yarn cmd:server prisma generate
RUN yarn turbo run build

RUN yarn pinst --disable
RUN yarn workspaces focus --production --all

FROM node:21-alpine as runner
WORKDIR /paperplane

# Create user PaperPlane
RUN addgroup --system --gid 1639 paperplane
RUN adduser --system --uid 1639 paperplane

# Copy Prisma Engines
# COPY --from=installer /prisma-engines /prisma-engines
# ENV PRISMA_QUERY_ENGINE_BINARY=/prisma-engines/query-engine \
#   PRISMA_MIGRATION_ENGINE_BINARY=/prisma-engines/migration-engine \
#   PRISMA_INTROSPECTION_ENGINE_BINARY=/prisma-engines/introspection-engine \
#   PRISMA_FMT_BINARY=/prisma-engines/prisma-fmt \
#   PRISMA_CLI_QUERY_ENGINE_TYPE=binary \
#   PRISMA_CLIENT_ENGINE_TYPE=binary \
#   NEXT_TELEMETRY_DISABLED=1

# Copy build data
COPY --from=installer --chown=paperplane:paperplane /paperplane/apps/web/next.config.mjs ./apps/web/next.config.mjs
COPY --from=installer --chown=paperplane:paperplane /paperplane/apps/web/package.json ./apps/web/package.json
COPY --from=installer --chown=paperplane:paperplane /paperplane/apps/web/.next/ ./apps/web/.next
COPY --chown=paperplane:paperplane apps/web/public/ ./apps/web/public

COPY --from=installer --chown=paperplane:paperplane /paperplane/apps/server/package.json ./apps/server/package.json
COPY --from=installer --chown=paperplane:paperplane /paperplane/apps/server/dist/ ./apps/server/dist/
COPY --chown=paperplane:paperplane apps/server/prisma/ ./apps/server/prisma/

COPY --from=installer --chown=paperplane:paperplane /paperplane/package.json ./package.json
COPY --from=installer --chown=paperplane:paperplane /paperplane/node_modules/ ./node_modules/
COPY --from=installer --chown=paperplane:paperplane /paperplane/node_modules/.prisma/client ./node_modules/.prisma/client
COPY --from=installer --chown=paperplane:paperplane /paperplane/node_modules/@prisma/client ./node_modules/@prisma/client

# Create data folder
RUN mkdir /paperplane/data
RUN chown -R paperplane:paperplane /paperplane/data

USER paperplane

# Start app
CMD yarn start
