FROM node:20 as build
WORKDIR /app
COPY package.json /app
RUN corepack enable pnpm && pnpm install
COPY . /app
RUN pnpm run build

FROM cgr.dev/chainguard/node-lts:latest as prod
WORKDIR /app
COPY --from=build /app/.output/server /app/.output/server
EXPOSE 3000/tcp
CMD ["/app/.output/server/index.mjs"]
