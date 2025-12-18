import { useAuthStore } from "@/stores/auth";
import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/Login.vue"),
    meta: { guest: true },
  },
  {
    path: "/register",
    name: "Register",
    component: () => import("@/views/Register.vue"),
    meta: { guest: true },
  },
  {
    path: "/",
    component: () => import("@/layouts/MainLayout.vue"),
    meta: { requiresAuth: true },
    children: [
      {
        path: "",
        name: "Home",
        component: () => import("@/views/Home.vue"),
      },
      {
        path: "chat/:agentId?/:topicId?",
        name: "Chat",
        component: () => import("@/views/Chat.vue"),
      },
      {
        path: "agents",
        name: "Agents",
        component: () => import("@/views/Agents.vue"),
      },
      {
        path: "agents/:id/edit",
        name: "AgentEdit",
        component: () => import("@/views/AgentEdit.vue"),
      },
      {
        path: "groups",
        name: "Groups",
        component: () => import("@/views/Groups.vue"),
      },
      {
        path: "groups/:id/edit",
        name: "GroupEdit",
        component: () => import("@/views/GroupEdit.vue"),
      },
      {
        path: "notes",
        name: "Notes",
        component: () => import("@/views/Notes.vue"),
      },
      {
        path: "presets",
        name: "Presets",
        component: () => import("@/views/Presets.vue"),
      },
      {
        path: "worldbooks",
        name: "WorldBooks",
        component: () => import("@/views/WorldBooks.vue"),
      },
      {
        path: "worldbooks/:id",
        name: "WorldBookEdit",
        component: () => import("@/views/WorldBookEdit.vue"),
      },
      {
        path: "settings",
        name: "Settings",
        component: () => import("@/views/Settings.vue"),
      },
      {
        path: "admin",
        name: "Admin",
        component: () => import("@/views/Admin.vue"),
        meta: { requiresAdmin: true },
      },
    ],
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@/views/NotFound.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  // Check if user is authenticated
  if (!authStore.isAuthenticated && authStore.token) {
    await authStore.fetchCurrentUser();
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: "Login", query: { redirect: to.fullPath } });
  } else if (to.meta.guest && authStore.isAuthenticated) {
    next({ name: "Home" });
  } else if (to.meta.requiresAdmin && !authStore.isAdmin) {
    next({ name: "Home" });
  } else {
    next();
  }
});

export default router;
