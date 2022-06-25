FROM node:16-alpine

# Create user PaperPlane
RUN addgroup --system --gid 1639 paperplane
RUN adduser --system --uid 1639 paperplane

# Create Directories with correct permissions
RUN mkdir -p /paperplane/node_modules && chown -R paperplane:paperplane /paperplane/

# Move to correct dir
WORKDIR /paperplane

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
run yarn prisma db push

# Build the application
RUN yarn build

# Change User
USER paperplane

# Run NodeJS script
CMD ["node", "."]