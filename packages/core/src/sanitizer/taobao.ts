import { defineHandler, defineRouter } from "../utils/router";
import { object, coerce, number } from "valibot";

const taobaoLink = (id: number) => ({
  fullLink: `https://item.taobao.com/item.htm?id=${id}`,
  universalLink: `https://item.taobao.com/item.htm?id=${id}`,
  customSchemeLink: `tbopen://m.taobao.com/tbopen/index.html?id=${id}`,
});

export default defineRouter(
  {
    name: "taobao",
  },

  defineHandler({
    pattern: {
      host: ["item.taobao.com"],
      path: "/item.htm",
      query: object({
        id: coerce(number(), Number),
      }),
    },
    sanitizer: ({ query: { id } }) => taobaoLink(id),
  }),

  defineHandler({
    pattern: {
      host: ["main.m.taobao.com"],
      path: "/security-h5-detail/home",
      query: object({
        id: coerce(number(), Number),
      }),
    },
    sanitizer: ({ query: { id } }) => taobaoLink(id),
  })
);
