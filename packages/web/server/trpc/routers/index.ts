import { z } from "zod";
import { publicProcedure, router } from "../trpc";
import { sanitize } from "@dnt/core";
import { createHash } from "node:crypto";
import og from "open-graph-scraper";

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
      const openGraph = await og({
        url: input.url,
        onlyGetOpenGraphInfo: true,
        fetchOptions: {
          headers: {
            Accept:
              "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "zh-CN,zh-Hans;q=0.9",
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "none",
            "User-Agent":
              "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
          },
        },
      }).catch((err) => {
        console.error(err);
        throw err;
      })

      return openGraph.result;
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
