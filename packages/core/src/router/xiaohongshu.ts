import { object, string } from "valibot";
import { Extractor, defineHandler, defineRouter } from "../utils/router";
import { parseModule } from "esprima";
import { pickNested } from "../utils/ast";

const extractor: Extractor = async ({ fullLink }, { fetch, loadHtml }) => {
  const resp = await fetch(fullLink);
  const html = await resp.text();
  const $ = loadHtml(html);

  const initialScript = $("script")
    .toArray()
    .find((el) => {
      const scriptContent = $(el).text();
      return scriptContent.startsWith("window.__INITIAL_STATE__=");
    });
  if (!initialScript) {
    throw new Error("Failed to find initial script");
  }

  const initialData = $(initialScript)
    .text()
    .replace(/^window\.__INITIAL_STATE__=/, "export default ");
  const module = parseModule(initialData, { range: true });

  const note = pickNested(module.body[0].declaration , "note", "noteDetailMap", "*", "note", "desc")?.value || '';
  const name = pickNested(module.body[0].declaration , "note", "noteDetailMap", "*", "note", "user", "nickname")?.value || '';
  const avatar = pickNested(module.body[0].declaration , "note", "noteDetailMap", "*", "note", "user", "avatar")?.value || '';

  const title = $("#detail-title").text();
  const description = note.replaceAll(/#(.*?)\[话题\]#/g, "#$1 ");
  const image = $("meta[name='og:image']").attr("content");

  return {
    title,
    description,
    image,
    authorName: name,
    authorAvatar: avatar,
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
