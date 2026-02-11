import { useMpAccessToken } from "./access-token";

const MP_SEND_TEXT_ENDPOINT =
  "https://api.weixin.qq.com/cgi-bin/message/custom/send";

export const mpSendTextMessage = async (toUser: string, content: string) => {
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
    .then((resp) => resp.json())
    .catch((err) => {
      console.error(err);
      throw err;
    });
};
