<script setup lang="ts">
import { useBase64, useDropZone } from "@vueuse/core";
import { ref, computed } from "vue";
import use8baseStorage from "@/composables/use8baseStorage";
import AppImage from "./AppImage.vue";
import AppLoader from "./AppLoader.vue";

const props = defineProps<{
  image?: string;
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: "upload", payload: { id: string }): void;
}>();

const image = ref<string | File | null | undefined>(props.image);
const dropzoneRef = ref<HTMLElement | null>(null);
// @ts-expect-error is checked in src for string type
const { base64: rawImage } = useBase64(image);
const uploadingToFileStack = ref(false);
const src = computed(() =>
  typeof image.value === "string" ? image.value : rawImage.value
);

function onFileSelect(e: Event) {
  handleFiles((e.target as HTMLInputElement).files);
}

function onDrop(files: File[] | null) {
  handleFiles(files);
}

const { uploadAsset } = use8baseStorage();
async function handleFiles(files: FileList | File[] | null) {
  if (!files) return;

  image.value = files[0];
  uploadingToFileStack.value = true;
  const res = await uploadAsset(files[0]);
  emit("upload", res?.data.fileCreate);
  uploadingToFileStack.value = false;
}

const { isOverDropZone } = useDropZone(dropzoneRef, onDrop);
</script>

<template>
  <div
    ref="dropzoneRef"
    class="bg-gray-100 p-2 flex justify-center items-center border-2 border-gray-100 relative"
    :class="{
      'border-blue-200': isOverDropZone,
      'border-2': isOverDropZone,
    }"
  >
    <label for="" class="absolute.top-0.left-0.right-0.bottom-0.block">
      <input
        type="file"
        accept="image/png image/jpeg"
        class="hidden"
        @change="onFileSelect"
      />
    </label>

    <AppImage v-if="image" :src="src" class="aspect-video w-full" />
    <template v-else>
      {{ "Click or drop to upload image" }}
    </template>

    <AppLoader v-if="loading || uploadingToFileStack" :overlay="true" />
  </div>
</template>
