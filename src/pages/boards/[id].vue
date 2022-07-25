<script setup lang="ts">
import { computed, toRefs } from "vue";
import BoardDragAndDrop from "../../components/BoardDragAndDrop.vue";
import { useAlerts } from "@/stores/alerts";
import { v4 as uuidv4 } from "uuid";
import { useMutation, useQuery } from "@vue/apollo-composable";
import { useRouter } from "vue-router";
import AppLoader from "../../components/AppLoader.vue";

import getBoardQuery from "@/graphql/queries/board.query.gql";
import boardsQuery from "@/graphql/queries/board.query.gql";
import deleteBoardMutation from "@/graphql/mutations/deleteBoard.mutation.gql";
import updateBoardMutation from "@/graphql/mutations/updateBoard.mutation.gql";
import type { Board, Task } from "@/types";

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
} = useQuery(getBoardQuery, { id: boardId.value });
onBoardError(() => alerts.error("Error loading board!"));
const board = computed(() => boardData.value?.board || null);
const tasks = computed(() => board.value?.tasks?.items);

// handle board updates
const { mutate: updateBoard } = useMutation(updateBoardMutation);

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

async function addTask(task: Task): Promise<Task> {
  return new Promise((resolve) => {
    const taskWithId = {
      ...task,
      id: uuidv4(),
    };
    // persist the change
    resolve(taskWithId);
  });
}
</script>

<template>
  <div v-if="board">
    <div class="flex justify-between">
      <AppPageHeading>
        {{ board.title }}
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
