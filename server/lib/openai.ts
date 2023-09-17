import { OpenAI } from "openai";

export const openai = new OpenAI({
  apiKey: process.env.NUXT_OPENAI_API_KEY,
});
