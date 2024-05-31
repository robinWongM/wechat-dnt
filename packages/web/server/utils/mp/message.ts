import { useMpAccessToken } from "./access-token";

const MP_SEND_TEXT_ENDPOINT =
  "https://api.weixin.qq.com/cgi-bin/message/custom/send";

export const mpSendTextMessage = async (toUser: string, content: string) => {
  console.log("Sending text message to", toUser, ":", content);

  const accessToken = await useMpAccessToken();
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
