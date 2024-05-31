FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
WORKDIR /build
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm fetch
COPY . ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install -r --offline
RUN pnpm deploy --filter=web --prod /prod/web

FROM cgr.dev/chainguard/node-lts:latest AS web
COPY --from=build /prod/web /prod/web
WORKDIR /prod/web
EXPOSE 3000
CMD [ "npm", "start" ]
