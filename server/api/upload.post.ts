import crypto from "node:crypto";
import path from "node:path";
import { Readable } from "node:stream";
import { v2 as cloudinary } from "cloudinary";
import { prisma } from "@/server/lib/prisma";

cloudinary.config({
  cloud_name: process.env.NUXT_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NUXT_CLOUDINARY_API_KEY,
  api_secret: process.env.NUXT_CLOUDINARY_API_SECRET,
});

export default defineEventHandler(async (event) => {
  const formData = await readMultipartFormData(event);

  const file = formData?.at(0);

  if (!file) {
    throw createError({
      statusCode: 400,
      message: "Arquivo não reconhecido.",
    });
  }

  if (path.extname(file.filename!) !== ".mp3") {
    throw createError({
      statusCode: 415,
      message: "Formato de arquivo não suportado.",
    });
  }

  const fileHash = crypto.randomBytes(10).toString("hex");
  const fileName = `${fileHash}-${file.filename!.split(".")[0]}`;

  return new Promise((res, rej) => {
    const theTransformStream = cloudinary.uploader.upload_stream(
      { resource_type: "auto", folder: "upload-ai", public_id: fileName },
      async (err, result) => {
        if (err) rej(err);

        const video = await prisma.video.create({
          data: {
            name: file.filename!,
            path: result!.url,
          },
        });

        res(video);
      }
    );

    const str = Readable.from(file.data);
    str.pipe(theTransformStream);
  });
});
