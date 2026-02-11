import { eq } from "drizzle-orm";
import { kfSyncCursor } from "~/server/schema";

export const getKfCursor = async (openKfid: string) => {
  const row = await db.query.kfSyncCursor.findFirst({
    where: eq(kfSyncCursor.openKfid, openKfid),
  });
  return row?.cursor ?? null;
};

export const saveKfCursor = async (openKfid: string, cursor: string) => {
  await db
    .insert(kfSyncCursor)
    .values({
      openKfid,
      cursor,
      updatedAt: Date.now(),
    })
    .onConflictDoUpdate({
      target: kfSyncCursor.openKfid,
      set: {
        cursor,
        updatedAt: Date.now(),
      },
    });
};
