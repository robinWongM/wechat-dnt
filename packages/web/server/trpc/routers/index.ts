import { z } from "zod";
import { publicProcedure, router } from "../trpc";
import { sanitize, match } from "@dnt/core";
import { createHash } from "node:crypto";
import og from "open-graph-scraper";
import { load } from 'cheerio';

const defaultHeaders = {
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
  'Accept-Encoding': 'gzip, deflate, br, zstd',
  'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache',
  'Priority': 'u=0, i',
  'Sec-Ch-Ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Microsoft Edge";v="126"',
  'Sec-Ch-Ua-Mobile': '?0',
  'Sec-Ch-Ua-Platform': '"Windows"',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Sec-Fetch-User': '?1',
  'Upgrade-Insecure-Requests': '1',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 Edg/126.0.0.0'
};

export const appRouter = router({
  sanitize: publicProcedure
    .input(
      z.object({
        text: z.string(),
      })
    )
    .query(({ input }) => {
      return sanitize(input.text);
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

      const ofetch = (url: string, init?: RequestInit) => fetch(url, {
        ...init,
        headers: {
          ...defaultHeaders,
        },
      });
      const loadHtml = (html: string) => {
        return load(html, {
          xml: {
            xmlMode: false,
          }
        });
      }
      const result = await matchResult.extract({ fetch: ofetch, loadHtml });

      return {
        ...result,
        config: matchResult.config,
      }
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
