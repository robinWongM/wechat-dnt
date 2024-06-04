import { object, string } from "zod";

const echoSchema = object({
  echostr: string(),
})

export default defineEventHandler(async (event) => {
  await useMpAuth(event);

  const { echostr } = await getValidatedQuery(event, (query) => echoSchema.parse(query));
  return echostr;
});
