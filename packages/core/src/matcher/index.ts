import { createRouter } from "radix3";
import URLParse from "url-parse";

import bilibili from "./bilibili";
import taobao from "./taobao";
import weibo from "./weibo";
import xiaohongshu from "./xiaohongshu";
import { MatcherInstance } from "../utils/matcher";
import { parse } from "valibot";

const allMatchers = [...bilibili, ...taobao, ...weibo, ...xiaohongshu];
const router = createRouter<{ matcher: MatcherInstance }>();

for (const matcher of allMatchers) {
  matcher.register(router);
}

export const match = (url: string) => {
  const { protocol, host, pathname, query } = URLParse(url, true);
  const result = router.lookup(`${protocol.slice(0, -1)}/${host}${pathname}`);

  if (!result) {
    return null;
  }

  try {
    return result.matcher.outputCallback({
      query: parse(result.matcher.queryValidator, query),
      params: parse(result.matcher.paramsValidator, result.params || {}),
    });
  } catch (e) {
    return null;
  }
};
