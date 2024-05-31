const MP_ACCESS_TOKEN_ENDPOINT =
  "https://api.weixin.qq.com/cgi-bin/stable_token";

let accessToken = "";
let expiresAt = 0;

let refreshAccessTokenPromise: Promise<string> | null = null;

export const useMpAccessToken = () => {
  if (Date.now() < expiresAt - 60 * 1000) {
    console.log("Using cached access token");
    return Promise.resolve(accessToken);
  }

  if (!refreshAccessTokenPromise) {
    console.log("Refreshing access token");
    const {
      mp: { appId, appSecret },
    } = useRuntimeConfig();

    refreshAccessTokenPromise = fetch(MP_ACCESS_TOKEN_ENDPOINT, {
      method: "POST",
      body: JSON.stringify({
        secret: appSecret,
        grant_type: "client_credential",
        appid: appId,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
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
