import { useMpAccessToken } from "./access-token";
import { createHash } from "node:crypto";

const MP_JS_TICKET_ENDPOINT =
  "https://api.weixin.qq.com/cgi-bin/ticket/getticket";

let ticket = "";
let expiresAt = 0;

let refreshTicketPromise: Promise<string> | null = null;

export const useJsTicket = async () => {
  if (Date.now() < expiresAt - 60 * 1000) {
    console.log("Using cached js ticket");
    return ticket;
  }

  if (!refreshTicketPromise) {
    console.log("Refreshing js ticket");

    refreshTicketPromise = useMpAccessToken()
      .then((accessToken) =>
        fetch(`${MP_JS_TICKET_ENDPOINT}?access_token=${accessToken}&type=jsapi`)
      )
      .then((resp) => resp.json())
      .then((resp: { ticket: string; expires_in: number }) => {
        console.log("JS ticket refreshed", resp);
        ticket = resp.ticket;
        expiresAt = Date.now() + resp.expires_in * 1000;
        return ticket;
      })
      .catch((err) => {
        console.error(err);
        throw err;
      })
      .finally(() => {
        refreshTicketPromise = null;
      });
  }

  return refreshTicketPromise;
};
