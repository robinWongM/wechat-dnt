export default {
  host: ["www.bilibili.com", "bilibili.com", "m.bilibili.com", "t.bilibili.com"],
  title: (title: string) => title.replace(/_哔哩哔哩_bilibili/g, ""),
  description: (description: string) => `📺 分享自 哔哩哔哩\n📖 ${description}`,
}
