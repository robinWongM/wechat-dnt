import { XMLParser, XMLBuilder } from "fast-xml-parser";
import { Context } from "hono";
import { env } from "hono/adapter";
import { fetch } from "ofetch";

const xmlParser = new XMLParser();
const xmlBuilder = new XMLBuilder({
  cdataPropName: "CData",
});

export const useEvent = async (c: Context) => {
  const body = await c.req.text();
  console.log("Received body:", body);

  const {
    xml: { FromUserName, ToUserName, CreateTime, MsgType, Content, Url, Event },
  } = xmlParser.parse(body);

  const { WECHAT_APP_SECRET, WECHAT_ACCESS_TOKEN_ENDPOINT } = env<{
    WECHAT_APP_SECRET: string;
    WECHAT_ACCESS_TOKEN_ENDPOINT: string;
  }>(c);

  const token = await fetch(WECHAT_ACCESS_TOKEN_ENDPOINT, {
    method: "POST",
    body: `secret=${WECHAT_APP_SECRET}`,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  }).then((resp) => resp.text());

  const send = (payload: Record<string, any>) => {
    return fetch(
      `https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token=${token}`,
      {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  const replyText = (content: string) => {
    const payload = {
      touser: FromUserName,
      msgtype: "text",
      text: {
        content,
      },
    };
    return send(payload);
  };

  const replyCard = (title: string, description: string, url: string, picurl: string) => {
    const payload = {
      touser: FromUserName,
      msgtype: "news",
      news: {
        articles: [
          {
            title,
            description,
            url,
            picurl,
          },
        ],
      },
    };
    return send(payload);
  }

  return {
    FromUserName,
    ToUserName,
    CreateTime,
    MsgType,
    Content,
    Url,
    Event,

    reply: replyText,
    replyCard,
  };
};
