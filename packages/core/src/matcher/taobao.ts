import { m } from "../utils/matcher";
import { object, coerce, number } from "valibot";

const taobaoLink = (id: number) => ({
  fullLink: `https://item.taobao.com/item.htm?id=${id}`,
  universalLink: `https://item.taobao.com/item.htm?id=${id}`,
  customSchemeLink: `tbopen://m.taobao.com/tbopen/index.html?id=${id}`,
});

export default [
  m("item.taobao.com")
    .path("/item.htm")
    .input({
      query: object({
        id: coerce(number(), Number),
      }),
    })
    .output(({ query: { id } }) => taobaoLink(id)),

  m("main.m.taobao.com")
    .path("/security-h5-detail/home")
    .input({
      query: object({
        id: coerce(number(), Number),
      }),
    })
    .output(({ query: { id } }) => taobaoLink(id)),
];
