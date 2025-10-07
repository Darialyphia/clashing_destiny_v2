# ---- Build stage ----
FROM node:20-alpine AS build
WORKDIR /app

# Copy manifests first for better layer caching
COPY package.json package-lock.json ./
COPY ./configs ./configs
COPY ./packages/api ./packages/api
COPY ./packages/engine ./packages/engine
COPY ./packages/shared ./packages/shared
COPY ./packages/server ./packages/server

# Install deps for workspaces (adjust if you don't use npm workspaces)
RUN npm ci

# Railway injects env vars, but Docker needs ARGs declared to receive them at build time.
# Declare the ones your build needs:
ARG CONVEX_URL
ARG CONVEX_API_KEY
ARG UPSTASH_REDIS_REST_URL
ARG UPSTASH_REDIS_REST_TOKEN

# Make them visible to the build (node/esbuild) process:
ENV CONVEX_URL=$CONVEX_URL
ENV CONVEX_API_KEY=$CONVEX_API_KEY
ENV UPSTASH_REDIS_REST_URL=$UPSTASH_REDIS_REST_URL
ENV UPSTASH_REDIS_REST_TOKEN=$UPSTASH_REDIS_REST_TOKEN

# Build only the server workspace (esbuild will inline from process.env)
RUN npm --workspace=@game/server run build

# ---- Runtime stage ----
FROM node:20-alpine
WORKDIR /app/packages/server

# Useful defaults; Railway will still override PORT at runtime
ENV NODE_ENV=production
ENV PORT=8080

# Copy the built server only
COPY --from=build /app/packages/server/dist ./dist

# If your server needs runtime assets (e.g., ./configs), copy them too:
# COPY --from=build /app/configs ../../configs

EXPOSE 8080
CMD ["node", "dist/index.js"]