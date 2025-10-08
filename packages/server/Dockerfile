# ---- Build stage ----
FROM node:20-alpine AS build
WORKDIR /app

ARG CONVEX_URL
ARG CONVEX_API_KEY
ARG UPSTASH_REDIS_REST_URL
ARG UPSTASH_REDIS_REST_TOKEN

ENV CONVEX_URL=$CONVEX_URL
ENV CONVEX_API_KEY=$CONVEX_API_KEY
ENV UPSTASH_REDIS_REST_URL=$UPSTASH_REDIS_REST_URL
ENV UPSTASH_REDIS_REST_TOKEN=$UPSTASH_REDIS_REST_TOKEN

COPY package.json package-lock.json ./
COPY ./configs ./configs
COPY ./packages/api ./packages/api
COPY ./packages/engine ./packages/engine
COPY ./packages/shared ./packages/shared
COPY ./packages/server ./packages/server

RUN npm ci

RUN npm --workspace=@game/server run build

FROM node:20-alpine
WORKDIR /app/packages/server

# ARG CONVEX_URL
# ARG CONVEX_API_KEY
# ARG UPSTASH_REDIS_REST_URL
# ARG UPSTASH_REDIS_REST_TOKEN

# ENV CONVEX_URL=$CONVEX_URL
# ENV CONVEX_API_KEY=$CONVEX_API_KEY
# ENV UPSTASH_REDIS_REST_URL=$UPSTASH_REDIS_REST_URL
# ENV UPSTASH_REDIS_REST_TOKEN=$UPSTASH_REDIS_REST_TOKEN
# ENV NODE_ENV=production
# ENV PORT=8080

COPY --from=build /app/packages/server/dist ./dist

EXPOSE 8080
CMD ["node", "dist/index.js"]