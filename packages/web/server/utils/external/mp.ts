const MP_ACCESS_TOKEN_ENDPOINT =
  "https://api.weixin.qq.com/cgi-bin/stable_token";
const MP_SEND_TEXT_ENDPOINT =
  "https://api.weixin.qq.com/cgi-bin/message/custom/send";

let accessToken = "";
let expiresAt = 0;

let refreshAccessTokenPromise: Promise<string> | null = null;

const useMpAccessToken = () => {
  if (Date.now() < expiresAt - 60 * 1000) {
    return accessToken;
  }

  if (!refreshAccessTokenPromise) {
    const {
      mp: { appId, appSecret },
    } = useRuntimeConfig();

    refreshAccessTokenPromise = fetch(MP_ACCESS_TOKEN_ENDPOINT, {
      method: "POST",
      body: new URLSearchParams({
        secret: appSecret,
        grant_type: "client_credential",
        appid: appId,
      }),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
      .then((resp) => resp.json())
      .then((resp: { access_token: string; expires_in: number }) => {
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

export const mpSendTextMessage = async (toUser: string, content: string) => {
  const accessToken = await useMpAccessToken();
  const payload = {
    touser: toUser,
    msgtype: "text",
    text: {
      content,
    },
  };

  return fetch(
    `${MP_SEND_TEXT_ENDPOINT}?access_token=${accessToken}`,
    {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}
