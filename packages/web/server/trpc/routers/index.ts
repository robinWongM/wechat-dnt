import { z } from "zod";
import { publicProcedure, router } from "../trpc";
import { match } from "@dnt/core";
import og from 'open-graph-scraper';

export const appRouter = router({
  sanitize: publicProcedure
    .input(
      z.object({
        text: z.string(),
      })
    )
    .query(({ input }) => {
      return match(input.text);
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
        fetchOptions: {
          headers: {
            // ios safari user agent
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
          }
        }
      });

      return openGraph.result;
    })
});

// export type definition of API
export type AppRouter = typeof appRouter;
