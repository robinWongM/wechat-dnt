import type { H3Event } from "h3";
import { object, string } from "zod";
import { createHash } from "node:crypto";

const qyAuthSchema = object({
  msg_signature: string(),
  timestamp: string(),
  nonce: string(),
  echostr: string().optional(),
});

export const useQyAuth = async (event: H3Event) => {
  const {
    mp: { token },
  } = useRuntimeConfig(event);

  const { msg_signature, timestamp, nonce } = await getValidatedQuery(
    event,
    (query) => qyAuthSchema.parse(query)
  );

  const toBeSigned = [token, timestamp, nonce].sort().join("");
  const hash = createHash("sha1");
  hash.update(toBeSigned);
  const mySignature = hash.digest("hex");

  if (mySignature !== msg_signature) {
    throw createError({
      message: "invalid signature",
      status: 401,
    });
  }
};
