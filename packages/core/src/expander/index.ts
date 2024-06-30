import URLParse from "url-parse";

const SHORT_LINK_DOMAINS = [
  'b23.tv',
  'b22.top',
  'xhslink.com',
  'm.tb.cn',
  't.cn',
  'v.douyin.com',
];

export const isShortLink = (url: string) => {
  const parsedUrl = new URLParse(url);
  return SHORT_LINK_DOMAINS.includes(parsedUrl.hostname);
}
