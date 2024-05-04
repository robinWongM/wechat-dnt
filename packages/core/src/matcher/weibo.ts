import { m } from "../utils/matcher";

export default [
  m("www.weibo.com", "weibo.com")
    .path("/:userId/:statusId")
    .output(({ params: { userId, statusId } }) => ({
      fullLink: `https://weibo.com/${userId}/${statusId}`,
      universalLink: `https://weibo.com/${userId}/${statusId}`,
    })),

  m("www.weibo.com", "weibo.com")
    .path("/u/:userId")
    .output(({ params: { userId } }) => ({
      fullLink: `https://weibo.com/u/${userId}`,
      universalLink: `https://weibo.com/u/${userId}`,
    })),

  m("m.weibo.cn")
    .path("/detail/:statusId")
    .output(({ params: { statusId } }) => ({
      fullLink: `https://m.weibo.cn/detail/${statusId}`,
      universalLink: `https://m.weibo.cn/detail/${statusId}`,
    })),

  m("m.weibo.cn")
    .path("/profile/:userId")
    .output(({ params: { userId } }) => ({
      fullLink: `https://m.weibo.cn/profile/${userId}`,
      universalLink: `https://m.weibo.cn/profile/${userId}`,
    })),
];
