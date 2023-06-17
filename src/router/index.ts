import { createRouter, createWebHistory } from "vue-router";
import homeView from "../views/home.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: homeView,
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
    {
      path: "/site",
      name: "site",
      component: () => import("../views/site.vue"),
    },
    {
      path: "/earth",
      name: "earth",
      component: () => import("../views/earth.vue"),
    },
    {
      path: "/word",
      name: "word",
      component: () => import("../views/word.vue"),
    },
    {
      path: "/emoon",
      name: "emoon",
      component: () => import("../views/emoon.vue"),
    },
    {
      path: "/newyear",
      name: "newYear",
      component: () => import("../views/newYear.vue"),
    },
    {
      path: "/football",
      name: "football",
      component: () => import("../views/football.vue"),
    },
    {
      path: "/missile",
      name: "missile",
      component: () => import("../views/missile.vue"),
    },
    {
      path: "/photo3d",
      name: "photo3d",
      component: () => import("../views/photo3d.vue"),
    },
  ],
});
export default router;
