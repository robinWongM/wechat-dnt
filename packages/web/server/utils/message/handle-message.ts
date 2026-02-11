import { createCallerFactory } from "@trpc/server";
import { extractLink, sanitize } from "@dnt/core";
import { appRouter } from "~/server/trpc/routers";

type IncomingIntent =
  | { type: "subscribe" }
  | { type: "text"; content: string }
  | { type: "link"; url: string };

type SendMessage = (message: string) => Promise<void>;

const trpcCaller = createCallerFactory()(appRouter)({});

export const handleIncomingMessage = async (
  intent: IncomingIntent,
  send: SendMessage
) => {
  try {
    console.info("[message] start handling", {
      intent: intent.type,
    });

    if (intent.type === "subscribe") {
      await send(
        "感谢你关注「别瞅着我」。\n\n发送任意链接 / 微信分享卡片至本公众号，可去除恼人的跟踪参数。"
      );
      console.info("[message] subscribe handled");
      return;
    }

    const source = intent.type === "text" ? intent.content : intent.url;
    const originalLink = extractLink(source);
    if (!originalLink) {
      console.info("[message] link extraction failed");
      await send("无法识别链接。");
      return;
    }

    if (intent.type === "link") {
      await send(`你发送的 URL 是: \n${originalLink}`);
    }

    const link = await trpcCaller.resolveShortLink({ url: originalLink });
    if (link !== originalLink) {
      console.info("[message] short link expanded");
      await send(`重定向至：\n${link}`);
    }

    const matchResult = sanitize(link);
    if (!matchResult) {
      console.info("[message] unsupported link");
      await send("暂不支持此链接。");
      return;
    }

    const result = await trpcCaller.scrape({ url: matchResult.fullLink });
    if (!result) {
      console.info("[message] scrape failed");
      await send("获取链接信息失败。");
      return;
    }

    await send(`${result.title}\n${matchResult.fullLink}`);

    const parsedUrl = new URL(matchResult.fullLink);
    const shareUrl = new URL(
      `/share/${parsedUrl.host}${parsedUrl.pathname}`,
      useRuntimeConfig().web.baseUrl
    );
    for (const key of parsedUrl.searchParams.keys()) {
      shareUrl.searchParams.set(key, parsedUrl.searchParams.get(key)!);
    }
    await send(`<a href="${shareUrl.toString()}">轻触此处创建分享卡片</a>`);
    console.info("[message] handled successfully");
  } catch (error) {
    console.error("[message] unexpected error", {
      intent: intent.type,
      error:
        error instanceof Error
          ? { name: error.name, message: error.message }
          : String(error),
    });
    try {
      await send("链接处理失败，请稍后重试。");
    } catch (fallbackError) {
      console.error("[message] fallback send failed", {
        error:
          fallbackError instanceof Error
            ? { name: fallbackError.name, message: fallbackError.message }
            : String(fallbackError),
      });
    }
  }
};
