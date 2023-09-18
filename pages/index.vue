<script setup lang="ts">
import { useCompletion } from "ai/vue";

const toast = useToast();

const videoId = ref("");
const temperature = ref(0.5);

const handleVideoUploaded = (id: string) => { videoId.value = id };
const handlePromptChange = (value: string) => { input.value = value };
const handleTemperatureChange = (value: number) => { temperature.value = value };

const body = computed(() => {
  return {
    videoId: videoId.value,
    temperature: temperature.value
  };
});

const { input, handleSubmit, completion, isLoading, error } = useCompletion({
  api: "/api/completion",
  headers: { "Content-Type": "applicn/son" },
  body
});
</script>

<template>
  <div class="flex min-h-screen w-screen flex-col bg-gray-900">
    <Header />

    <main class="flex flex-1 flex-col gap-6 p-6 md:flex-row">
      <div class="order-3 flex flex-1 flex-col gap-4 md:order-1">
        <div class="grid flex-1 grid-rows-2 gap-4">
          <UTextarea
            v-model="input"
            class="leading-relaxed"
            variant="outline"
            color="white"
            size="xl"
            placeholder="Inclua o prompt para a IA..."
          />

          <UTextarea
            v-model="completion"
            class="leading-relaxed"
            variant="outline"
            color="white"
            size="xl"
            placeholder="Resultado gerado pela IA..."
            disabled
          />
        </div>

        <p class="text-muted text-sm">
          Lembre-se: você pode usar a variável
          <code class="text-primary"> {transcription} </code> no seu prompt para adicionar o
          conteúdo da transcrição do vídeo selecionado.
        </p>
      </div>

      <Divider class="order-2 md:hidden" />

      <aside class="order-1 space-y-6 md:order-2 md:w-80">
        <VideoUploadForm @onVideoUploaded="handleVideoUploaded" />

        <Divider />

        <PromptForm
          @onSubmit="handleSubmit"
          @onPrompt="handlePromptChange"
          @onTemperature="handleTemperatureChange"
          :videoId="videoId"
          :isLoading="isLoading"
        />
      </aside>
    </main>
  </div>
</template>

<style>
textarea {
  height: 100%;
}
</style>
