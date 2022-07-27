<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { Popup as KPopup } from "@progress/kendo-vue-popup";
import { Button as KButton } from "@progress/kendo-vue-buttons";
import { reactive, ref } from "vue";
import type { Board, Label } from "@/types";
import { onClickOutside } from "@vueuse/core";
import { useMutation } from "@vue/apollo-composable";
import { useAlerts } from "@/stores/alerts";

import attachImageToBoardMutation from "@/graphql/mutations/attachImageToBoard.mutation.gql";
import AppImageDropzone from "./AppImageDropzone.vue";
import AppLabelPicker from "./AppLabelPicker.vue";

type L = Partial<Label>;

defineProps<{
  board: Board;
}>();

const emits = defineEmits<{
  (e: "deleteBoard", payload: null): void;
  (e: "imageUpload", payload: { id: string }): void;
}>();

const alerts = useAlerts();

const show = ref(false);
const menu = ref(null);

onClickOutside(menu, () =>
  setTimeout(() => {
    show.value = false;
  }, 2)
);

const {
  mutate: attachImageToBoard,
  onError: onErrorAttachingImage,
  onDone: onImageAttached,
  loading: imageLoading,
} = useMutation(attachImageToBoardMutation);

onErrorAttachingImage(() => alerts.error("Error setting board image"));

onImageAttached((res) => {
  emits("imageUpload", res.data.boardUpdate.image);
});

const fakeLabelData = reactive<{
  existingLabels: L[] | any;
  selectedLabels: L[] | any;
}>({
  existingLabels: [
    { label: "High Priority", color: "red", id: "1" },
    { label: "Medium Priority", color: "orange", id: "2" },
    { label: "Meh", color: "yellow", id: "3" },
  ],
  selectedLabels: [{ label: "High Priority", color: "red", id: "1" }],
});
</script>
<template>
  <div>
    <KButton
      icon="folder"
      theme-color="primary"
      fillMode="outline"
      @click="show = !show"
      ref="button"
      >Show Menu</KButton
    >
    <KPopup
      :anchor="'button'"
      :anchor-align="{
        vertical: 'bottom',
        horizontal: 'right',
      }"
      :popup-align="{
        horizontal: 'right',
        vertical: 'top',
      }"
      :show="show"
    >
      <div class="p-5" ref="menu">
        <ul>
          <li class="text-red-500 whitespace-nowrap">
            <button @click="$emit('deleteBoard', null)">
              <span class="k-icon k-i-delete"></span>
              Delete Board
            </button>
          </li>
          <li>
            <strong>Board Image</strong>
            <AppImageDropzone
              class="aspect-video w-56"
              :image="board.image?.downloadUrl"
              :loading="imageLoading"
              @upload="
                attachImageToBoard({
                  id: board.id,
                  imageId: $event.id,
                })
              "
            />
          </li>

          <li>
            <AppLabelPicker
              :labels="fakeLabelData.existingLabels"
              :selected="fakeLabelData.selectedLabels"
              @labelsUpdate="fakeLabelData.existingLabels = $event"
              @selectionUpdate="fakeLabelData.selectedLabels = $event"
            />
          </li>
        </ul>
      </div>
    </KPopup>
  </div>
</template>

<style scoped>
ul li {
  @apply p-2;
  border-bottom: 1px solid #eee;
}
ul li:last-of-type {
  border-bottom: none;
}
</style>
