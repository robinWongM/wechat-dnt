const QY_ACCESS_TOKEN_ENDPOINT =
  "https://qyapi.weixin.qq.com/cgi-bin/gettoken";
const MP_SEND_TEXT_ENDPOINT =
  "https://api.weixin.qq.com/cgi-bin/message/custom/send";

let accessToken = "";
let expiresAt = 0;

let refreshAccessTokenPromise: Promise<string> | null = null;

const useQyAccessToken = () => {
  if (Date.now() < expiresAt - 60 * 1000) {
    console.log("Using cached access token");
    return accessToken;
  }

  if (!refreshAccessTokenPromise) {
    console.log("Refreshing access token");
    const {
      qy: { corpId, corpSecret },
    } = useRuntimeConfig();

    const url = new URL(QY_ACCESS_TOKEN_ENDPOINT);
    url.searchParams.append("corpid", corpId);
    url.searchParams.append("corpsecret", corpSecret);

    refreshAccessTokenPromise = fetch(url)
      .then((resp) => resp.json())
      .then((resp: { access_token: string; expires_in: number }) => {
        console.log("Access token refreshed", resp);
        accessToken = resp.access_token;
        expiresAt = Date.now() + resp.expires_in * 1000;
        return accessToken;
      })
      .catch((err) => {
        console.error(err);
        throw err;
      })
      .finally(() => {
        refreshAccessTokenPromise = null;
      });
  }

  return refreshAccessTokenPromise;
};

export const qySendTextMessage = async (toUser: string, content: string) => {
  console.log("Sending text message to", toUser, ":", content);

  const accessToken = await useQyAccessToken();
  const payload = {
    touser: toUser,
    msgtype: "text",
    text: {
      content,
    },
  };

  return fetch(`${MP_SEND_TEXT_ENDPOINT}?access_token=${accessToken}`, {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((resp) => {
      console.log("API response:", resp.status, resp.statusText);
      return resp.json();
    })
    .then((resp) => {
      console.log("API response body:", resp);
    })
    .catch((err) => {
      console.error(err);
      throw err;
    });
};
