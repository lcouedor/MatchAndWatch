import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
//createWebHashHistory
import HomeView from "../views/HomeView.vue";
import MainView from "../views/MainView.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "home",
    component: HomeView,
  },
  {
    path: "/match/:roomCode",
    name: "matchingRoom",
    component: MainView,
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;