<script setup lang="ts">
import type { Video } from "@/types";
import { getFFmpeg } from "@/lib/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

const emit = defineEmits(["onVideoUploaded"]);

const toast = useToast();

const selectedVideo = ref<File | null>(null);
const prompt = ref("");

type Status = "converting" | "uploading" | "transcripting" | "success";
const status = ref<Status | null>(null);

const statusMessages = {
  converting: "Convertendo...",
  uploading: "Carregando...",
  transcripting: "Transcrevendo...",
  success: "Sucesso"
};

const handleSelectFile = (e: InputEvent) => {
  if (status.value) status.value = null;
  selectedVideo.value = (e.target as HTMLInputElement).files![0];
};

const videoPreviewURL = computed(() => {
  if (!selectedVideo.value) return null;
  return URL.createObjectURL(selectedVideo.value);
});

const convertVideoToAudio = async (videoFile: File) => {
  const ffmpeg = await getFFmpeg();
  await ffmpeg.writeFile("input.mp4", await fetchFile(videoFile));

  await ffmpeg.exec([
    "-i",
    "input.mp4",
    "-map",
    "0:a",
    "-b:a",
    "20k",
    "-acodec",
    "libmp3lame",
    "output.mp3"
  ]);

  const fileData = await ffmpeg.readFile("output.mp3");

  const audioFileBlob = new Blob([fileData], { type: "audio/mpeg" });
  const audioFile = new File([audioFileBlob], "audio.mp3", {
    type: "audio/mpeg"
  });

  return audioFile;
};

const handleVideoUpload = async () => {
  if (!selectedVideo.value) return;
  if (selectedVideo.value.size > 25000000) {
    toast.add({
      id: "filesize_error",
      title: "Erro ao carregar o vídeo.",
      description: "O arquivo deve ter um tamanho máximo de 25 MB.",
      icon: "i-heroicons-x-circle",
      color: "red"
    });

    return;
  }

  status.value = "converting";

  const audioFile = await convertVideoToAudio(selectedVideo.value);
  console.log(audioFile);

  status.value = "uploading";

  const uploadFormData = new FormData();
  uploadFormData.append("file", audioFile);

  const { data: uploadedFile, error: uploadError } = await useFetch<Video>("/api/upload", {
    method: "POST",
    body: uploadFormData
  });

  if (uploadError.value) {
    toast.add({
      id: "upload_error",
      title: "Erro ao carregar o vídeo.",
      description: uploadError.value.data.message,
      icon: "i-heroicons-x-circle",
      color: "red"
    });

    status.value = null;
    return;
  }

  if (!uploadedFile.value) return;

  emit("onVideoUploaded", uploadedFile.value.id);

  status.value = "transcripting";

  const { error: transcriptionError } = await useFetch(
    `/api/videos/${uploadedFile.value.id}/transcription`,
    {
      method: "POST",
      body: { prompt: prompt.value }
    }
  );

  if (transcriptionError.value) {
    toast.add({
      id: "transcription_error",
      title: "Não foi possível fazer a transcrição do vídeo.",
      icon: "i-heroicons-x-circle",
      color: "red"
    });

    status.value = null;
    return;
  }

  status.value = "success";
};
</script>

<template>
  <form @submit.prevent="handleVideoUpload" class="space-y-6">
    <label
      for="video"
      class="relative flex aspect-video cursor-pointer flex-col items-center justify-center gap-1 overflow-hidden rounded-md border border-dashed border-gray-700 hover:bg-gray-700/5"
    >
      <video
        v-if="videoPreviewURL"
        :src="videoPreviewURL"
        :controls="false"
        class="pointer-events-none absolute inset-0"
      />

      <template v-else>
        <UIcon name="i-heroicons-video-camera" />
        Carregar vídeo
      </template>

      <UInput @input="handleSelectFile" id="video" class="sr-only" type="file" accept="video/mp4" />
    </label>

    <div class="flex flex-col gap-3">
      <label for="prompt"> Prompt de transcrição </label>
      <UTextarea
        v-model="prompt"
        id="prompt"
        variant="outline"
        color="white"
        placeholder="Inclua palavras-chave mencionadas no vídeo separadas por vírgula"
        autoresize
        :disabled="status === 'success'"
      />

      <UButton
        block
        type="submit"
        size="md"
        color="primary"
        variant="solid"
        :label="status ? statusMessages[status] : 'Carregar vídeo'"
        :trailing="true"
        :loading="!!status && status !== 'success'"
        :disabled="status === 'success'"
        :icon="status === 'success' ? 'i-heroicons-check-circle' : 'i-heroicons-arrow-up-on-square'"
      />
    </div>
  </form>
</template>

<style scoped>
label[for="video"] {
  aspect-ratio: 16 / 9;
}
</style>
