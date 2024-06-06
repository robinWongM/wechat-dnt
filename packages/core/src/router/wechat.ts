import { object, string } from "valibot";
import { stringify } from "querystringify";
import { defineHandler, defineRouter } from "../utils/router";

export default defineRouter(
  {
    id: "wechat",
    name: "微信公众平台",
  },

  defineHandler({
    pattern: {
      host: ["mp.weixin.qq.com"],
      path: "/s",
      query: object({
        __biz: string(),
        mid: string(),
        idx: string(),
        sn: string(),
      }),
    },
    sanitizer: ({ query }) => {
      return {
        fullLink: `https://mp.weixin.qq.com/s?${stringify(query)}`,
      };
    },
  }),

  defineHandler({
    pattern: {
      host: ["mp.weixin.qq.com"],
      path: "/s/:articleId",
      param: object({ articleId: string() }),
    },
    sanitizer: ({ param: { articleId } }) => ({
      fullLink: `https://mp.weixin.qq.com/s/${articleId}`,
    }),
  })
);
