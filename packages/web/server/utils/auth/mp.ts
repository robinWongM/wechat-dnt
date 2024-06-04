import type { H3Event } from "h3";
import { object, string } from "zod";
import { createHash, createDecipheriv } from "node:crypto";
import { XMLParser } from "fast-xml-parser";

const xmlParser = new XMLParser({
  parseTagValue: false,
});

const mpAuthSchema = object({
  signature: string(),
  timestamp: string(),
  nonce: string(),
});

const mpEncryptedQuerySchema = object({
  msg_signature: string(),
  timestamp: string(),
  nonce: string(),
});
const mpEncryptedBodySchema = string()
  .transform((xml) => xmlParser.parse(xml))
  .pipe(
    object({
      xml: object({
        ToUserName: string(),
        Encrypt: string(),
      }),
    }).transform(({ xml }) => xml)
  );

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

export const useMpEncryptedMessage = async (event: H3Event) => {
  const {
    mp: { token, aesKey },
  } = useRuntimeConfig(event);

  const { msg_signature, timestamp, nonce } = await getValidatedQuery(
    event,
    (query) => mpEncryptedQuerySchema.parse(query)
  );
  const { Encrypt } = await readValidatedBody(event, (body) =>
    mpEncryptedBodySchema.parse(body)
  );

  const toBeSigned = [token, timestamp, nonce, Encrypt].sort().join("");
  const hash = createHash("sha1");
  hash.update(toBeSigned);
  const mySignature = hash.digest("hex");

  if (mySignature !== msg_signature) {
    throw createError({
      message: "invalid signature",
      status: 401,
    });
  }

  const decodedKey = Buffer.from(aesKey + "=", "base64");
  const aes = createDecipheriv(
    "aes-256-cbc",
    decodedKey,
    decodedKey.subarray(0, 16)
  );
  const decrypted = aes.update(Encrypt, "base64");

  const msgLength = decrypted.readUInt32BE(16);
  const message = decrypted.subarray(20, 20 + msgLength).toString("utf8");

  return message;
};
