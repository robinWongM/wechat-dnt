import URLParse from "url-parse";

import bilibili from "./bilibili";
import taobao from "./taobao";
import weibo from "./weibo";
import xiaohongshu from "./xiaohongshu";
import douyin from "./douyin";
import wechat from "./wechat";

const allSanitizers = [...bilibili, ...taobao, ...weibo, ...xiaohongshu, ...douyin, ...wechat];

export const sanitize = (url: string) => {
  const parsedUrl = URLParse(url, true);

  for (const sanitizer of allSanitizers) {
    const result = sanitizer.sanitize(parsedUrl);
    if (!result) {
      continue;
    }

    return result;
  }

  return null;
};
