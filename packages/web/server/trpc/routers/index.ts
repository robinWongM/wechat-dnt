import { z } from "zod";
import { publicProcedure, router } from "../trpc";
import { sanitize, match, isShortLink, extractLink } from "@dnt/core";
import { createHash } from "node:crypto";
import og from "open-graph-scraper";
import { load } from "cheerio";
import { previewCache } from "~/server/schema";
import { eq } from "drizzle-orm";

const defaultHeaders = {
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
  "Accept-Encoding": "gzip, deflate, br, zstd",
  "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
  "Cache-Control": "no-cache",
  Pragma: "no-cache",
  Priority: "u=0, i",
  "Sec-Ch-Ua":
    '"Not/A)Brand";v="8", "Chromium";v="126", "Microsoft Edge";v="126"',
  "Sec-Ch-Ua-Mobile": "?0",
  "Sec-Ch-Ua-Platform": '"Windows"',
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Sec-Fetch-User": "?1",
  "Upgrade-Insecure-Requests": "1",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 Edg/126.0.0.0",
};

const resolveShortLink = async (
  link: string,
  maxRedirectTimes = 10
): Promise<string> => {
  if (maxRedirectTimes <= 0) {
    return link;
  }

  if (isShortLink(link)) {
    const resp = await fetch(link, {
      redirect: "manual",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
      },
    });

    const redirected = resp.headers.get("location");
    if (redirected && isShortLink(redirected)) {
      return resolveShortLink(redirected, maxRedirectTimes - 1);
    }

    return redirected || link;
  }

  return link;
};

export const appRouter = router({
  resolveShortLink: publicProcedure
    .input(
      z.object({
        url: z.string(),
        maxRedirectTimes: z
          .number()
          .int()
          .min(0)
          .max(10)
          .optional()
          .default(10),
      })
    )
    .query(async ({ input: { url, maxRedirectTimes } }) =>
      resolveShortLink(url, maxRedirectTimes)
    ),

  sanitize: publicProcedure
    .input(
      z.object({
        text: z.string(),
      })
    )
    .query(async ({ input: { text } }) => {
      const url = extractLink(text);
      if (!url) {
        throw createError("no url found");
      }

      const finalUrl = await resolveShortLink(url);
      if (!finalUrl) {
        throw createError("failed to resolve link");
      }

      return sanitize(finalUrl);
    }),

  scrape: publicProcedure
    .input(
      z.object({
        url: z.string(),
      })
    )
    .query(async ({ input }) => {
      const matchResult = match(input.url);
      if (!matchResult || !matchResult.extract) {
        throw createError("unsupported url");
      }

      const sanitized = matchResult.sanitize();

      const cached = await db.query.previewCache.findFirst({
        where: eq(previewCache.fullLink, sanitized.fullLink),
      });
      if (cached) {
        console.log('using cache!');
        return {
          title: cached.title,
          description: cached.description,
          authorName: cached.authorName,
          authorAvatar: cached.authorAvatar,
          image: cached.image,
          config: matchResult.config,
        };
      }

      const ofetch = (url: string, init?: RequestInit) =>
        fetch(url, {
          ...init,
          headers: {
            ...defaultHeaders,
          },
        });
      const loadHtml = (html: string) => {
        return load(html, {
          xml: {
            xmlMode: false,
          },
        });
      };
      const result = await matchResult.extract({ fetch: ofetch, loadHtml });
      if (!result) {
        throw createError("failed to extract data");
      }

      await db.insert(previewCache)
        .values({
          fullLink: sanitized.fullLink,
          title: result.title,
          description: result.description,
          image: result.image,
          authorName: result.authorName,
          authorAvatar: result.authorAvatar,
        })
        .onConflictDoNothing();

      return {
        ...result,
        config: matchResult.config,
      };
    }),

  getWxConfig: publicProcedure
    .input(
      z.object({
        url: z.string(),
      })
    )
    .query(async ({ input: { url } }) => {
      const {
        mp: { appId },
      } = useRuntimeConfig();
      const ticket = await useJsTicket();
      const nonceStr = Math.random().toString(36).substr(2, 15);
      const timestamp = Math.floor(Date.now() / 1000);

      const sha1 = createHash("sha1");
      const toBeSigned = `jsapi_ticket=${ticket}&noncestr=${nonceStr}&timestamp=${timestamp}&url=${url}`;
      sha1.update(toBeSigned);
      const signature = sha1.digest("hex");

      return {
        appId,
        timestamp,
        nonceStr,
        signature,
        url,
      };
    }),
});

// export type definition of API
export type AppRouter = typeof appRouter;
