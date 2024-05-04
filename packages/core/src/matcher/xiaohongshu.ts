import { m } from "../utils/matcher";

export default [
  m("www.xiaohongshu.com", "xiaohongshu.com")
    .path("/discovery/item/:itemId")
    .output(({ params: { itemId } }) => ({
      fullLink: `https://www.xiaohongshu.com/discovery/item/${itemId}`,
      universalLink: `https://www.xiaohongshu.com/discovery/item/${itemId}`,
      customSchemeLink: `xiaohongshu://discovery/item/${itemId}`,
    })),

  m("www.xiaohongshu.com", "xiaohongshu.com")
    .path("/user/profile/:userId")
    .output(({ params: { userId } }) => ({
      fullLink: `https://www.xiaohongshu.com/user/profile/${userId}`,
      universalLink: `https://www.xiaohongshu.com/user/profile/${userId}`,
      customSchemeLink: `xiaohongshu://user/profile/${userId}`,
    })),
];
