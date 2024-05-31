import { object, string } from "valibot";
import { m } from "./constructor";

export default [
  m("www.xiaohongshu.com", "xiaohongshu.com")
    .path("/discovery/item/:itemId")
    .output(({ params: { itemId } }) => ({
      fullLink: `https://www.xiaohongshu.com/discovery/item/${itemId}`,
      universalLink: `https://www.xiaohongshu.com/discovery/item/${itemId}`,
      customSchemeLink: `xhsdiscover://item/${itemId}`,
    })),

  m("www.xiaohongshu.com", "xiaohongshu.com")
    .path("/explore/:itemId")
    .output(({ params: { itemId } }) => ({
      fullLink: `https://www.xiaohongshu.com/explore/${itemId}`,
      universalLink: `https://www.xiaohongshu.com/explore/${itemId}`,
      customSchemeLink: `xhsdiscover://item/${itemId}`,
    })),

  m("www.xiaohongshu.com", "xiaohongshu.com")
    .path("/user/profile/:userId")
    .output(({ params: { userId } }) => ({
      fullLink: `https://www.xiaohongshu.com/user/profile/${userId}`,
      universalLink: `https://www.xiaohongshu.com/user/profile/${userId}`,
      customSchemeLink: `xhsdiscover://user/${userId}`,
    })),
];
