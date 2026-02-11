import { object, string } from "zod";
import { enqueueKfSync } from "~/server/utils/kf/sync";

const syncBodySchema = object({
  openKfid: string().optional(),
  token: string().optional(),
});

export default defineEventHandler(async (event) => {
  const {
    features: { kfEnabled },
    qy: { openKfid: configuredOpenKfid, token: adminToken },
  } = useRuntimeConfig(event);

  if (!kfEnabled) {
    throw createError({
      status: 404,
      message: "not found",
    });
  }

  const requestToken = getHeader(event, "x-kf-sync-token");
  if (!requestToken || requestToken !== adminToken) {
    throw createError({
      status: 401,
      message: "unauthorized",
    });
  }

  const body = await readValidatedBody(event, (value) =>
    syncBodySchema.parse(value)
  );
  const targetOpenKfid = body.openKfid ?? configuredOpenKfid;
  if (!targetOpenKfid) {
    throw createError({
      status: 400,
      message: "openKfid is required",
    });
  }

  await enqueueKfSync({
    openKfid: targetOpenKfid,
    token: body.token,
  });

  return {
    ok: true,
  };
});
