import { object, string } from "valibot";
import { defineHandler, defineRouter } from "../utils/router";
import { parseModule } from "esprima";
import { decode } from '../utils/weibo';

const getWeiboMid = (input: string) =>
  /^\d+$/.test(input) ? Number(input) : decode(input);

export default defineRouter(
  {
    id: "weibo",
    name: "微博",
  },

  defineHandler({
    pattern: {
      host: ["www.weibo.com", "weibo.com"],
      path: "/:userId/:statusId",
      param: object({
        userId: string(),
        statusId: string(),
      }),
    },
    sanitizer: ({ param: { userId, statusId } }) => ({
      fullLink: `https://weibo.com/${userId}/${statusId}`,
      universalLink: `https://weibo.com/${userId}/${statusId}`,
      iframeLink: `https://m.weibo.cn/detail/${getWeiboMid(statusId)}`,
    }),
    extractor: async ({ iframeLink }, { fetch, loadHtml }) => {
      const resp = await fetch(iframeLink!);
      const html = await resp.text();
      const $ = loadHtml(html);

      const renderDataScript = $("script")
        .toArray()
        .find((script) => {
          return $(script).text().includes("var $render_data = ");
        });
      if (!renderDataScript) {
        throw new Error("No render data found");
      }

      const module = parseModule($(renderDataScript).text(), { range: true });
      const codeRange =
        module.body[1].type === "VariableDeclaration" &&
        module.body[1].declarations[0]?.init &&
        module.body[1].declarations[0].init.type === "LogicalExpression" &&
        module.body[1].declarations[0].init.left.type === "MemberExpression" &&
        module.body[1].declarations[0].init.left.object.range;
      if (!codeRange) {
        throw new Error("Failed to find code range");
      }

      const code = $(renderDataScript).text().slice(codeRange[0], codeRange[1]);
      const renderData = JSON.parse(code)[0];

      const title = `@${renderData.status.user.screen_name} 的微博`;
      const description = loadHtml(renderData.status.text)
        .root()
        .find("br")
        .replaceWith("\n")
        .end()
        .text();

      const images = [];
      if (renderData.status.pics) {
        for (const pic of renderData.status.pics) {
          const proxyUrl = new URL(useRuntimeConfig().web.proxyUrl);
          proxyUrl.searchParams.set("url", pic.large.url);
          images.push(proxyUrl.toString());
        }
      }

      return {
        title,
        description,
        image: images[0],
      };
    },
  }),

  defineHandler({
    pattern: {
      host: ["www.weibo.com", "weibo.com"],
      path: "/u/:userId",
      param: object({
        userId: string(),
      }),
    },
    sanitizer: ({ param: { userId } }) => ({
      fullLink: `https://weibo.com/u/${userId}`,
      universalLink: `https://weibo.com/u/${userId}`,
    }),
  }),

  defineHandler({
    pattern: {
      host: ["m.weibo.cn"],
      path: "/:userId/:statusId/**",
      param: object({
        userId: string(),
        statusId: string(),
      }),
    },
    sanitizer: ({ param: { userId, statusId } }) => ({
      fullLink: `https://m.weibo.cn/${userId}/${statusId}`,
      universalLink: `https://m.weibo.cn/${userId}/${statusId}`,
    }),
  }),

  defineHandler({
    pattern: {
      host: ["m.weibo.cn"],
      path: "/users/:userId/**",
      param: object({
        userId: string(),
      }),
    },
    sanitizer: ({ param: { userId } }) => ({
      fullLink: `https://m.weibo.cn/users/${userId}`,
      universalLink: `https://m.weibo.cn/users/${userId}`,
    }),
  }),

  defineHandler({
    pattern: {
      host: ["m.weibo.cn"],
      path: "/:userId/:statusId",
      param: object({
        userId: string(),
        statusId: string(),
      }),
    },
    sanitizer: ({ param: { userId, statusId } }) => ({
      fullLink: `https://m.weibo.cn/${userId}/${statusId}`,
      universalLink: `https://m.weibo.cn/${userId}/${statusId}`,
    }),
  }),

  defineHandler({
    pattern: {
      host: ["m.weibo.cn"],
      path: "/users/:userId",
      param: object({
        userId: string(),
      }),
    },
    sanitizer: ({ param: { userId } }) => ({
      fullLink: `https://m.weibo.cn/users/${userId}`,
      universalLink: `https://m.weibo.cn/users/${userId}`,
    }),
  })
);
