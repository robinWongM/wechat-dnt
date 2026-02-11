FROM oven/bun:1 AS build
WORKDIR /build
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*
RUN bun add -g node-gyp
COPY package.json bun.lock ./
COPY packages/core/package.json ./packages/core/package.json
COPY packages/uni-dnt/package.json ./packages/uni-dnt/package.json
COPY packages/web/package.json ./packages/web/package.json
RUN --mount=type=cache,id=bun,target=/root/.bun/install/cache bun install --frozen-lockfile
COPY . ./
RUN bun run --cwd packages/web build

FROM oven/bun:1 AS web
COPY --from=build /build/packages/web/.output /prod/web
WORKDIR /prod/web
EXPOSE 3000
CMD ["bun", "server/index.mjs"]
