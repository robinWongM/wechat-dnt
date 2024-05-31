import { Hono } from "hono";
import { env } from "hono/adapter";
import { createHash } from "node:crypto";
import { useEvent } from "./reply";
import { isShortLink as checkIfShortLink, extractLink, match } from "@dnt/core";
import { fetch } from "ofetch";
import { generateCard } from "../og";

const app = new Hono();

app.use(async (c, next) => {
  const { WECHAT_TOKEN } = env<{ WECHAT_TOKEN: string }>(c);
  const { signature, timestamp, nonce } = c.req.query();

  const toBeSigned = [WECHAT_TOKEN, timestamp, nonce].sort().join("");
  const hash = createHash("sha1");
  hash.update(toBeSigned);
  const mySignature = hash.digest("hex");

  if (mySignature !== signature) {
    return c.text("invalid signature", 401);
  }

  await next();
});

app.get("/", (c) => {
  return c.text(c.req.query().echostr);
});

app.post("/", async (c) => {
  const { MsgType, Content, Url, Event, reply, replyCard } = await useEvent(c);
  const { WECHAT_MINI_PROGRAM_APPID } = env<{ WECHAT_MINI_PROGRAM_APPID: string }>(c);

  const handler = async () => {
    if (MsgType === "event" && Event === "subscribe") {
      await reply(
        '感谢你关注「别瞅着我」。\n\n发送任意链接 / 微信分享卡片至本公众号，可去除恼人的跟踪参数。'
      );
      return;
    }

    if (MsgType === "text" || MsgType === "link") {
      const linkText = MsgType === "text" ? Content : Url;
      const originalLink = extractLink(linkText);

      if (!originalLink) {
        await reply("无法识别链接。");
        return;
      }

      let messagePrefix =
        MsgType === "link" ? `你发送的 URL 是: \n${originalLink}\n\n` : "";
      let link = originalLink;

      const isShortLink = checkIfShortLink(link);
      if (isShortLink) {
        const resp = await fetch(link, {
          redirect: "manual",
          headers: {
            "User-Agent":
              "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
          },
        });
        if (resp.headers.has("location")) {
          link = resp.headers.get("location")!;
          messagePrefix += `重定向至：\n${link}\n\n`;
        }
      }

      const matchResult = match(link);
      if (!matchResult) {
        await reply(`${messagePrefix}暂不支持此链接。`);
        return;
      }

      const path = `pages/result?url=${encodeURIComponent(link)}`;
      const urlScheme = `weixin://dl/business/`;
      const messageSuffix = `<a data-miniprogram-appid="${WECHAT_MINI_PROGRAM_APPID}" data-miniprogram-path="${path}" href="${urlScheme}">查看详情</a>`;

      const card = await generateCard(matchResult.fullLink);
      const message = `${card.title}\n${matchResult.fullLink}`;
      await reply(message);
      // await replyCard(card.title, card.description, matchResult.fullLink, card.image).catch(console.error);
      // await reply(messageSuffix);
      return;
    }
  };

  await handler();
  return c.text("");
});

export default app;
