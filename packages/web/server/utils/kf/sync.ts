import { qySendKfTextMessage, qySyncMsg } from "~/server/utils/external/qy";
import { handleIncomingMessage } from "~/server/utils/message/handle-message";
import { enqueueTask } from "~/server/utils/message/queue";
import { getKfCursor, saveKfCursor } from "./cursor";

const MAX_BATCHES_PER_SYNC = 20;

type KfSyncRecord = {
  msgid?: string;
  msgtype: string;
  origin?: number;
  open_kfid?: string;
  external_userid?: string;
  text?: {
    content?: string;
  };
  link?: {
    url?: string;
  };
  event?: {
    event_type?: string;
    open_kfid?: string;
    external_userid?: string;
  };
};

const getRecordReceiver = (record: KfSyncRecord) =>
  record.external_userid ?? record.event?.external_userid;

const getRecordOpenKfid = (record: KfSyncRecord, fallback: string) =>
  record.open_kfid ?? record.event?.open_kfid ?? fallback;

const toIntent = (record: KfSyncRecord) => {
  if (record.msgtype === "text" && record.origin === 3 && record.text?.content) {
    return {
      type: "text" as const,
      content: record.text.content,
    };
  }

  if (record.msgtype === "link" && record.origin === 3 && record.link?.url) {
    return {
      type: "link" as const,
      url: record.link.url,
    };
  }

  if (
    record.msgtype === "event" &&
    record.event?.event_type === "enter_session"
  ) {
    return {
      type: "subscribe" as const,
    };
  }

  return null;
};

const processRecord = async (record: KfSyncRecord, defaultOpenKfid: string) => {
  const intent = toIntent(record);
  if (!intent) {
    console.info("[kf][sync] skip unsupported record", {
      msgtype: record.msgtype,
      eventType: record.event?.event_type,
      origin: record.origin,
    });
    return;
  }

  const toUser = getRecordReceiver(record);
  if (!toUser) {
    console.info("[kf][sync] skip record without receiver", {
      msgtype: record.msgtype,
      eventType: record.event?.event_type,
    });
    return;
  }
  const openKfid = getRecordOpenKfid(record, defaultOpenKfid);
  console.info("[kf][sync] processing record", {
    openKfid,
    toUserSuffix: toUser.slice(-6),
    intent: intent.type,
    msgtype: record.msgtype,
  });
  const send = (message: string) =>
    enqueueTask(`kf-send:${openKfid}:${toUser}`, async () => {
      await qySendKfTextMessage(toUser, openKfid, message);
    });
  await handleIncomingMessage(intent, send);
};

const processRecordSafely = async (
  record: KfSyncRecord,
  defaultOpenKfid: string
) => {
  try {
    await processRecord(record, defaultOpenKfid);
  } catch (error) {
    console.error("[kf][sync] record processing failed, skip this record", {
      msgid: record.msgid,
      msgtype: record.msgtype,
      eventType: record.event?.event_type,
      error:
        error instanceof Error
          ? { name: error.name, message: error.message }
          : String(error),
    });
  }
};

export const syncKfMessages = async (input: {
  openKfid: string;
  token?: string;
}) => {
  let cursor = await getKfCursor(input.openKfid);
  console.info("[kf][sync] start", {
    openKfid: input.openKfid,
    hasToken: Boolean(input.token),
    hasCursor: Boolean(cursor),
  });

  for (let idx = 0; idx < MAX_BATCHES_PER_SYNC; idx += 1) {
    console.info("[kf][sync] fetching batch", {
      openKfid: input.openKfid,
      batchIndex: idx + 1,
    });

    const resp = await qySyncMsg({
      openKfid: input.openKfid,
      cursor,
      token: input.token,
    });

    for (const record of resp.msg_list) {
      console.info("[kf][sync] raw record", JSON.stringify(record, null, 2));
      await processRecordSafely(record, input.openKfid);
    }

    if (resp.next_cursor && resp.next_cursor !== cursor) {
      await saveKfCursor(input.openKfid, resp.next_cursor);
      console.info("[kf][sync] cursor advanced", {
        openKfid: input.openKfid,
        batchIndex: idx + 1,
      });
      cursor = resp.next_cursor;
    }

    if (resp.has_more !== 1 || !resp.next_cursor) {
      console.info("[kf][sync] finished", {
        openKfid: input.openKfid,
        batchIndex: idx + 1,
        hasMore: resp.has_more,
      });
      return;
    }
  }

  console.warn("[kf][sync] reached max batches, stop current run", {
    openKfid: input.openKfid,
    maxBatches: MAX_BATCHES_PER_SYNC,
  });
};

export const enqueueKfSync = (input: { openKfid: string; token?: string }) => {
  console.info("[kf][sync] enqueue", {
    openKfid: input.openKfid,
    hasToken: Boolean(input.token),
  });
  return enqueueTask(`kf-sync:${input.openKfid}`, async () => {
    await syncKfMessages(input);
  });
};
