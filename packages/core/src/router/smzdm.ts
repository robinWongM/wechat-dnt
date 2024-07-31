import { object, string } from "valibot";
import { defineHandler, defineRouter } from "../utils/router";

const postLink = (postId: string) => ({
  fullLink: `https://www.smzdm.com/p/${postId}`,
  universalLink: `https://www.smzdm.com/p/${postId}`,
});

export default defineRouter(
  {
    id: "smzdm",
    name: "什么值得买",
  },

  defineHandler({
    pattern: {
      host: [
        "www.smzdm.com",
        "smzdm.com",
        "m.smzdm.com",
        "post.smzdm.com",
        "post.m.smzdm.com",
      ],
      path: "/p/:postId",
      param: object({ postId: string() }),
    },
    sanitizer: ({ param: { postId } }) => postLink(postId),
  })
);
