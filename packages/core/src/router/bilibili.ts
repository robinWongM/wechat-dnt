import {
  object,
  string,
  startsWith,
  union,
  optional,
  coerce,
  number,
  regex,
  transform,
} from "valibot";
import { stringify } from "querystringify";
import { defineHandler, defineRouter } from "../utils/router";
import dayjs from "dayjs";
import dayjsDuration from "dayjs/plugin/duration.js";
import dayjsRelativeTime from "dayjs/plugin/relativeTime.js";
import "dayjs/locale/zh-cn.js";
import { parseModule } from "esprima";

dayjs.extend(dayjsDuration);
dayjs.extend(dayjsRelativeTime);

const XOR_CODE = 23442827791579n;
const MASK_CODE = 2251799813685247n;
const MAX_AID = 1n << 51n;
const BASE = 58n;
const data = "FcwAPNKTMug3GV5Lj7EJnHpWsx4tb8haYeviqBz6rkCy12mUSDQX9RdoZf";

function bv2av(bvid: string) {
  if (bvid.toLowerCase().startsWith("av")) {
    return bvid.slice(2);
  }

  const bvidArr = Array.from<string>(bvid as string);
  [bvidArr[3], bvidArr[9]] = [bvidArr[9], bvidArr[3]];
  [bvidArr[4], bvidArr[7]] = [bvidArr[7], bvidArr[4]];
  bvidArr.splice(0, 3);
  const tmp = bvidArr.reduce(
    (pre, bvidChar) => pre * BASE + BigInt(data.indexOf(bvidChar)),
    0n
  );
  return Number((tmp & MASK_CODE) ^ XOR_CODE);
}

function getVideoLink(bvId: string, query: { t?: number; p?: number }) {
  const timeQuery = stringify(query, true);
  const fullLink = `https://www.bilibili.com/video/${bvId}${timeQuery}`;
  const shortLink = `https://b23.tv/${bvId}${timeQuery}`;
  const universalLink = `https://www.bilibili.com/video/${bvId}`;

  const mobileQuery = stringify(
    {
      ...(query.t ? { start_progress: query.t * 1000 } : {}),
      ...(query.p ? { page: query.p - 1 } : {}),
    },
    true
  );
  const customSchemeLink = `bilibili://video/${bv2av(bvId)}${mobileQuery}`;

  return {
    fullLink,
    shortLink,
    universalLink,
    customSchemeLink,
  };
}

function getDynamicLink(dynamicId: string) {
  return {
    fullLink: `https://www.bilibili.com/opus/${dynamicId}`,
    universalLink: `https://www.bilibili.com/opus/${dynamicId}`,
    customSchemeLink: `bilibili://opus/detail/${dynamicId}`,
  };
}

function getReadLink(cvId: number) {
  return {
    fullLink: `https://www.bilibili.com/read/cv${cvId}`,
    universalLink: `https://www.bilibili.com/read/cv${cvId}`,
    customSchemeLink: `bilibili://article/${cvId}`,
  };
}

// Rewrite into new format
export default defineRouter(
  {
    id: "bilibili",
    name: '哔哩哔哩',
  },

  defineHandler({
    pattern: {
      host: ["www.bilibili.com", "m.bilibili.com"],
      path: "/video/:videoId",
      param: object({
        videoId: union([
          string([startsWith("BV")]),
          string([startsWith("av")]),
        ]),
      }),
      query: object({
        t: optional(coerce(number(), Number)),
        p: optional(coerce(number(), Number)),
      }),
    },
    sanitizer: ({ param: { videoId }, query }) => getVideoLink(videoId, query),
    extractor: async ({ fullLink }, { fetch, loadHtml }) => {
      const resp = await fetch(fullLink);
      const html = await resp.text();
      const $ = loadHtml(html);

      const initialScript = $("script")
        .toArray()
        .find((el) => {
          const scriptContent = $(el).text();
          return scriptContent.startsWith("window.__INITIAL_STATE__=");
        });
      if (!initialScript) {
        throw new Error("Failed to find initial script");
      }

      const initialData = $(initialScript)
        .text()
        .replace(/^window\.__INITIAL_STATE__=/, "export default ");
      const module = parseModule(initialData, { range: true });
      const objectRange =
        module.body[0].type === "ExportDefaultDeclaration" &&
        module.body[0].declaration.type === "ObjectExpression" &&
        module.body[0].declaration.range;
      if (!objectRange) {
        throw new Error("Failed to find initial script");
      }

      const { videoData } = JSON.parse(initialData.slice(objectRange[0], objectRange[1]));

      const {
        title,
        desc,
        pic,
        ctime,
        duration,
        owner: { name, face },
        stat: { view, danmaku, like },
      } = videoData;

      const description = desc === '-' ? '' : desc;

      return {
        title,
        description,
        images: [pic],
        metadata: [
          { label: "UP 主", icon: "", value: name },
          {
            label: "时长",
            icon: "",
            value: dayjs
              .duration(parseInt(duration, 10), "seconds")
              .format("mm:ss"),
          },
          { label: "播放量", icon: "", value: view },
          { label: "发布时间", icon: "", value: dayjs(ctime * 1000).locale('zh-cn').fromNow() },
        ],
      };
    },
  }),

  defineHandler({
    pattern: {
      host: ["www.bilibili.com", "m.bilibili.com"],
      path: "/opus/:opusId",
      param: object({ opusId: string() }),
    },
    sanitizer: ({ param: { opusId } }) => getDynamicLink(opusId),
  }),

  defineHandler({
    pattern: {
      host: ["t.bilibili.com"],
      path: "/:dynamicId",
      param: object({ dynamicId: string() }),
    },
    sanitizer: ({ param: { dynamicId } }) => getDynamicLink(dynamicId),
  }),

  defineHandler({
    pattern: {
      host: ["m.bilibili.com"],
      path: "/dynamic/:dynamicId",
      param: object({ dynamicId: string() }),
    },
    sanitizer: ({ param: { dynamicId } }) => getDynamicLink(dynamicId),
  }),

  defineHandler({
    pattern: {
      host: ["live.bilibili.com"],
      path: "/:roomId",
      param: object({ roomId: coerce(number(), Number) }),
    },
    sanitizer: ({ param: { roomId } }) => ({
      fullLink: `https://live.bilibili.com/${roomId}`,
      universalLink: `https://live.bilibili.com/${roomId}`,
      customSchemeLink: `bilibili://live/${roomId}`,
    }),
  }),

  defineHandler({
    pattern: {
      host: ["www.bilibili.com", "bilibili.com"],
      path: "/read/:cvId",
      param: object({
        cvId: transform(string([regex(/^cv\d+$/)]), (str) =>
          parseInt(str.slice(2), 10)
        ),
      }),
    },
    sanitizer: ({ param: { cvId } }) => getReadLink(cvId),
  }),

  defineHandler({
    pattern: {
      host: ["www.bilibili.com", "bilibili.com"],
      path: "/read/mobile/:cvId",
      param: object({ cvId: coerce(number(), Number) }),
    },
    sanitizer: ({ param: { cvId } }) => getReadLink(cvId),
  }),

  defineHandler({
    pattern: {
      host: ["www.bilibili.com", "bilibili.com"],
      path: "/read/mobile",
      query: object({
        id: coerce(number(), Number),
      }),
    },
    sanitizer: ({ query: { id } }) => getReadLink(id),
  })
);
