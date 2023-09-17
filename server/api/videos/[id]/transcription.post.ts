import { z } from "zod";
import { prisma } from "@/server/lib/prisma";
import { openai } from "@/server/lib/openai";

export default defineEventHandler(async (event) => {
  const params = getRouterParams(event);
  const body = await readBody(event);

  const paramsSchema = z.object({
    id: z.string().uuid(),
  });

  const bodySchema = z.object({
    prompt: z.string(),
  });

  const { id } = paramsSchema.parse(params);
  const { prompt } = bodySchema.parse(body);

  const video = await prisma.video.findFirstOrThrow({
    where: { id: id },
  });

  const audioData = await fetch(video.path).then((r) => r.blob());
  const audioFile = new File([audioData], "audio.mp3", { type: "audio/mp3" });

  const transcriptionResponse = await openai.audio.transcriptions.create({
    file: audioFile,
    model: "whisper-1",
    language: "pt",
    temperature: 0.1,
    response_format: "json",
    prompt,
  });

  await prisma.video.update({
    where: { id },
    data: { transcription: transcriptionResponse.text },
  });

  return transcriptionResponse.text;
});
