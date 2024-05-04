import { m } from "../utils/matcher";
import {
  object,
  string,
  startsWith,
  union,
  optional,
  coerce,
  number,
} from "valibot";

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
      }),
    })
    .output(({ params: { videoId }, query: { t } }) => {
      const timeQuery = t ? `?t=${t}` : "";
      const fullLink = `https://www.bilibili.com/video/${videoId}${timeQuery}`;
      const shortLink = `https://b23.tv/${videoId}${timeQuery}`;
      const universalLink = `https://www.bilibili.com/video/${videoId}`;

      const startProgress = t ? `?start_progress=${t * 1000}` : "";
      const customSchemeLink = `bilibili://video/${bv2av(
        videoId
      )}${startProgress}`;

      return {
        fullLink,
        shortLink,
        universalLink,
        customSchemeLink,
      };
    }),

  m("t.bilibili.com")
    .path("/:dynamicId")
    .output(({ params: { dynamicId } }) => ({
      fullLink: `https://t.bilibili.com/${dynamicId}`,
      universalLink: `https://t.bilibili.com/${dynamicId}`,
      customSchemeLink: `bilibili://dynamic?id=${dynamicId}`,
    })),

  m("m.bilibili.com")
    .path("/dynamic/:dynamicId")
    .output(({ params: { dynamicId } }) => ({
      fullLink: `https://m.bilibili.com/dynamic/${dynamicId}`,
      universalLink: `https://m.bilibili.com/dynamic/${dynamicId}`,
      customSchemeLink: `bilibili://dynamic?id=${dynamicId}`,
    })),
];
