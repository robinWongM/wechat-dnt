import { m } from "./constructor";
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

export default [
  m("www.bilibili.com", "m.bilibili.com")
    .path("/video/:videoId")
    .input({
      params: object({
        videoId: union([
          string([startsWith("BV")]),
          string([startsWith("av")]),
        ]),
      }),
      query: object({
        t: optional(coerce(number(), Number)),
        p: optional(coerce(number(), Number)),
      }),
    })
    .output(({ params: { videoId }, query }) => {
      const timeQuery = stringify(query, true);
      const fullLink = `https://www.bilibili.com/video/${videoId}${timeQuery}`;
      const shortLink = `https://b23.tv/${videoId}${timeQuery}`;
      const universalLink = `https://www.bilibili.com/video/${videoId}`;

      const mobileQuery = stringify(
        {
          ...(query.t ? { start_progress: query.t * 1000 } : {}),
          ...(query.p ? { page: query.p - 1 } : {}),
        },
        true
      );
      const customSchemeLink = `bilibili://video/${bv2av(
        videoId
      )}${mobileQuery}`;

      return {
        fullLink,
        shortLink,
        universalLink,
        customSchemeLink,
      };
    }),

  m("www.bilibili.com", "m.bilibili.com")
    .path("/opus/:opusId")
    .output(({ params: { opusId } }) => getDynamicLink(opusId)),

  m("t.bilibili.com")
    .path("/:dynamicId")
    .output(({ params: { dynamicId } }) => getDynamicLink(dynamicId)),

  m("m.bilibili.com")
    .path("/dynamic/:dynamicId")
    .output(({ params: { dynamicId } }) => getDynamicLink(dynamicId)),

  m("live.bilibili.com")
    .path("/:roomId")
    .input({ params: object({ roomId: coerce(number(), Number) }) })
    .output(({ params: { roomId } }) => ({
      fullLink: `https://live.bilibili.com/${roomId}`,
      universalLink: `https://live.bilibili.com/${roomId}`,
      customSchemeLink: `bilibili://live/${roomId}`,
    })),

  m("www.bilibili.com", "bilibili.com")
    .path("/read/:cvId")
    .input({
      params: object({
        cvId: transform(string([regex(/^cv\d+$/)]), (str) => parseInt(str.slice(2), 10))
      }),
    })
    .output(({ params: { cvId } }) => getReadLink(cvId)),

  m("www.bilibili.com", "bilibili.com")
    .path("/read/mobile/:cvId")
    .input({
      params: object({ cvId: coerce(number(), Number), }),
    })
    .output(({ params: { cvId } }) => getReadLink(cvId)),

  m("www.bilibili.com", "bilibili.com")
    .path("/read/mobile")
    .input({
      query: object({ id: coerce(number(), Number), }),
    })
    .output(({ query: { id } }) => getReadLink(id)),

];
