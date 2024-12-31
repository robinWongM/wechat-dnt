FROM node:22 AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
WORKDIR /build
COPY .npmrc pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm fetch
COPY . ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --offline --frozen-lockfile
RUN pnpm run --filter=web build

FROM node:22-slim AS web
COPY --from=build /build/packages/web/.output /prod/web
WORKDIR /prod/web
EXPOSE 3000
CMD ["server/index.mjs"]
