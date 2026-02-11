import { qySendKfTextMessage, qySyncMsg } from "~/server/utils/external/qy";
import { handleIncomingMessage } from "~/server/utils/message/handle-message";
import { enqueueTask } from "~/server/utils/message/queue";
import { getKfCursor, saveKfCursor } from "./cursor";

const MAX_BATCHES_PER_SYNC = 20;

type KfSyncRecord = {
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
    return;
  }

  const toUser = getRecordReceiver(record);
  if (!toUser) {
    return;
  }
  const openKfid = getRecordOpenKfid(record, defaultOpenKfid);
  const send = (message: string) =>
    enqueueTask(`kf-send:${openKfid}:${toUser}`, async () => {
      await qySendKfTextMessage(toUser, openKfid, message);
    });
  await handleIncomingMessage(intent, send);
};

export const syncKfMessages = async (input: {
  openKfid: string;
  token?: string;
}) => {
  let cursor = await getKfCursor(input.openKfid);

  for (let idx = 0; idx < MAX_BATCHES_PER_SYNC; idx += 1) {
    const resp = await qySyncMsg({
      openKfid: input.openKfid,
      cursor,
      token: input.token,
    });

    for (const record of resp.msg_list) {
      await processRecord(record, input.openKfid);
    }

    if (resp.next_cursor && resp.next_cursor !== cursor) {
      await saveKfCursor(input.openKfid, resp.next_cursor);
      cursor = resp.next_cursor;
    }

    if (resp.has_more !== 1 || !resp.next_cursor) {
      return;
    }
  }
};

export const enqueueKfSync = (input: { openKfid: string; token?: string }) =>
  enqueueTask(`kf-sync:${input.openKfid}`, async () => {
    await syncKfMessages(input);
  });
