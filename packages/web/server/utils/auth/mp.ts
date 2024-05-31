import type { H3Event } from "h3";
import { object, string } from "zod";
import { createHash } from "node:crypto";

const mpAuthSchema = object({
  signature: string(),
  timestamp: string(),
  nonce: string(),
});

export const useMpAuth = async (event: H3Event) => {
  const {
    mp: { token },
  } = useRuntimeConfig(event);

  const { signature, timestamp, nonce } = await getValidatedQuery(
    event,
    (query) => mpAuthSchema.parse(query)
  );

  const toBeSigned = [token, timestamp, nonce].sort().join("");
  const hash = createHash("sha1");
  hash.update(toBeSigned);
  const mySignature = hash.digest("hex");

  if (mySignature !== signature) {
    throw createError({
      message: "invalid signature",
      status: 401,
    });
  }
};
