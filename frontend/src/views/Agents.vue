<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold">助手管理</h1>
        <p class="text-dark-text-secondary">管理您的AI助手</p>
      </div>
      <button @click="showCreateModal = true" class="btn btn-primary">
        <Plus class="w-4 h-4 mr-2" />
        创建助手
      </button>
    </div>

    <!-- Search and Filter -->
    <div class="flex gap-4 mb-6">
      <div class="flex-1">
        <input
          v-model="searchTerm"
          type="text"
          class="input"
          placeholder="搜索助手..."
        />
      </div>
    </div>

    <!-- Loading -->
    <div v-if="agentsStore.loading" class="flex justify-center py-12">
      <Loader2 class="w-8 h-8 animate-spin text-primary-400" />
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredAgents.length === 0" class="card p-12 text-center">
      <Bot class="w-16 h-16 text-dark-text-secondary mx-auto mb-4" />
      <h3 class="text-lg font-semibold mb-2">
        {{ searchTerm ? "没有找到匹配的助手" : "还没有助手" }}
      </h3>
      <p class="text-dark-text-secondary mb-4">
        {{ searchTerm ? "尝试其他搜索词" : "创建您的第一个AI助手开始聊天" }}
      </p>
      <button
        v-if="!searchTerm"
        @click="showCreateModal = true"
        class="btn btn-primary"
      >
        <Plus class="w-4 h-4 mr-2" />
        创建助手
      </button>
    </div>

    <!-- Agents Grid -->
    <div
      v-else
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
    >
      <div
        v-for="agent in filteredAgents"
        :key="agent.id"
        class="card p-4 hover:border-primary-500/50 transition-colors"
      >
        <div class="flex items-start gap-3 mb-3">
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

        <p
          v-if="agent.description"
          class="text-sm text-dark-text-secondary mb-3 line-clamp-2"
        >
          {{ agent.description }}
        </p>

        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span v-if="agent.is_public" class="badge badge-success">公开</span>
            <span class="text-xs text-dark-text-secondary">{{
              formatDate(agent.updated_at)
            }}</span>
          </div>

          <div class="flex gap-1">
            <router-link
              :to="`/chat/${agent.id}`"
              class="p-2 hover:bg-dark-hover rounded-lg"
              title="聊天"
            >
              <MessageSquare class="w-4 h-4" />
            </router-link>
            <router-link
              :to="`/agents/${agent.id}/edit`"
              class="p-2 hover:bg-dark-hover rounded-lg"
              title="编辑"
            >
              <Pencil class="w-4 h-4" />
            </router-link>
            <button
              @click="duplicateAgent(agent)"
              class="p-2 hover:bg-dark-hover rounded-lg"
              title="复制"
            >
              <Copy class="w-4 h-4" />
            </button>
            <button
              @click="deleteAgent(agent)"
              class="p-2 hover:bg-dark-hover rounded-lg text-red-400"
              title="删除"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Modal -->
    <Teleport to="body">
      <div
        v-if="showCreateModal"
        class="modal-overlay"
        @click.self="showCreateModal = false"
      >
        <div class="modal-content p-6">
          <h2 class="text-xl font-semibold mb-4">创建新助手</h2>
          <form @submit.prevent="handleCreate">
            <div class="mb-4">
              <label class="block text-sm font-medium mb-2">名称 *</label>
              <input
                v-model="newAgent.name"
                type="text"
                class="input"
                placeholder="输入助手名称"
                required
              />
            </div>
            <div class="mb-4">
              <label class="block text-sm font-medium mb-2">描述</label>
              <textarea
                v-model="newAgent.description"
                class="input resize-none"
                rows="3"
                placeholder="简单描述这个助手..."
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
                :disabled="!newAgent.name.trim()"
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
import {
  Bot,
  Copy,
  Loader2,
  MessageSquare,
  Pencil,
  Plus,
  Trash2,
} from "lucide-vue-next";
import { computed, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const agentsStore = useAgentsStore();

const searchTerm = ref("");
const showCreateModal = ref(false);
const newAgent = reactive({
  name: "",
  description: "",
});

const filteredAgents = computed(() => {
  if (!searchTerm.value) return agentsStore.agents;
  const term = searchTerm.value.toLowerCase();
  return agentsStore.agents.filter(
    (a) =>
      a.name.toLowerCase().includes(term) ||
      (a.description && a.description.toLowerCase().includes(term))
  );
});

function formatDate(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("zh-CN");
}

async function handleCreate() {
  if (!newAgent.name.trim()) return;

  const result = await agentsStore.createAgent({
    name: newAgent.name.trim(),
    description: newAgent.description.trim(),
  });

  if (result.success) {
    showCreateModal.value = false;
    newAgent.name = "";
    newAgent.description = "";
    router.push(`/agents/${result.agent.id}/edit`);
  }
}

async function duplicateAgent(agent) {
  await agentsStore.duplicateAgent(agent.id);
}

async function deleteAgent(agent) {
  if (!confirm(`确定删除助手 "${agent.name}" 吗？此操作不可恢复。`)) return;
  await agentsStore.deleteAgent(agent.id);
}

onMounted(() => {
  agentsStore.fetchAgents();
});
</script>
