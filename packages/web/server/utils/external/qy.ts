const QY_ACCESS_TOKEN_ENDPOINT =
  "https://qyapi.weixin.qq.com/cgi-bin/gettoken";
const QY_KF_SEND_TEXT_ENDPOINT =
  "https://qyapi.weixin.qq.com/cgi-bin/kf/send_msg";
const QY_KF_SYNC_MSG_ENDPOINT = "https://qyapi.weixin.qq.com/cgi-bin/kf/sync_msg";

let accessToken = "";
let expiresAt = 0;

let refreshAccessTokenPromise: Promise<string> | null = null;

type QyResponseBase = {
  errcode: number;
  errmsg: string;
};

type QyTokenResponse = QyResponseBase & {
  access_token: string;
  expires_in: number;
};

type QySyncMsgRecord = {
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

export type QyKfSyncMsgResponse = QyResponseBase & {
  next_cursor: string;
  has_more: 0 | 1;
  msg_list: QySyncMsgRecord[];
};

const assertQySuccess = <T extends QyResponseBase>(resp: T) => {
  if (resp.errcode !== 0) {
    throw createError({
      status: 502,
      message: `qy api error: ${resp.errmsg} (${resp.errcode})`,
    });
  }
  return resp;
};

export const useQyAccessToken = () => {
  if (Date.now() < expiresAt - 60 * 1000) {
    console.info("[qy][token] using cached token");
    return Promise.resolve(accessToken);
  }

  if (!refreshAccessTokenPromise) {
    const {
      qy: { corpId, corpSecret },
    } = useRuntimeConfig();

    const url = new URL(QY_ACCESS_TOKEN_ENDPOINT);
    url.searchParams.append("corpid", corpId);
    url.searchParams.append("corpsecret", corpSecret);

    refreshAccessTokenPromise = fetch(url)
      .then((resp) => resp.json())
      .then((resp: QyTokenResponse) => {
        assertQySuccess(resp);
        accessToken = resp.access_token;
        expiresAt = Date.now() + resp.expires_in * 1000;
        console.info("[qy][token] refreshed token", {
          expiresIn: resp.expires_in,
        });
        return accessToken;
      })
      .finally(() => {
        refreshAccessTokenPromise = null;
      });
  }

  return refreshAccessTokenPromise;
};

export const qySendKfTextMessage = async (
  toUser: string,
  openKfid: string,
  content: string
) => {
  console.info("[qy][send_msg] sending text response", {
    openKfid,
    toUserSuffix: toUser.slice(-6),
    contentLength: content.length,
  });

  const accessToken = await useQyAccessToken();
  const payload = {
    touser: toUser,
    open_kfid: openKfid,
    msgtype: "text",
    text: {
      content,
    },
  };

  return fetch(`${QY_KF_SEND_TEXT_ENDPOINT}?access_token=${accessToken}`, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((resp) => resp.json())
    .then((resp: QyResponseBase) => {
      assertQySuccess(resp);
      console.info("[qy][send_msg] sent successfully", {
        openKfid,
        toUserSuffix: toUser.slice(-6),
      });
      return resp;
    });
};

export const qySyncMsg = async (input: {
  openKfid: string;
  cursor?: string | null;
  token?: string;
  limit?: number;
}) => {
  console.info("[qy][sync_msg] requesting batch", {
    openKfid: input.openKfid,
    hasCursor: Boolean(input.cursor),
    hasToken: Boolean(input.token),
    limit: input.limit ?? 500,
  });

  const accessToken = await useQyAccessToken();
  const payload: {
    open_kfid: string;
    cursor?: string;
    token?: string;
    limit?: number;
  } = {
    open_kfid: input.openKfid,
    limit: input.limit ?? 500,
  };

  if (input.cursor) {
    payload.cursor = input.cursor;
  }
  if (input.token) {
    payload.token = input.token;
  }

  return fetch(`${QY_KF_SYNC_MSG_ENDPOINT}?access_token=${accessToken}`, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((resp) => resp.json())
    .then((resp: QyKfSyncMsgResponse) => {
      assertQySuccess(resp);
      console.info("[qy][sync_msg] batch received", {
        openKfid: input.openKfid,
        hasMore: resp.has_more,
        msgCount: resp.msg_list.length,
        nextCursorChanged: Boolean(resp.next_cursor && resp.next_cursor !== input.cursor),
      });
      return resp;
    });
};
