import { object, string } from "valibot";
import { Extractor, defineHandler, defineRouter } from "../utils/router";

const extractor: Extractor = async ({ fullLink }, { fetch, loadHtml }) => {
  const resp = await fetch(fullLink);
  const html = await resp.text();
  const $ = loadHtml(html);

  const title = $("#detail-title").text();
  const description = $("#detail-desc").find("br").replaceWith("\n").end().text();
  const image = $("meta[name='og:image']").attr("content");

  return {
    title,
    description,
    images: image ? [image] : [],
  };
};

export default defineRouter(
  {
    id: "xiaohongshu",
    name: "小红书",
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
    extractor,
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
    extractor,
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
