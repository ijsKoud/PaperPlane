FROM ghcr.io/diced/prisma-binaries:4.7.x as prisma

FROM node:19-alpine

# Create user PaperPlane
RUN addgroup --system --gid 1639 paperplane
RUN adduser --system --uid 1639 paperplane

# Create Directories with correct permissions
RUN mkdir -p /paperplane/node_modules && chown -R paperplane:paperplane /paperplane/
RUN mkdir -p /prisma-engines

# Move to correct dir
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

# Register Environment Variables
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Copy Existing Files
COPY package.json yarn.lock .yarnrc.yml next.config.js global.d.ts next-env.d.ts tsconfig.json ./
copy prisma ./prisma
COPY .yarn ./.yarn
COPY public ./public
COPY src ./src

# Install dependencies
RUN yarn install --immutable
RUN yarn prisma generate

# Build the application
RUN yarn build

# Change User
USER paperplane

# Run NodeJS script
CMD ["node", "."]
