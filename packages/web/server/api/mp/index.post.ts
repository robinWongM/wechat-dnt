import { XMLParser } from "fast-xml-parser";
import { z, object, string, number } from "zod";
import { extractLink, isShortLink, sanitize } from "@dnt/core";
import { appRouter } from "~/server/trpc/routers";
import { createCallerFactory } from "@trpc/server";

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
const trpcCaller = createCallerFactory()(appRouter)({});

const useMpMessageQueue = (username: string) => {
  let promise = Promise.resolve();

  return {
    send: async (message: string) => {
      promise = promise.finally(() => mpSendTextMessage(username, message));
    },
  };
};

const handleMpEvent = async (event: z.infer<typeof eventSchema>) => {
  const { MsgType, Event, FromUserName } = event;
  const { send } = useMpMessageQueue(FromUserName);

  if (MsgType === "event" && Event === "subscribe") {
    return send(
      "感谢你关注「别瞅着我」。\n\n发送任意链接 / 微信分享卡片至本公众号，可去除恼人的跟踪参数。"
    );
  }

  if (MsgType === "text" || MsgType === "link") {
    const linkText = MsgType === "text" ? event.Content : event.Url;
    const originalLink = extractLink(`${linkText}`);

    if (!originalLink) {
      console.log('originalLink not found', event);
      return send("无法识别链接。");
    }

    if (MsgType === "link") {
      void send(`你发送的 URL 是: \n${originalLink}`);
    }

    const link = await trpcCaller.resolveShortLink({ url: originalLink });
    if (link !== originalLink) {
      void send(`重定向至：\n${link}`);
    }

    const matchResult = sanitize(link);
    if (!matchResult) {
      return send("暂不支持此链接。");
    }

    const result = await trpcCaller.scrape({ url: matchResult.fullLink });
    if (!result) {
      return send("获取链接信息失败。");
    }

    void send(`${result.title}\n${matchResult.fullLink}`);

    const parsedUrl = new URL(matchResult.fullLink);
    const shareUrl = new URL(
      `/share/${parsedUrl.host}${parsedUrl.pathname}`,
      useRuntimeConfig().web.baseUrl
    );
    for (const key of parsedUrl.searchParams.keys()) {
      shareUrl.searchParams.set(key, parsedUrl.searchParams.get(key)!);
    }
    void send(`<a href="${shareUrl.toString()}">轻触此处创建分享卡片</a>`);
  }
};

export default defineEventHandler(async (event) => {
  const message = await useMpEncryptedMessage(event);
  console.log("Received event from MP");

  const { data, error, success } = eventSchema.safeParse(message);
  if (!success) {
    console.log("Failed to parse body:", error);
  }

  if (data) {
    void handleMpEvent(data);
  }

  return "";
});
