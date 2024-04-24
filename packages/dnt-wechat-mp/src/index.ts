import { Hono } from "hono";
import { env } from "hono/adapter";
import { createHash } from "node:crypto";
import { useEvent } from "./reply";

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
  const body = await c.req.text();
  console.log("Received body:", body);

  const { MsgType, Content, Url, Event, reply } = useEvent(body);

  if (MsgType === 'event' && Event === 'subscribe') {
    return c.text(reply('感谢你关注「当心被夹」。\n\n发送任意链接 / 微信分享卡片至本公众号，可去除恼人的跟踪参数。\n\n<a data-miniprogram-appid="wx5e138406fa5ae897" data-miniprogram-path="pages/index" href="weixin://dl/business/">轻触此处</a>，使用「瞅我干嘛」小程序快速回到本公众号。'));
  }

  if (MsgType === 'text' || MsgType === 'link') {
    const link = `${MsgType === "text" ? Content : Url}`.trim();

    let newLocation: string | null = '';
    if (link.startsWith('https://b23.tv/')) {
      const { headers } = await fetch(link, {
        redirect: 'manual',
      });
      newLocation = headers.get('location');
    }

    const path = `pages/result?url=${encodeURIComponent(newLocation || link)}`;
    const urlScheme = `weixin://dl/business/`;
    const resp = `你发送的 URL 是: \n\n${link}\n\n${
      newLocation ? `展开后的链接是：\n\n${newLocation}\n\n` : ''
    }<a data-miniprogram-appid="wx5e138406fa5ae897" data-miniprogram-path="${path}" href="${urlScheme}">轻触此处净化此 URL</a>`;

    return c.text(reply(resp));
  }

  return c.text('');



  // const replyMsg = {
  //   touser: FromUserName,
  //   msgtype: "text",
  //   text: {
  //     content: `你发送的 URL 是: \n${link}\n\n<a href="" data-miniprogram-appid="wx5e138406fa5ae897" data-miniprogram-path="pages/result">轻触此处使用「瞅我干嘛」净化此 URL</a>`,
  //   },
  // };

  // const { WECHAT_APP_ID, WECHAT_APP_SECRET } = env<{
  //   WECHAT_APP_ID: string;
  //   WECHAT_APP_SECRET: string;
  // }>(c);

  // const accessToken = await fetch(
  //   "https://api.weixin.qq.com/cgi-bin/stable_token",
  //   {
  //     method: "POST",
  //     body: new URLSearchParams({
  //       grant_type: "client_credential",
  //       appid: WECHAT_APP_ID,
  //       secret: WECHAT_APP_SECRET,
  //     }).toString(),
  //   }
  // )
  //   .then((res) => res.json())
  //   .then((res: any) => res.access_token);

  // await fetch(
  //   `https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token=${accessToken}`,{
  //     method: 'POST',
  //     body: JSON.stringify(replyMsg),
  //   }
  // );

  // return c.text("");
});

export default app;
