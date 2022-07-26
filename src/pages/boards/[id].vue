<script setup lang="ts">
import type { Board, Task } from "@/types";
import { computed, ref, toRefs } from "vue";
import BoardDragAndDrop from "../../components/BoardDragAndDrop.vue";
import { useAlerts } from "@/stores/alerts";
import { useMutation, useQuery } from "@vue/apollo-composable";
import { useRouter } from "vue-router";
import AppLoader from "../../components/AppLoader.vue";

import getBoardQuery from "@/graphql/queries/board.query.gql";
import boardsQuery from "@/graphql/queries/board.query.gql";
import deleteBoardMutation from "@/graphql/mutations/deleteBoard.mutation.gql";
import updateBoardMutation from "@/graphql/mutations/updateBoard.mutation.gql";
import addTaskToBoardMutation from "@/graphql/mutations/addTaskToBoard.mutation.gql";

const alerts = useAlerts();
const router = useRouter();

const props = defineProps<{
  id: string;
}>();

const { id: boardId } = toRefs(props);
const {
  result: boardData,
  loading: loadingBoard,
  onError: onBoardError,
} = useQuery(
  getBoardQuery,
  { id: boardId.value },
  { fetchPolicy: "cache-and-network" }
);
onBoardError(() => alerts.error("Error loading board!"));

const board = computed(() => boardData.value?.board || null);
const tasks = computed(() => board.value?.tasks?.items);

// handle board updates
const updatingTitle = ref(false);

const { mutate: updateBoard, onDone: onBoardUpdate } =
  useMutation(updateBoardMutation);

onBoardUpdate(() => {
  updatingTitle.value && alerts.success("Board successfully updated!");
});

// change the title of the board
const updateBoardTitle = async (title: string) => {
  if (board.value.title === title) return;
  updateBoard({ id: boardId.value, title });
};

// handle board delete
const { mutate: deleteBoard, onError: onErrorDeletingBoard } = useMutation(
  deleteBoardMutation,
  {
    update(cache) {
      cache.updateQuery({ query: boardsQuery }, (res) => ({
        boardsList: {
          items: res.boardsList.items.filter(
            (b: Board) => b.id !== boardId.value
          ),
        },
      }));
    },
  }
);

onErrorDeletingBoard(() => alerts.error("Error deleting board"));

async function deleteBoardIfConfirmed() {
  const yes = confirm("Are you sure you want to delete this board?");
  if (yes) {
    await deleteBoard({ id: boardId.value });
    router.push("/");
    alerts.success("Board successfully deleted");
  }
}

// handle create new task
const {
  mutate: addTaskToBoard,
  onError: onErrorCreatingTask,
  onDone: onDoneCreatingTask,
} = useMutation(addTaskToBoardMutation);

onErrorCreatingTask((error) => {
  taskReject(error);
  console.error(error);
  alerts.error("Error creating task");
});

onDoneCreatingTask((res) => {
  taskResolve(res.data.boardUpdate.tasks.items[0]);
  alerts.success("New task created!");
});

// eslint-disable-next-line
let taskResolve = (task: Task) => {};
// eslint-disable-next-line
let taskReject = (message: Error) => {};

async function addTask(task: Task): Promise<Task> {
  return new Promise((resolve, reject) => {
    taskResolve = resolve;
    taskReject = reject;
    addTaskToBoard({ ...task, boardId: boardId.value });
  });
}
</script>

<template>
  <div v-if="board">
    <div class="flex justify-between">
      <AppPageHeading>
        <input
          @keydown.enter="($event.target as HTMLInputElement).blur()"
          @blur="updateBoardTitle(($event.target as HTMLInputElement).value)"
          type="text"
          :value="board.title"
        />
      </AppPageHeading>

      <BoardMenu :board="board" @deleteBoard="deleteBoardIfConfirmed" />
    </div>

    <BoardDragAndDrop
      :tasks="tasks"
      :board="board"
      :add-task="addTask"
      @update="updateBoard"
    />
  </div>

  <AppLoader v-if="loadingBoard" :overlay="true" />
</template>
