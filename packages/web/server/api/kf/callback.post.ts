import { XMLParser } from "fast-xml-parser";
import { object, string } from "zod";
import { enqueueKfSync } from "~/server/utils/kf/sync";

const xmlParser = new XMLParser({
  parseTagValue: false,
});

const callbackEventSchema = string()
  .transform((xml) => xmlParser.parse(xml))
  .pipe(
    object({
      xml: object({
        Event: string(),
        Token: string().optional(),
        OpenKfId: string().optional(),
      }),
    }).transform(({ xml }) => xml)
  );

export default defineEventHandler(async (event) => {
  const {
    features: { kfEnabled },
    qy: { openKfid: configuredOpenKfid },
  } = useRuntimeConfig(event);

  if (!kfEnabled) {
    console.info("[kf][callback] disabled, skip request");
    throw createError({
      status: 404,
      message: "not found",
    });
  }

  console.info("[kf][callback] received callback request");
  const message = await useQyEncryptedMessage(event);
  const parsed = callbackEventSchema.safeParse(message);
  if (!parsed.success) {
    console.error("Failed to parse KF callback payload", parsed.error.name);
    return "success";
  }

  if (parsed.data.Event !== "kf_msg_or_event") {
    return "success";
  }

  const targetOpenKfid = parsed.data.OpenKfId ?? configuredOpenKfid;
  if (!targetOpenKfid) {
    console.error("Missing open_kfid for KF sync");
    return "success";
  }

  console.info("[kf][callback] enqueue sync", {
    event: parsed.data.Event,
    hasToken: Boolean(parsed.data.Token),
    openKfid: targetOpenKfid,
  });

  void enqueueKfSync({
    openKfid: targetOpenKfid,
    token: parsed.data.Token,
  });

  return "success";
});
