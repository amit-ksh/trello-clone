<script setup lang="ts">
import router from "@/router";
import { Drawer, DrawerContent } from "@progress/kendo-vue-layout";
import { useLocalStorage } from "@vueuse/core";
import { computed, ref } from "vue";

const selectedId = ref(0);
const expanded = useLocalStorage("trello-clone-drawer-expanded", true);
const expandedIcon = computed(() =>
  expanded.value ? "k-i-arrow-chevron-left" : "k-i-arrow-chevron-right"
);
const items = computed(() => [
  {
    text: "Boards",
    icon: "k-i-set-column-position",
    data: {
      path: "/boards",
    },
  },
  {
    text: "Templates",
    icon: "k-i-border-left",
    data: {
      path: "/templates",
    },
  },
  {
    text: "Settings",
    icon: "k-i-gear",
    data: {
      path: "/settings",
    },
  },
  {
    text: "Collapse",
    icon: expandedIcon.value,
    data: {
      action: () => (expanded.value = !expanded.value),
    },
  },
]);

const onSelect = ({ itemIndex }: { itemIndex: number }) => {
  const item = items.value[itemIndex];
  if (!item) return;
  if (item.data.path) router.push(item.data.path);
  if (typeof item.data.action === "function") item.data.action();
};
</script>

<template>
  <Drawer
    class="h-[90vh]"
    :expanded="expanded"
    position="start"
    mode="push"
    :mini="true"
    :items="
      items.map((item, index) => ({
        ...item,
        selected: index === selectedId,
      }))
    "
    @select="onSelect"
  >
    <DrawerContent>
      <div class="px-5">
        <router-view />
      </div>
    </DrawerContent>
  </Drawer>
</template>
