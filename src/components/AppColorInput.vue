<script setup lang="ts">
import type { LabelColor } from "@/types";

const colors: LabelColor[] = [
  "red",
  "orange",
  "yellow",
  "green",
  "blue",
  "purple",
  "pink",
];

defineProps<{
  modelValue?: string;
}>();

defineEmits<{
  (e: "update:modelValue", payload: string): void;
}>();
</script>

<template>
  <div class="flex items-center">
    <button
      v-for="color in colors"
      :key="color"
      class="rounded mr-2"
      :class="`bg-${color}-500 ${modelValue === color ? 'p-2' : 'p-1'}`"
      @click="$emit('update:modelValue', color)"
    >
      <span class="k-icon k-i-check text-white"></span>
    </button>
  </div>
</template>
