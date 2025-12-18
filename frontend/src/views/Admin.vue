<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">管理后台</h1>

    <!-- Stats -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div class="card p-4">
        <div class="text-2xl font-bold">{{ stats.total_users }}</div>
        <div class="text-sm text-dark-text-secondary">总用户</div>
      </div>
      <div class="card p-4">
        <div class="text-2xl font-bold">{{ stats.total_agents }}</div>
        <div class="text-sm text-dark-text-secondary">总助手</div>
      </div>
      <div class="card p-4">
        <div class="text-2xl font-bold">{{ stats.total_messages }}</div>
        <div class="text-sm text-dark-text-secondary">总消息</div>
      </div>
      <div class="card p-4">
        <div class="text-2xl font-bold">{{ stats.active_users }}</div>
        <div class="text-sm text-dark-text-secondary">活跃用户</div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex border-b border-dark-border mb-6">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="['tab', activeTab === tab.id ? 'active' : '']"
        @click="
          activeTab = tab.id;
          loadTabData();
        "
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Users Table -->
    <div v-show="activeTab === 'users'">
      <div class="flex gap-4 mb-4">
        <input
          v-model="searchTerm"
          type="text"
          class="input flex-1"
          placeholder="搜索用户..."
          @input="searchUsers"
        />
      </div>

      <div class="card overflow-hidden">
        <table class="w-full">
          <thead class="bg-dark-sidebar">
            <tr>
              <th class="text-left p-3">用户</th>
              <th class="text-left p-3">邮箱</th>
              <th class="text-left p-3">角色</th>
              <th class="text-left p-3">状态</th>
              <th class="text-left p-3">注册时间</th>
              <th class="text-left p-3">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="user in users"
              :key="user.id"
              class="border-t border-dark-border"
            >
              <td class="p-3">
                <div class="flex items-center gap-2">
                  <div
                    class="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-sm"
                  >
                    {{ user.display_name?.[0] || user.username[0] }}
                  </div>
                  <div>
                    <div class="font-medium">
                      {{ user.display_name || user.username }}
                    </div>
                    <div class="text-xs text-dark-text-secondary">
                      @{{ user.username }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="p-3 text-dark-text-secondary">{{ user.email }}</td>
              <td class="p-3">
                <span
                  :class="[
                    'badge',
                    user.is_admin ? 'badge-primary' : 'badge-secondary',
                  ]"
                >
                  {{ user.is_admin ? "管理员" : "用户" }}
                </span>
              </td>
              <td class="p-3">
                <span
                  :class="[
                    'badge',
                    user.is_active ? 'badge-success' : 'badge-danger',
                  ]"
                >
                  {{ user.is_active ? "正常" : "禁用" }}
                </span>
              </td>
              <td class="p-3 text-dark-text-secondary">
                {{ formatDate(user.created_at) }}
              </td>
              <td class="p-3">
                <div class="flex gap-1">
                  <button
                    @click="toggleUserActive(user)"
                    class="p-1 hover:bg-dark-hover rounded"
                    :title="user.is_active ? '禁用' : '启用'"
                  >
                    <Ban v-if="user.is_active" class="w-4 h-4" />
                    <Check v-else class="w-4 h-4" />
                  </button>
                  <button
                    @click="toggleUserAdmin(user)"
                    class="p-1 hover:bg-dark-hover rounded"
                    title="切换管理员"
                  >
                    <Shield class="w-4 h-4" />
                  </button>
                  <button
                    @click="resetUserPassword(user)"
                    class="p-1 hover:bg-dark-hover rounded"
                    title="重置密码"
                  >
                    <Key class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="flex justify-center mt-4 gap-2">
        <button
          @click="prevPage"
          :disabled="page === 1"
          class="btn btn-secondary btn-sm"
        >
          上一页
        </button>
        <span class="px-4 py-2">{{ page }} / {{ totalPages }}</span>
        <button
          @click="nextPage"
          :disabled="page >= totalPages"
          class="btn btn-secondary btn-sm"
        >
          下一页
        </button>
      </div>
    </div>

    <!-- Agents Table -->
    <div v-show="activeTab === 'agents'">
      <div class="card overflow-hidden">
        <table class="w-full">
          <thead class="bg-dark-sidebar">
            <tr>
              <th class="text-left p-3">助手</th>
              <th class="text-left p-3">所有者</th>
              <th class="text-left p-3">公开</th>
              <th class="text-left p-3">创建时间</th>
              <th class="text-left p-3">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="agent in agents"
              :key="agent.id"
              class="border-t border-dark-border"
            >
              <td class="p-3">
                <div class="flex items-center gap-2">
                  <div
                    class="w-8 h-8 rounded-full bg-primary-600/20 flex items-center justify-center"
                  >
                    {{ agent.name[0] }}
                  </div>
                  <span>{{ agent.name }}</span>
                </div>
              </td>
              <td class="p-3 text-dark-text-secondary">
                {{ agent.owner_name }}
              </td>
              <td class="p-3">
                <span
                  :class="[
                    'badge',
                    agent.is_public ? 'badge-success' : 'badge-secondary',
                  ]"
                >
                  {{ agent.is_public ? "是" : "否" }}
                </span>
              </td>
              <td class="p-3 text-dark-text-secondary">
                {{ formatDate(agent.created_at) }}
              </td>
              <td class="p-3">
                <button
                  @click="toggleAgentPublic(agent)"
                  class="p-1 hover:bg-dark-hover rounded"
                  :title="agent.is_public ? '设为私有' : '设为公开'"
                >
                  <Eye v-if="agent.is_public" class="w-4 h-4" />
                  <EyeOff v-else class="w-4 h-4" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- System -->
    <div v-show="activeTab === 'system'">
      <div class="card p-6">
        <h2 class="text-lg font-semibold mb-4">系统维护</h2>
        <div class="space-y-4">
          <button
            @click="cleanupSystem"
            class="btn btn-secondary"
            :disabled="cleaning"
          >
            <Loader2 v-if="cleaning" class="w-4 h-4 animate-spin mr-2" />
            清理已删除的消息
          </button>
          <p class="text-sm text-dark-text-secondary">
            清理30天前已删除的消息，释放存储空间
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from "@/stores/auth";
import api from "@/utils/api";
import { Ban, Check, Eye, EyeOff, Key, Loader2, Shield } from "lucide-vue-next";
import { onMounted, reactive, ref } from "vue";

const authStore = useAuthStore();

const activeTab = ref("users");
const searchTerm = ref("");
const page = ref(1);
const totalPages = ref(1);
const cleaning = ref(false);

const stats = reactive({
  total_users: 0,
  active_users: 0,
  total_agents: 0,
  total_messages: 0,
});

const users = ref([]);
const agents = ref([]);

const tabs = [
  { id: "users", label: "用户管理" },
  { id: "agents", label: "助手管理" },
  { id: "system", label: "系统维护" },
];

async function loadStats() {
  try {
    const response = await api.get("/admin/stats");
    Object.assign(stats, response.data.stats);
  } catch (error) {
    console.error("Failed to load stats:", error);
  }
}

async function loadTabData() {
  if (activeTab.value === "users") {
    await loadUsers();
  } else if (activeTab.value === "agents") {
    await loadAgents();
  }
}

async function loadUsers() {
  try {
    const response = await api.get("/admin/users", {
      params: { page: page.value, search: searchTerm.value },
    });
    users.value = response.data.users;
    totalPages.value = response.data.pages;
  } catch (error) {
    authStore.showToast("加载用户失败", "error");
  }
}

async function loadAgents() {
  try {
    const response = await api.get("/admin/agents", {
      params: { page: page.value },
    });
    agents.value = response.data.agents;
    totalPages.value = response.data.pages;
  } catch (error) {
    authStore.showToast("加载助手失败", "error");
  }
}

function searchUsers() {
  page.value = 1;
  loadUsers();
}

function prevPage() {
  if (page.value > 1) {
    page.value--;
    loadTabData();
  }
}

function nextPage() {
  if (page.value < totalPages.value) {
    page.value++;
    loadTabData();
  }
}

async function toggleUserActive(user) {
  try {
    await api.put(`/admin/users/${user.id}`, { is_active: !user.is_active });
    user.is_active = !user.is_active;
    authStore.showToast("操作成功", "success");
  } catch (error) {
    authStore.showToast(error.response?.data?.error || "操作失败", "error");
  }
}

async function toggleUserAdmin(user) {
  try {
    await api.put(`/admin/users/${user.id}`, { is_admin: !user.is_admin });
    user.is_admin = !user.is_admin;
    authStore.showToast("操作成功", "success");
  } catch (error) {
    authStore.showToast(error.response?.data?.error || "操作失败", "error");
  }
}

async function resetUserPassword(user) {
  const newPassword = prompt("输入新密码 (至少6位):");
  if (!newPassword || newPassword.length < 6) return;

  try {
    await api.post(`/admin/users/${user.id}/reset-password`, {
      new_password: newPassword,
    });
    authStore.showToast("密码已重置", "success");
  } catch (error) {
    authStore.showToast("重置失败", "error");
  }
}

async function toggleAgentPublic(agent) {
  try {
    await api.put(`/admin/agents/${agent.id}/visibility`, {
      is_public: !agent.is_public,
    });
    agent.is_public = !agent.is_public;
    authStore.showToast("操作成功", "success");
  } catch (error) {
    authStore.showToast("操作失败", "error");
  }
}

async function cleanupSystem() {
  cleaning.value = true;
  try {
    const response = await api.post("/admin/system/cleanup");
    authStore.showToast(
      `清理完成，删除了 ${response.data.deleted_messages} 条消息`,
      "success"
    );
  } catch (error) {
    authStore.showToast("清理失败", "error");
  } finally {
    cleaning.value = false;
  }
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("zh-CN");
}

onMounted(() => {
  loadStats();
  loadUsers();
});
</script>
