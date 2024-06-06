import { object, string } from "valibot";
import { defineHandler, defineRouter } from "../utils/router";

const douyinLink = (videoId: string) => ({
  fullLink: `https://www.douyin.com/video/${videoId}`,
  shortLink: `https://v.douyin.com/${videoId}`,
  universalLink: `https://www.douyin.com/video/${videoId}`,
});

export default defineRouter(
  {
    id: "douyin",
    name: "抖音",
  },

  defineHandler({
    pattern: {
      host: ["www.douyin.com", "douyin.com"],
      path: "/video/:videoId",
      param: object({ videoId: string() }),
    },
    sanitizer: ({ param: { videoId } }) => douyinLink(videoId),
  }),

  defineHandler({
    pattern: {
      host: ["www.iesdouyin.com", "iesdouyin.com"],
      path: "/share/video/:videoId",
      param: object({ videoId: string() }),
    },
    sanitizer: ({ param: { videoId } }) => douyinLink(videoId),
  })
);
