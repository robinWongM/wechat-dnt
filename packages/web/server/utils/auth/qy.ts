import type { H3Event } from "h3";
import { object, string } from "zod";
import { createHash, createDecipheriv } from "node:crypto";
import { XMLParser } from "fast-xml-parser";

const xmlParser = new XMLParser({
  parseTagValue: false,
});

const qyAuthSchema = object({
  msg_signature: string(),
  timestamp: string(),
  nonce: string(),
  echostr: string().optional(),
});
const qyEncryptedBodySchema = string()
  .transform((xml) => xmlParser.parse(xml))
  .pipe(
    object({
      xml: object({
        ToUserName: string(),
        Encrypt: string(),
      }),
    }).transform(({ xml }) => xml)
  );

const getQySignature = (
  token: string,
  timestamp: string,
  nonce: string,
  encrypted?: string
) => {
  const toBeSigned = encrypted
    ? [token, timestamp, nonce, encrypted].sort().join("")
    : [token, timestamp, nonce].sort().join("");
  const hash = createHash("sha1");
  hash.update(toBeSigned);
  return hash.digest("hex");
};

const decryptQyPayload = (aesKey: string, encrypted: string) => {
  const decodedKey = Buffer.from(aesKey + "=", "base64") as unknown as Uint8Array;
  const aes = createDecipheriv(
    "aes-256-cbc",
    decodedKey,
    decodedKey.subarray(0, 16)
  );
  const decrypted = aes.update(encrypted, "base64");
  const msgLength = decrypted.readUInt32BE(16);
  return decrypted.subarray(20, 20 + msgLength).toString("utf8");
};

export const useQyAuth = async (event: H3Event) => {
  const {
    qy: { token },
  } = useRuntimeConfig(event);

  const { msg_signature, timestamp, nonce } = await getValidatedQuery(
    event,
    (query) => qyAuthSchema.parse(query)
  );

  const mySignature = getQySignature(token, timestamp, nonce);

  if (mySignature !== msg_signature) {
    throw createError({
      message: "invalid signature",
      status: 401,
    });
  }
};

export const useQyEchostr = async (event: H3Event) => {
  const {
    qy: { token, aesKey },
  } = useRuntimeConfig(event);

  const { msg_signature, timestamp, nonce, echostr } = await getValidatedQuery(
    event,
    (query) => qyAuthSchema.parse(query)
  );

  if (!echostr) {
    throw createError({
      message: "missing echostr",
      status: 400,
    });
  }

  const mySignature = getQySignature(token, timestamp, nonce, echostr);
  if (mySignature !== msg_signature) {
    throw createError({
      message: "invalid signature",
      status: 401,
    });
  }

  return decryptQyPayload(aesKey, echostr);
};

export const useQyEncryptedMessage = async (event: H3Event) => {
  const {
    qy: { token, aesKey },
  } = useRuntimeConfig(event);

  const { msg_signature, timestamp, nonce } = await getValidatedQuery(
    event,
    (query) => qyAuthSchema.parse(query)
  );
  const { Encrypt } = await readValidatedBody(event, (body) =>
    qyEncryptedBodySchema.parse(body)
  );

  const mySignature = getQySignature(token, timestamp, nonce, Encrypt);
  if (mySignature !== msg_signature) {
    throw createError({
      message: "invalid signature",
      status: 401,
    });
  }

  return decryptQyPayload(aesKey, Encrypt);
};
