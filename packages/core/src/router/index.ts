import URLParse from "url-parse";

import bilibili from "./bilibili";
import taobao from "./taobao";
import weibo from "./weibo";
import xiaohongshu from "./xiaohongshu";
import douyin from "./douyin";
import wechat from "./wechat";
import smzdm from "./smzdm";
import { object, safeParse } from "valibot";

const routers = [bilibili, taobao, xiaohongshu, douyin, wechat, smzdm];

export const match = (url: string) => {
  const urlObject = URLParse(url, true);
  const { protocol, hostname, pathname, query } = urlObject;

  for (const { config, handlers } of routers) {
    for (const handler of handlers) {
      const {
        pattern: {
          protocol: targetProtocol,
          host: targetHost,
          pathRegExp,
          param: paramSchema = object({}),
          query: querySchema = object({}),
        },
      } = handler;

      if (
        !targetProtocol.includes(protocol) ||
        !targetHost.includes(hostname)
      ) {
        continue;
      }

      const pathMatches = pathname.match(pathRegExp);
      if (!pathMatches) {
        continue;
      }

      const validatedParam = safeParse(paramSchema, pathMatches.groups || {});
      if (!validatedParam.success) {
        continue;
      }

      const validatedQuery = safeParse(querySchema, query || {});
      if (!validatedQuery.success) {
        continue;
      }

      const sanitize = () => handler.sanitizer({
        param: validatedParam.output,
        query: validatedQuery.output,
      });
      const extract = (context: Parameters<Exclude<typeof handler.extractor, undefined>>[1] ) => {
        if (!handler.extractor) {
          return null;
        }

        const sanitized = sanitize();
        return handler.extractor(sanitized, context);
      }

      return {
        config,
        handler,
        sanitize,
        extract,
      };
    }
  }

  return null;
};
