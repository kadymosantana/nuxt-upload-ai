<script setup lang="ts">
import type { Prompt } from "@prisma/client";

defineProps({
  videoId: { type: String },
  isLoading: { type: Boolean }
});

defineEmits(["onSubmit", "onPrompt", "onTemperature"]);

const { data: prompts } = await useFetch("/api/prompts");

const selectedModel = ref("GPT 3.5-turbo 16k");
const selectedPrompt = ref<Prompt | string>("");
const selectedTemperature = ref(0.5);
</script>

<template>
  <form @submit.prevent="$emit('onSubmit', $event)" class="space-y-6">
    <label for="model" class="flex flex-col gap-2">
      Prompt
      <USelectMenu
        @change="$emit('onPrompt', (selectedPrompt as Prompt).template)"
        v-model="selectedPrompt"
        :options="prompts!"
        option-attribute="title"
        placeholder="Selecione um prompt..."
        required
      />
    </label>

    <label for="model" class="flex flex-col gap-2">
      Modelo
      <USelectMenu v-model="selectedModel" disabled />
      <span class="text-sm text-gray-500"> Você poderá customizar essa opção em breve. </span>
    </label>

    <label for="temperature" class="flex flex-col gap-2">
      <p>
        Temperatura:
        <span class="text-primary">{{ selectedTemperature }}</span>
      </p>

      <URange
        @change="$emit('onTemperature')"
        v-model="selectedTemperature"
        :min="0"
        :max="1"
        :step="0.1"
      />
      <span class="text-sm text-gray-500">
        Valores mais altos tendem a deixar o resultado mais criativo e com possíveis erros.
      </span>
    </label>

    <UButton
      block
      type="submit"
      icon="i-heroicons-sparkles"
      size="md"
      color="primary"
      variant="solid"
      label="Executar"
      :trailing="true"
      :disabled="isLoading || !videoId"
    />
  </form>
</template>
