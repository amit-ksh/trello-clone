<script setup lang="ts">
import AppNavbar from "./components/AppNavbar.vue";
import AppDrawer from "./components/AppDrawer.vue";
import AppAlerts from "./components/AppAlerts.vue";
import { useAuthUserStore } from "./stores/AuthUserStore";

const authUserStore = useAuthUserStore();
authUserStore.initUser();
</script>

<template>
  <AppNavbar />
  <AppDrawer />
  <AppAlerts />
</template>
