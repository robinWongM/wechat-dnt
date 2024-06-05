import { object, string } from "valibot";
import { defineHandler, defineRouter } from "../utils/router";

export default defineRouter(
  {
    name: "xiaohongshu",
  },

  defineHandler({
    pattern: {
      host: ["www.xiaohongshu.com", "xiaohongshu.com"],
      path: "/discovery/item/:itemId",
      param: object({ itemId: string() }),
    },
    sanitizer: ({ param: { itemId } }) => ({
      fullLink: `https://www.xiaohongshu.com/discovery/item/${itemId}`,
      universalLink: `https://www.xiaohongshu.com/discovery/item/${itemId}`,
      customSchemeLink: `xhsdiscover://item/${itemId}`,
    }),
  }),

  defineHandler({
    pattern: {
      host: ["www.xiaohongshu.com", "xiaohongshu.com"],
      path: "/explore/:itemId",
      param: object({ itemId: string() }),
    },
    sanitizer: ({ param: { itemId } }) => ({
      fullLink: `https://www.xiaohongshu.com/explore/${itemId}`,
      universalLink: `https://www.xiaohongshu.com/explore/${itemId}`,
      customSchemeLink: `xhsdiscover://item/${itemId}`,
    }),
  }),

  defineHandler({
    pattern: {
      host: ["www.xiaohongshu.com", "xiaohongshu.com"],
      path: "/user/profile/:userId",
      param: object({ userId: string() }),
    },
    sanitizer: ({ param: { userId } }) => ({
      fullLink: `https://www.xiaohongshu.com/user/profile/${userId}`,
      universalLink: `https://www.xiaohongshu.com/user/profile/${userId}`,
      customSchemeLink: `xhsdiscover://user/${userId}`,
    }),
  })
);
