FROM oven/bun:1-slim AS base

ENV DOCKER=true
WORKDIR /app

# Only the manifest and lockfile first, so source-only changes don't bust the
# install layer cache.
FROM base AS deps
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM base AS prod-deps
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

FROM base AS build
COPY --from=deps /app/node_modules /app/node_modules
COPY . .
RUN bun run build:site

FROM base
RUN bun add -g serve
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/dist /app/dist

# Expose the port the app runs on
EXPOSE 8080

# Command to run the application
CMD ["serve", "-s", "dist", "-l", "8080"]
