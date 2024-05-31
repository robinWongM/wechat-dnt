import { fetch } from "ofetch";
import { parseHTML } from "linkedom";
import bilibili from "./bilibili";
import xiaohongshu from "./xiaohongshu";

const getMetaContent = ({ document }: Window, name: string) => {
  return (
    document
      .querySelector(`meta[name="og:${name}"]`)
      ?.getAttribute("content") ||
    document
      .querySelector(`meta[property="og:${name}"]`)
      ?.getAttribute("content") ||
    document.querySelector(`meta[name="${name}"]`)?.getAttribute("content") ||
    (name === "title" ? document.querySelector('title')?.textContent : "")
  );
};

const allHandlers = [bilibili, xiaohongshu];

export const generateCard = async (url: string) => {
  const html = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    },
  }).then((res) => res.text());

  const doc = parseHTML(html);
  const ogTitle = getMetaContent(doc, "title");
  const ogDescription = getMetaContent(doc, "description");
  const ogImage = getMetaContent(doc, "image");

  for (const handler of allHandlers) {
    if (!handler.host.includes(new URL(url).host)) {
      continue;
    }

    return {
      title: handler.title?.(ogTitle) || ogTitle,
      description: handler.description?.(ogDescription) || ogDescription,
      image: ogImage,
    }
  }

  return {
    title: ogTitle,
    description: ogDescription,
    image: ogImage,
  };
};
