<script setup lang="ts">
import { ref, watch } from "vue";
import { Input as KInput } from "@progress/kendo-vue-inputs";
import { Button as KButton } from "@progress/kendo-vue-buttons";
import type { Label } from "@/types";
import { v4 as uuidv4 } from "uuid";

type L = Partial<Label>;

const props = defineProps<{
  labels: L[];
  selected: L[];
}>();

const emit = defineEmits<{
  (e: "select", payload: L): void;
  (e: "deselect", payload: L): void;
  (e: "create", payload: L): void;
  (e: "delete", payload: L): void;
  (e: "labelsUpdate", payload: L): void;
  (e: "selectionUpdate", payload: L): void;
}>();

const labels = ref<L[]>(props.labels);
const selected = ref<L[]>(props.selected);
const showCreate = ref<boolean>(false);
const newLabel = ref<L>({
  label: "",
  color: "red",
});

// helpers functions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function clone(object: Record<string, any>) {
  return JSON.parse(JSON.stringify(object));
}

function resetNewLabel() {
  newLabel.value.label = "";
  newLabel.value.color = "red";
}

// event handlers
function handleCreate() {
  const label = { ...newLabel.value, id: uuidv4() };
  emit("create", clone(label));
  labels.value?.push(label);
  emit("labelsUpdate", clone(labels.value));
  showCreate.value = false;
  resetNewLabel();
}

function handleUpdate(labelText: string, index: number) {
  labels.value[index].label = labelText;
  emit("labelsUpdate", clone(labels.value));
}

function handleDelete(label: L) {
  labels.value = labels.value?.filter((l) => l.id !== label.id);
  emit("delete", clone(label));
  emit("labelsUpdate", clone(labels.value));
}

function handleToggle(label: L) {
  if (selected.value?.map((l) => l.id).includes(label.id)) {
    selected.value = selected.value.filter((l) => l.id !== label.id);
    emit("deselect", label);
  } else {
    selected.value?.push(label);
    emit("select", label);
  }

  emit("selectionUpdate", clone(selected.value));
}

watch(
  () => props.labels,
  () => {
    labels.value = props.labels;
  }
);

watch(
  () => props.selected,
  () => {
    selected.value = props.selected;
  }
);
</script>

<template>
  <div>
    <button
      v-for="(label, idx) in labels"
      :key="label.id || label.label"
      :class="`bg-${label.color}-500 p-2 rounded text-white my-1 flex justify-between`"
    >
      <div class="flex items-center">
        <span
          class="w-4 h-4 mr-2"
          :class="
            selected?.map((s) => s.id).includes(label.id)
              ? 'k-icon k-i-check'
              : ''
          "
          @click.prevent="handleToggle(label)"
        ></span>
        <input
          type="text"
          class="w-3/4 bg-transparent outline-none"
          :value="label.label"
          @change="
            handleUpdate(($event.target as HTMLInputElement).value, idx),
              ($event.target as HTMLInputElement).blur()
          "
        />
      </div>

      <button
        class="k-icon k-i-trash"
        @click.prevent="handleDelete(label)"
      ></button>
    </button>

    <div>
      <button class="p-2" @click="showCreate = !showCreate">
        + Create Label
      </button>

      <div v-if="showCreate">
        <label class="block">
          Label
          <KInput :style="{ width: '230px' }" v-model="newLabel.label"></KInput>
        </label>

        <label class="block">
          Color
          <AppColorInput v-model="newLabel.color" />
        </label>

        <KButton class="block mt-3" theme-color="primary" @click="handleCreate">
          Create
        </KButton>
      </div>
    </div>
  </div>
</template>
