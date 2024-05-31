import { m } from "./constructor";

const douyinLink = (videoId: string) => ({
  fullLink: `https://www.douyin.com/video/${videoId}`,
  shortLink: `https://v.douyin.com/${videoId}`,
  universalLink: `https://www.douyin.com/video/${videoId}`,
});

export default [
  m("www.douyin.com", "douyin.com")
    .path("/video/:videoId")
    .output(({ params: { videoId } }) => douyinLink(videoId)),

  m("www.iesdouyin.com", "iesdouyin.com")
    .path("/share/video/:videoId")
    .output(({ params: { videoId } }) => douyinLink(videoId)),
];
