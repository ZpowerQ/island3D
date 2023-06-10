import { createRouter, createWebHistory } from "vue-router";
import cardView from "../views/card.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "card",
      component: cardView,
    },
    {
      path: "/island",
      name: "island",
      component: () => import("../views/island.vue"),
    },
    {
      path: "/bear",
      name: "bear",
      component: () => import("../views/3Dbear.vue"),
    },
    {
      path: "/car",
      name: "car",
      component: () => import("../views/car.vue"),
    },
  ],
});

export default router;
