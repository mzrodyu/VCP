<template>
  <div class="flex h-full">
    <!-- Sidebar -->
    <Sidebar />

    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Header -->
      <header
        class="h-14 bg-dark-sidebar border-b border-dark-border flex items-center justify-between px-4"
      >
        <div class="flex items-center gap-4">
          <button
            @click="toggleSidebar"
            class="p-2 hover:bg-dark-hover rounded-lg lg:hidden"
          >
            <Menu class="w-5 h-5" />
          </button>
          <h1 class="text-lg font-semibold">{{ pageTitle }}</h1>
        </div>

        <div class="flex items-center gap-3">
          <!-- User Menu -->
          <div class="relative" ref="userMenuRef">
            <button
              @click="showUserMenu = !showUserMenu"
              class="flex items-center gap-2 p-2 hover:bg-dark-hover rounded-lg"
            >
              <img
                v-if="authStore.user?.avatar_url"
                :src="authStore.user.avatar_url"
                class="w-8 h-8 rounded-full"
              />
              <div
                v-else
                class="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center"
              >
                {{ authStore.user?.display_name?.[0] || "U" }}
              </div>
              <span class="hidden sm:block">{{
                authStore.user?.display_name
              }}</span>
              <ChevronDown class="w-4 h-4" />
            </button>

            <Transition name="fade">
              <div v-if="showUserMenu" class="dropdown">
                <router-link
                  to="/settings"
                  class="dropdown-item flex items-center gap-2"
                  @click="showUserMenu = false"
                >
                  <Settings class="w-4 h-4" />
                  设置
                </router-link>
                <div
                  v-if="authStore.isAdmin"
                  class="border-t border-dark-border"
                >
                  <router-link
                    to="/admin"
                    class="dropdown-item flex items-center gap-2"
                    @click="showUserMenu = false"
                  >
                    <Shield class="w-4 h-4" />
                    管理后台
                  </router-link>
                </div>
                <div class="border-t border-dark-border">
                  <button
                    @click="handleLogout"
                    class="dropdown-item w-full text-left flex items-center gap-2 text-red-400"
                  >
                    <LogOut class="w-4 h-4" />
                    退出登录
                  </button>
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 overflow-auto bg-dark-bg">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import Sidebar from "@/components/Sidebar.vue";
import { useAuthStore } from "@/stores/auth";
import { ChevronDown, LogOut, Menu, Settings, Shield } from "lucide-vue-next";
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const showUserMenu = ref(false);
const userMenuRef = ref(null);

const pageTitle = computed(() => {
  const titles = {
    Home: "VCPChat Web",
    Chat: "聊天",
    Agents: "助手管理",
    AgentEdit: "编辑助手",
    Groups: "群组",
    GroupEdit: "编辑群组",
    Notes: "笔记",
    Presets: "预设",
    WorldBooks: "世界书",
    WorldBookEdit: "编辑世界书",
    Settings: "设置",
    Admin: "管理后台",
  };
  return titles[route.name] || "VCPChat Web";
});

function toggleSidebar() {
  // TODO: Implement mobile sidebar toggle
}

function handleLogout() {
  authStore.logout();
  router.push("/login");
}

function handleClickOutside(event) {
  if (userMenuRef.value && !userMenuRef.value.contains(event.target)) {
    showUserMenu.value = false;
  }
}

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>
