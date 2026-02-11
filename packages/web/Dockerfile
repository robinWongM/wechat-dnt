FROM oven/bun:1 as build
WORKDIR /app
COPY package.json bun.lock /app/
COPY packages/core/package.json /app/packages/core/package.json
COPY packages/uni-dnt/package.json /app/packages/uni-dnt/package.json
COPY packages/web/package.json /app/packages/web/package.json
RUN --mount=type=cache,id=bun,target=/root/.bun/install/cache bun install --frozen-lockfile --ignore-scripts
COPY . /app
RUN --mount=type=cache,id=bun,target=/root/.bun/install/cache bun install --frozen-lockfile
RUN bun run --cwd packages/web build

FROM oven/bun:1 as prod
COPY --from=build /app/packages/web/.output /app/.output
WORKDIR /app/.output/server
RUN --mount=type=cache,id=bun,target=/root/.bun/install/cache bun install --production
EXPOSE 3000/tcp
CMD ["bun", "index.mjs"]
