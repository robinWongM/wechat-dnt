FROM node:20-alpine as build
WORKDIR /app
COPY package.json /app
RUN npm install
COPY . /app
RUN npm run build

FROM gcr.io/distroless/nodejs:20 as prod
WORKDIR /app
COPY --from=build /app/.output/server /app/.output/server
EXPOSE 3000/tcp
CMD ["/app/.output/server/index.mjs"]
