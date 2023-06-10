import { createRouter, createWebHistory } from "vue-router";
import siteView from "../views/site.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "site",
      component: siteView,
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
    {
      path: "/card",
      name: "card",
      component: () => import("../views/card.vue"),
    },
    {
      path: "/robot",
      name: "robot",
      component: () => import("../views/robot.vue"),
    },
  ],
});

export default router;
