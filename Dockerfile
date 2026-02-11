FROM oven/bun:1 AS build
WORKDIR /build
COPY package.json bun.lock ./
COPY packages/core/package.json ./packages/core/package.json
COPY packages/uni-dnt/package.json ./packages/uni-dnt/package.json
COPY packages/web/package.json ./packages/web/package.json
RUN bun install --frozen-lockfile --ignore-scripts
COPY . ./
RUN bun run --cwd packages/web build

FROM oven/bun:1 AS web
COPY --from=build /build/packages/web/.output /prod/web
WORKDIR /prod/web/server
RUN bun install --production
EXPOSE 3000
CMD ["bun", "index.mjs"]
