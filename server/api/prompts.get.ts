import { prisma } from "@/server/lib/prisma";

export default defineCachedEventHandler(async (event) => {
  const prompts = await prisma.prompt.findMany();

  return prompts;
});
