import "./common";

import { createApp, h, provide } from "vue";
import App from "./App.vue";
import router from "./router";
import { createPinia } from "pinia";
import { DefaultApolloClient } from "@vue/apollo-composable";
import { apolloClient } from "./graphql/apolloClient";

const app = createApp({
  setup() {
    provide(DefaultApolloClient, apolloClient);
  },
  render: () => h(App),
});
app.use(router).use(createPinia());

app.mount("#app");
