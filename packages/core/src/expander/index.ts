import URLParse from "url-parse";

const SHORT_LINK_DOMAINS = [
  'b23.tv',
  'xhslink.com',
  'm.tb.cn',
];

export const isShortLink = (url: string) => {
  const parsedUrl = new URLParse(url);
  return SHORT_LINK_DOMAINS.includes(parsedUrl.hostname);
}
