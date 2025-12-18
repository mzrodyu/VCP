<template>
  <aside
    class="w-64 bg-dark-sidebar border-r border-dark-border flex flex-col h-full"
  >
    <!-- Logo -->
    <div class="h-14 flex items-center px-4 border-b border-dark-border">
      <router-link to="/" class="flex items-center gap-2">
        <div
          class="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center"
        >
          <MessageSquare class="w-5 h-5 text-white" />
        </div>
        <span class="font-bold text-lg">VCPChat</span>
      </router-link>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 overflow-y-auto p-3 space-y-1">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        :class="['sidebar-item', isActive(item.path) ? 'active' : '']"
      >
        <component :is="item.icon" class="w-5 h-5" />
        <span>{{ item.label }}</span>
      </router-link>

      <!-- Agents Section -->
      <div class="pt-4">
        <div class="flex items-center justify-between px-3 mb-2">
          <span
            class="text-xs font-semibold text-dark-text-secondary uppercase tracking-wider"
            >助手</span
          >
          <button
            @click="createAgent"
            class="p-1 hover:bg-dark-hover rounded"
            title="创建助手"
          >
            <Plus class="w-4 h-4" />
          </button>
        </div>

        <div
          v-if="agentsStore.loading"
          class="px-3 py-2 text-sm text-dark-text-secondary"
        >
          加载中...
        </div>

        <div v-else class="space-y-0.5">
          <router-link
            v-for="agent in agentsStore.agents.slice(0, 10)"
            :key="agent.id"
            :to="`/chat/${agent.id}`"
            :class="[
              'sidebar-item text-sm',
              route.params.agentId == agent.id ? 'active' : '',
            ]"
          >
            <img
              v-if="agent.avatar_url"
              :src="agent.avatar_url"
              class="w-6 h-6 rounded-full"
            />
            <div
              v-else
              class="w-6 h-6 rounded-full bg-dark-hover flex items-center justify-center text-xs"
            >
              {{ agent.name[0] }}
            </div>
            <span class="truncate">{{ agent.name }}</span>
          </router-link>

          <router-link
            v-if="agentsStore.agents.length > 10"
            to="/agents"
            class="sidebar-item text-sm text-dark-text-secondary"
          >
            <MoreHorizontal class="w-5 h-5" />
            <span>查看全部 ({{ agentsStore.agents.length }})</span>
          </router-link>
        </div>
      </div>

      <!-- Groups Section -->
      <div class="pt-4">
        <div class="flex items-center justify-between px-3 mb-2">
          <span
            class="text-xs font-semibold text-dark-text-secondary uppercase tracking-wider"
            >群组</span
          >
          <button
            @click="createGroup"
            class="p-1 hover:bg-dark-hover rounded"
            title="创建群组"
          >
            <Plus class="w-4 h-4" />
          </button>
        </div>

        <router-link to="/groups" class="sidebar-item text-sm">
          <Users class="w-5 h-5" />
          <span>群组管理</span>
        </router-link>
      </div>
    </nav>

    <!-- Bottom Section -->
    <div class="p-3 border-t border-dark-border">
      <router-link to="/settings" class="sidebar-item">
        <Settings class="w-5 h-5" />
        <span>设置</span>
      </router-link>
    </div>
  </aside>

  <!-- Create Agent Modal -->
  <Teleport to="body">
    <div
      v-if="showCreateAgentModal"
      class="modal-overlay"
      @click.self="showCreateAgentModal = false"
    >
      <div class="modal-content p-6">
        <h2 class="text-xl font-semibold mb-4">创建新助手</h2>
        <form @submit.prevent="handleCreateAgent">
          <div class="mb-4">
            <label class="block text-sm font-medium mb-2">名称</label>
            <input
              v-model="newAgentName"
              type="text"
              class="input"
              placeholder="输入助手名称"
              required
            />
          </div>
          <div class="flex justify-end gap-3">
            <button
              type="button"
              @click="showCreateAgentModal = false"
              class="btn btn-secondary"
            >
              取消
            </button>
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="!newAgentName.trim()"
            >
              创建
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { useAgentsStore } from "@/stores/agents";
import {
  BookOpen,
  Bot,
  FileText,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Settings,
  Sliders,
  Users,
} from "lucide-vue-next";
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const agentsStore = useAgentsStore();

const showCreateAgentModal = ref(false);
const newAgentName = ref("");

const navItems = [
  { path: "/", label: "首页", icon: MessageSquare },
  { path: "/agents", label: "助手管理", icon: Bot },
  { path: "/notes", label: "笔记", icon: FileText },
  { path: "/presets", label: "预设", icon: Sliders },
  { path: "/worldbooks", label: "世界书", icon: BookOpen },
];

function isActive(path) {
  if (path === "/") {
    return route.path === "/";
  }
  return route.path.startsWith(path);
}

function createAgent() {
  showCreateAgentModal.value = true;
  newAgentName.value = "";
}

async function handleCreateAgent() {
  if (!newAgentName.value.trim()) return;

  const result = await agentsStore.createAgent({
    name: newAgentName.value.trim(),
  });
  if (result.success) {
    showCreateAgentModal.value = false;
    router.push(`/agents/${result.agent.id}/edit`);
  }
}

function createGroup() {
  router.push("/groups?create=true");
}

onMounted(() => {
  agentsStore.fetchAgents();
});
</script>
