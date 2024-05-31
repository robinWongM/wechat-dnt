import { object, string } from "valibot";
import { m } from "./constructor";
import { stringify } from 'querystringify';

export default [
  m("mp.weixin.qq.com")
    .path("/s")
    .input({
      query: object({
        __biz: string(),
        mid: string(),
        idx: string(),
        sn: string(),
      }),
    })
    .output(({ query }) => {
      return {
        fullLink: `https://mp.weixin.qq.com/s?${stringify(query)}`,
      }
    }),

  m("mp.weixin.qq.com")
    .path("/s/:articleId")
    .output(({ params: { articleId } }) => ({
      fullLink: `https://mp.weixin.qq.com/s/${articleId}`,
    })),
]
