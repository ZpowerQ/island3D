import { createRouter, createWebHistory } from "vue-router";
import bearView from "../views/3Dbear.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "bear",
      component: bearView,
    },
    {
      path: "/island",
      name: "island",
      component: () => import("../views/island.vue"),
    },
  ],
});

export default router;
