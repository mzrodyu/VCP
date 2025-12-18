<template>
  <div class="p-6">
    <!-- Welcome Section -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold mb-2">
        欢迎回来，{{ authStore.user?.display_name || "用户" }}！
      </h1>
      <p class="text-dark-text-secondary">
        选择一个助手开始聊天，或创建新的助手
      </p>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div class="card p-4">
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 bg-primary-600/20 rounded-lg flex items-center justify-center"
          >
            <Bot class="w-5 h-5 text-primary-400" />
          </div>
          <div>
            <p class="text-2xl font-bold">{{ agentsStore.agents.length }}</p>
            <p class="text-sm text-dark-text-secondary">助手</p>
          </div>
        </div>
      </div>

      <div class="card p-4">
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center"
          >
            <FileText class="w-5 h-5 text-green-400" />
          </div>
          <div>
            <p class="text-2xl font-bold">{{ notesCount }}</p>
            <p class="text-sm text-dark-text-secondary">笔记</p>
          </div>
        </div>
      </div>

      <div class="card p-4">
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center"
          >
            <BookOpen class="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <p class="text-2xl font-bold">{{ worldbooksCount }}</p>
            <p class="text-sm text-dark-text-secondary">世界书</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Agents -->
    <div class="mb-8">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold">我的助手</h2>
        <router-link
          to="/agents"
          class="text-primary-400 hover:text-primary-300 text-sm"
        >
          查看全部
        </router-link>
      </div>

      <div v-if="agentsStore.loading" class="text-dark-text-secondary">
        加载中...
      </div>

      <div
        v-else-if="agentsStore.agents.length === 0"
        class="card p-8 text-center"
      >
        <Bot class="w-12 h-12 text-dark-text-secondary mx-auto mb-4" />
        <h3 class="font-semibold mb-2">还没有助手</h3>
        <p class="text-dark-text-secondary mb-4">
          创建您的第一个AI助手开始聊天
        </p>
        <button @click="showCreateModal = true" class="btn btn-primary">
          <Plus class="w-4 h-4 mr-2" />
          创建助手
        </button>
      </div>

      <div
        v-else
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      >
        <router-link
          v-for="agent in agentsStore.agents.slice(0, 8)"
          :key="agent.id"
          :to="`/chat/${agent.id}`"
          class="card p-4 hover:border-primary-500 transition-colors group"
        >
          <div class="flex items-center gap-3 mb-3">
            <img
              v-if="agent.avatar_url"
              :src="agent.avatar_url"
              class="w-12 h-12 rounded-full"
            />
            <div
              v-else
              class="w-12 h-12 rounded-full bg-primary-600/20 flex items-center justify-center"
            >
              <span class="text-lg font-semibold text-primary-400">{{
                agent.name[0]
              }}</span>
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="font-semibold truncate">{{ agent.name }}</h3>
              <p class="text-sm text-dark-text-secondary truncate">
                {{ agent.model || "未设置模型" }}
              </p>
            </div>
          </div>
          <div
            class="flex items-center justify-between text-sm text-dark-text-secondary"
          >
            <span>{{ formatDate(agent.updated_at) }}</span>
            <MessageSquare
              class="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </div>
        </router-link>
      </div>
    </div>

    <!-- Quick Actions -->
    <div>
      <h2 class="text-lg font-semibold mb-4">快速操作</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          @click="showCreateModal = true"
          class="card p-4 hover:border-primary-500 transition-colors text-left"
        >
          <Plus class="w-6 h-6 text-primary-400 mb-2" />
          <h3 class="font-medium">创建助手</h3>
          <p class="text-sm text-dark-text-secondary">添加新的AI助手</p>
        </button>

        <router-link
          to="/notes"
          class="card p-4 hover:border-primary-500 transition-colors"
        >
          <FileText class="w-6 h-6 text-green-400 mb-2" />
          <h3 class="font-medium">写笔记</h3>
          <p class="text-sm text-dark-text-secondary">记录您的想法</p>
        </router-link>

        <router-link
          to="/presets"
          class="card p-4 hover:border-primary-500 transition-colors"
        >
          <Sliders class="w-6 h-6 text-yellow-400 mb-2" />
          <h3 class="font-medium">管理预设</h3>
          <p class="text-sm text-dark-text-secondary">创建和编辑预设</p>
        </router-link>

        <router-link
          to="/settings"
          class="card p-4 hover:border-primary-500 transition-colors"
        >
          <Settings class="w-6 h-6 text-gray-400 mb-2" />
          <h3 class="font-medium">设置</h3>
          <p class="text-sm text-dark-text-secondary">配置API和偏好</p>
        </router-link>
      </div>
    </div>

    <!-- Create Agent Modal -->
    <Teleport to="body">
      <div
        v-if="showCreateModal"
        class="modal-overlay"
        @click.self="showCreateModal = false"
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
                @click="showCreateModal = false"
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
  </div>
</template>

<script setup>
import { useAgentsStore } from "@/stores/agents";
import { useAuthStore } from "@/stores/auth";
import {
  BookOpen,
  Bot,
  FileText,
  MessageSquare,
  Plus,
  Settings,
  Sliders,
} from "lucide-vue-next";
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const authStore = useAuthStore();
const agentsStore = useAgentsStore();

const showCreateModal = ref(false);
const newAgentName = ref("");
const notesCount = ref(0);
const worldbooksCount = ref(0);

function formatDate(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;

  if (diff < 60000) return "刚刚";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`;

  return date.toLocaleDateString("zh-CN");
}

async function handleCreateAgent() {
  if (!newAgentName.value.trim()) return;

  const result = await agentsStore.createAgent({
    name: newAgentName.value.trim(),
  });
  if (result.success) {
    showCreateModal.value = false;
    newAgentName.value = "";
    router.push(`/agents/${result.agent.id}/edit`);
  }
}

onMounted(() => {
  agentsStore.fetchAgents();
});
</script>
