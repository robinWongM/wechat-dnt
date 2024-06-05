import { object, string } from "valibot";
import { defineHandler, defineRouter } from "../utils/router";

export default defineRouter(
  {
    name: "weibo",
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
    }),
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
