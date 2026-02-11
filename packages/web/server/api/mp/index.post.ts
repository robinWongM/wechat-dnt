import { XMLParser } from "fast-xml-parser";
import { z, object, string, number } from "zod";
import { handleIncomingMessage } from "~/server/utils/message/handle-message";
import { enqueueTask } from "~/server/utils/message/queue";

const xmlParser = new XMLParser({
  parseTagValue: false,
});

const eventSchema = string()
  .transform((xml) => xmlParser.parse(xml))
  .pipe(
    object({
      xml: object({
        FromUserName: string(),
        ToUserName: string(),
        CreateTime: string().or(number()),
        MsgType: string().or(number()),
        Content: string().or(number()).optional(),
        Url: string().optional(),
        Event: string().optional(),
      }),
    }).transform(({ xml }) => xml)
  );
const handleMpEvent = async (event: z.infer<typeof eventSchema>) => {
  const { MsgType, Event, FromUserName } = event;
  const send = (message: string) =>
    enqueueTask(`mp:${FromUserName}`, async () => {
      await mpSendTextMessage(FromUserName, message);
    });

  if (MsgType === "event" && Event === "subscribe") {
    await handleIncomingMessage({ type: "subscribe" }, send);
    return;
  }

  if (MsgType === "text" && event.Content) {
    await handleIncomingMessage({ type: "text", content: `${event.Content}` }, send);
    return;
  }
  if (MsgType === "link" && event.Url) {
    await handleIncomingMessage({ type: "link", url: event.Url }, send);
  }
};

export default defineEventHandler(async (event) => {
  console.info("[mp] callback received");
  const message = await useMpEncryptedMessage(event);

  const { data, error, success } = eventSchema.safeParse(message);
  if (!success) {
    console.error("Failed to parse MP payload", error.name);
  }

  if (data) {
    console.info("[mp] event parsed", data);
    void handleMpEvent(data).catch((handleError) => {
      console.error("[mp] event handling failed", {
        msgType: data.MsgType,
        event: data.Event ?? null,
        error:
          handleError instanceof Error
            ? { name: handleError.name, message: handleError.message }
            : String(handleError),
      });
    });
  }

  return "";
});
