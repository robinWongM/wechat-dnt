import { XMLParser } from "fast-xml-parser";
import { z, object, string, number } from "zod";
import { isShortLink, match } from "@dnt/core";
import og from "open-graph-scraper";

const xmlParser = new XMLParser({
  parseTagValue: false,
});

const eventSchema = string()
  .transform((xml) => xmlParser.parse(xml))
  .pipe(
    object({
      xml: object({
        FromUserName: string(),
        ToUserName: string(),
        CreateTime: string().or(number()),
        MsgType: string().or(number()),
        Content: string().or(number()).optional(),
        Url: string().optional(),
        Event: string().optional(),
      }),
    }).transform(({ xml }) => xml)
  );

const handleMpEvent = async (event: z.infer<typeof eventSchema>) => {
  const { MsgType, Event, FromUserName } = event;

  if (MsgType === "event" && Event === "subscribe") {
    return mpSendTextMessage(
      FromUserName,
      "感谢你关注「别瞅着我」。\n\n发送任意链接 / 微信分享卡片至本公众号，可去除恼人的跟踪参数。"
    );
  }

  if (MsgType === "text" || MsgType === "link") {
    const linkText = MsgType === "text" ? event.Content : event.Url;
    const originalLink = linkText;

    if (!originalLink) {
      return mpSendTextMessage(FromUserName, "无法识别链接。");
    }

    if (MsgType === "link") {
      void mpSendTextMessage(
        FromUserName,
        `你发送的 URL 是: \n${originalLink}`
      );
    }

    let link = `${originalLink}`;
    if (isShortLink(link)) {
      const resp = await fetch(link, {
        redirect: "manual",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
        },
      });
      if (resp.headers.has("location")) {
        link = resp.headers.get("location")!;
        void mpSendTextMessage(FromUserName, `重定向至：\n${link}`);
      }
    }

    const matchResult = match(link);
    if (!matchResult) {
      return mpSendTextMessage(FromUserName, "暂不支持此链接。");
    }

    const { result, error } = await og({ url: matchResult.fullLink });
    if (error) {
      return mpSendTextMessage(FromUserName, "获取链接信息失败。");
    }

    void mpSendTextMessage(
      FromUserName,
      `${result.ogTitle}\n${matchResult.fullLink}`
    );

    const parsedUrl = new URL(matchResult.fullLink);
    const shareUrl = new URL(
      `/share/${parsedUrl.host}${parsedUrl.pathname}`,
      useRuntimeConfig().web.baseUrl,
    );
    for (const key of parsedUrl.searchParams.keys()) {
      shareUrl.searchParams.set(key, parsedUrl.searchParams.get(key)!);
    }
    void mpSendTextMessage(
      FromUserName,
      `<a href="${shareUrl.toString()}">轻触此处创建分享卡片</a>`
    );
  }
};

export default defineEventHandler(async (event) => {
  await useMpAuth(event);
  console.log("Received event from MP");

  const { success, error, data } = await readValidatedBody(event, (body) => {
    console.log("Received body:", body);
    return eventSchema.safeParse(body);
  });
  if (!success) {
    console.log("Failed to parse body:", error);
  }

  if (data) {
    void handleMpEvent(data);
  }

  return "";
});
