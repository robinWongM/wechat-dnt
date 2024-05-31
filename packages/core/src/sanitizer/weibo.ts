import { m } from "./constructor";

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
    .path("/:userId/:statusId/**")
    .output(({ params: { userId, statusId } }) => ({
      fullLink: `https://m.weibo.cn/${userId}/${statusId}`,
      universalLink: `https://m.weibo.cn/${userId}/${statusId}`,
    })),

  m("m.weibo.cn")
    .path("/users/:userId/**")
    .output(({ params: { userId } }) => ({
      fullLink: `https://m.weibo.cn/users/${userId}`,
      universalLink: `https://m.weibo.cn/users/${userId}`,
    })),

  m("m.weibo.cn")
    .path("/:userId/:statusId")
    .output(({ params: { userId, statusId } }) => ({
      fullLink: `https://m.weibo.cn/${userId}/${statusId}`,
      universalLink: `https://m.weibo.cn/${userId}/${statusId}`,
    })),

  m("m.weibo.cn")
    .path("/users/:userId")
    .output(({ params: { userId } }) => ({
      fullLink: `https://m.weibo.cn/users/${userId}`,
      universalLink: `https://m.weibo.cn/users/${userId}`,
    })),
];
