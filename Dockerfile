FROM node:16-alpine

# Create user PaperPlane
RUN addgroup --system --gid 1001 paperplane
RUN adduser --system --uid 1001 paperplane

# Create Directories with correct permissions
RUN mkdir -p /paperplane/node_modules && chown -R paperplane:paperplane /paperplane/

# Move to correct dir
WORKDIR /paperplane

# Register Environment Variables
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Install dependencies
COPY .yarn .yarn
COPY package.json yarn.lock .yarnrc.yml ./
RUN yarn install --immutable

# Build the application
COPY src ./src
COPY .yarn .yarn
COPY package.json yarn.lock .yarnrc.yml next.config.js next-env.d.ts tsconfig.json ./
RUN yarn build

# Change User
USER paperplane

# Run NodeJS script
CMD ["node", "."]