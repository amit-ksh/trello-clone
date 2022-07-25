<script setup>
import { ref, toRefs } from "vue";
import BoardDragAndDrop from "../../components/BoardDragAndDrop.vue";
import { useAlerts } from "@/stores/alerts";
import { v4 as uuidv4 } from "uuid";

const alerts = useAlerts();

const props = defineProps({
  id: String,
});

const { id: boardId } = toRefs(props);
const board = ref({
  id: boardId?.value || "1",
  title: "Let's have an amazing time at Vue.js forge!! 🍍",
  order: JSON.stringify([
    { id: "1", title: "backlog 🌴", taskIds: ["1", "2"] },
  ]),
});
const tasks = ref([
  { id: "1", title: "Code like mad people!" },
  { id: "2", title: "Push clean code" },
]);

const updateBoard = (b) => {
  board.value = b;
  alerts.success("Board updated!");
};

async function addTask(task) {
  return new Promise((resolve, reject) => {
    const taskWithTheId = {
      ...task,
      id: uuidv4(),
    };
    tasks.value.push(taskWithTheId);
    resolve(taskWithTheId);
  });
}
const deleteBoardIfConfirmed = () => {
  console.log("delete board");
};
</script>

<template>
  <div>
    <AppPageHeading>
      {{ board.title }}
    </AppPageHeading>

    <BoardMenu :board="board" @deleteBoard="deleteBoardIfConfirmed" />

    <BoardDragAndDrop
      :tasks="tasks"
      :board="board"
      :add-task="addTask"
      @update="updateBoard"
    />
  </div>
</template>

<style scoped>
pre {
  width: 400px;
  overflow-x: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
