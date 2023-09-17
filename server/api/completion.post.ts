import { z } from "zod";
import { streamToResponse, OpenAIStream } from "ai";
import { prisma } from "@/server/lib/prisma";
import { openai } from "@/server/lib/openai";

export default defineLazyEventHandler(async () => {
  return defineEventHandler(async (event) => {
    const body = await readBody(event);
    console.log(body);

    const bodySchema = z.object({
      videoId: z.string(),
      prompt: z.string(),
      temperature: z.number().min(0).max(1).default(0.5),
    });

    const { videoId, prompt, temperature } = bodySchema.parse(body);

    const video = await prisma.video.findUniqueOrThrow({
      where: { id: videoId },
    });

    if (!video.transcription) {
      throw createError({
        status: 400,
        message: "Não foi possível gerar a transcrição do vídeo.",
      });
    }

    const promptMessage = prompt.replace(
      "{transcription}",
      video.transcription
    );

    const completionResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-16k",
      temperature,
      messages: [{ role: "user", content: promptMessage }],
      stream: true,
    });

    // const stream = OpenAIStream(completionResponse);
    return OpenAIStream(completionResponse);
    // streamToResponse(stream);
  });
});
