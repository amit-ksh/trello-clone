<script setup lang="ts">
import { watch, reactive, toRaw } from "vue";
import { cloneDeep } from "lodash-es";
import draggable from "vuedraggable";
import { v4 as uuidv4 } from "uuid";
import type { Board, Column, Task } from "@/types";
import TaskCard from "./TaskCard.vue";

const props = defineProps<{
  board: Board;
  tasks: Task[];
}>();
const emit = defineEmits<{ (e: "update", payload: Partial<Board>): void }>();

const tasks = reactive(cloneDeep(props.tasks));
const board = reactive(cloneDeep(props.board));
const columns = reactive<Column[]>(JSON.parse(board.order as string));

function addColumn() {
  columns.push({ id: uuidv4(), title: "New column", taskIds: [] });
}

watch(columns, () =>
  emit(
    "update",
    cloneDeep({
      ...board,
      order: JSON.stringify(toRaw(columns)),
    })
  )
);
</script>

<template>
  <div class="flex items-start py-12">
    <draggable
      :list="columns"
      group="columns"
      item-key="id"
      class="flex flex-grow-0 flex-shrink-0 overflow-x-scroll"
    >
      <template #item="{ element: column }">
        <div
          class="column bg-gray-100 flex flex-col justify-between rounded-lg px-3 py-3 mr-4 w-[300px]"
        >
          <h3>{{ column.title }}</h3>

          <draggable
            :list="column.taskIds"
            group="tasks"
            item-key="uid"
            :animation="200"
            ghost-class="ghost-card"
            class="min-h-[400px]"
          >
            <template #item="{ element: taskId }">
              <TaskCard
                v-if="tasks.find((t: Task) => t.id === taskId)"
                :task="((tasks.find((t: Task) => t.id === taskId)) as Task)"
                class="mt-3 cursor-move"
              />
            </template>
          </draggable>
        </div>
      </template>
    </draggable>
    <button class="text-gray-500" @click="addColumn">New Column +</button>
  </div>
</template>
