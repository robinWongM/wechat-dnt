export default defineEventHandler(async (event) => {
  const {
    features: { kfEnabled },
  } = useRuntimeConfig(event);

  if (!kfEnabled) {
    throw createError({
      status: 404,
      message: "not found",
    });
  }

  return useQyEchostr(event);
});
