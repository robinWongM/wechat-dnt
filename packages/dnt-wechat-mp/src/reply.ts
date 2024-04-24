import { XMLParser, XMLBuilder } from "fast-xml-parser";

const xmlParser = new XMLParser();
const xmlBuilder = new XMLBuilder({
  cdataPropName: "CData",
});

export const useEvent = (body: string) => {
  const {
    xml: { FromUserName, ToUserName, CreateTime, MsgType, Content, Url, Event },
  } = xmlParser.parse(body);

  const reply = (content: string) => {
    const replyMsg = {
      xml: {
        ToUserName: FromUserName,
        FromUserName: ToUserName,
        CreateTime,
        MsgType: "text",
        Content: {
          CData: content,
        }
      },
    };

    const finalXml = xmlBuilder.build(replyMsg);
    console.log('finalXml', finalXml);

    return finalXml;
  }

  return {
    FromUserName,
    ToUserName,
    CreateTime,
    MsgType,
    Content,
    Url,
    Event,
    reply,
  }
}
