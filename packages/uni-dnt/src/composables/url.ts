import { sanitize } from '@dnt/core';
import URLParse from 'url-parse';

const XOR_CODE = 23442827791579n;
const MASK_CODE = 2251799813685247n;
const MAX_AID = 1n << 51n;
const BASE = 58n;

const data = 'FcwAPNKTMug3GV5Lj7EJnHpWsx4tb8haYeviqBz6rkCy12mUSDQX9RdoZf';

const newUrl = (url: string) => URLParse(url, {}, true);
type URL = ReturnType<typeof newUrl>;

function av2bv(aid: number) {
  const bytes = ['B', 'V', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0'];
  let bvIndex = bytes.length - 1;
  let tmp = (MAX_AID | BigInt(aid)) ^ XOR_CODE;
  while (tmp > 0) {
    bytes[bvIndex] = data[Number(tmp % BigInt(BASE))];
    tmp = tmp / BASE;
    bvIndex -= 1;
  }
  [bytes[3], bytes[9]] = [bytes[9], bytes[3]];
  [bytes[4], bytes[7]] = [bytes[7], bytes[4]];
  return bytes.join('') as `BV1${string}`;
}

export function bv2av(bvid: `BV1${string}`) {
  const bvidArr = Array.from<string>(bvid as string);
  [bvidArr[3], bvidArr[9]] = [bvidArr[9], bvidArr[3]];
  [bvidArr[4], bvidArr[7]] = [bvidArr[7], bvidArr[4]];
  bvidArr.splice(0, 3);
  const tmp = bvidArr.reduce((pre, bvidChar) => pre * BASE + BigInt(data.indexOf(bvidChar)), 0n);
  return Number((tmp & MASK_CODE) ^ XOR_CODE);
}

function cleanUrlBiliBili(url: URL) {
  if (url.hostname !== 'www.bilibili.com' && url.hostname !== 'm.bilibili.com') {
    return;
  }

  const pathSegments = url.pathname.split('/');
  if (pathSegments[1] !== 'video' || !pathSegments[2]) {
    return;
  }

  const bvid = pathSegments[2];
  const avid = bv2av(bvid as `BV1${string}`);

  const t = url.query.t;

  return {
    trimmedUrl: `https://www.bilibili.com/video/${bvid}${
      t ? `?t=${t}` : ''
    }`,
    customScheme: `bilibili://video/${avid}${
      t ? `?start_progress=${parseInt(t, 10) * 1000}` : ''
    }`
  };
}

function cleanUrlWeChatMp(url: URL) {
  if (url.hostname !== 'mp.weixin.qq.com') {
    return;
  }

  const pathSegments = url.pathname.split('/');
  if (pathSegments[1] !== 's') {
    return;
  }

  if (!pathSegments[2] && url.query['__biz']) {
    const finalUrl = newUrl('https://mp.weixin.qq.com/s');
    for (const key of ['__biz', 'mid', 'idx', 'sn']) {
      finalUrl.query[key] = url.query[key];
    }
    return {
      trimmedUrl: finalUrl.toString(),
    }
  }

  return {
    trimmedUrl: `https://mp.weixin.qq.com/s/${pathSegments[2]}`,
  }
}

function cleanUrlTaobao(url: URL) {
  if (url.hostname !== 'main.m.taobao.com' || url.pathname !== '/security-h5-detail/home') {
    return;
  }

  const itemId = url.query.id;

  const trimmedUrl = newUrl('https://item.taobao.com/item.htm');
  trimmedUrl.query.id = itemId;

  const customScheme = newUrl('tbopen://m.taobao.com/tbopen/index.html');
  customScheme.query.h5Url = trimmedUrl.toString();

  return {
    trimmedUrl: trimmedUrl.toString(),
    customScheme: customScheme.toString(),
  }
}

function cleanUrlDouyin(url: URL) {
  if (url.hostname !== 'www.iesdouyin.com' || !url.pathname.startsWith('/share/video/')) {
    return;
  }

  const pathSegments = url.pathname.split('/');
  const videoId = pathSegments[3];
  return {
    trimmedUrl: `https://www.douyin.com/video/${videoId}`,
  }
}

function cleanUrlPotato(url: URL) {
  if (url.hostname !== 'www.xiaohongshu.com') {
    return;
  }

  const isDiscoveryItem = url.pathname.startsWith('/discovery/item/');
  const isUserProfile = url.pathname.startsWith('/user/profile/');
  if (!isDiscoveryItem && !isUserProfile) {
    return;
  }

  const pathSegments = url.pathname.split('/');
  const itemId = pathSegments[3];
  return {
    trimmedUrl: `https://www.xiaohongshu.com/${ isDiscoveryItem ? 'discovery/item' : 'user/profile' }/${itemId}`,
    customScheme: `xhsdiscover://${ isDiscoveryItem ? 'item' : 'user' }/${itemId}`,
  }
}

export function cleanUrl(rawUrl?: string) {
  if (!rawUrl) {
    return;
  }

  const result = sanitize(rawUrl);
  return result;
}
