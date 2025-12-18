<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold">群组管理</h1>
        <p class="text-dark-text-secondary">管理多角色对话群组</p>
      </div>
      <button @click="showCreateModal = true" class="btn btn-primary">
        <Plus class="w-4 h-4 mr-2" />
        创建群组
      </button>
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <Loader2 class="w-8 h-8 animate-spin text-primary-400" />
    </div>

    <div v-else-if="groups.length === 0" class="card p-12 text-center">
      <Users class="w-16 h-16 text-dark-text-secondary mx-auto mb-4" />
      <h3 class="text-lg font-semibold mb-2">还没有群组</h3>
      <p class="text-dark-text-secondary mb-4">创建群组来进行多角色对话</p>
      <button @click="showCreateModal = true" class="btn btn-primary">
        <Plus class="w-4 h-4 mr-2" />
        创建群组
      </button>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="group in groups"
        :key="group.id"
        class="card p-4 hover:border-primary-500/50 transition-colors"
      >
        <div class="flex items-start gap-3 mb-3">
          <div
            class="w-12 h-12 rounded-full bg-purple-600/20 flex items-center justify-center"
          >
            <Users class="w-6 h-6 text-purple-400" />
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold truncate">{{ group.name }}</h3>
            <p class="text-sm text-dark-text-secondary">
              {{ group.member_count }} 位成员
            </p>
          </div>
        </div>

        <p
          v-if="group.description"
          class="text-sm text-dark-text-secondary mb-3 line-clamp-2"
        >
          {{ group.description }}
        </p>

        <div class="flex items-center justify-between">
          <span class="text-xs text-dark-text-secondary">{{
            formatDate(group.updated_at)
          }}</span>
          <div class="flex gap-1">
            <router-link
              :to="`/groups/${group.id}/edit`"
              class="p-2 hover:bg-dark-hover rounded-lg"
              title="编辑"
            >
              <Pencil class="w-4 h-4" />
            </router-link>
            <button
              @click="deleteGroup(group)"
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
          <h2 class="text-xl font-semibold mb-4">创建新群组</h2>
          <form @submit.prevent="createGroup">
            <div class="mb-4">
              <label class="block text-sm font-medium mb-2">名称 *</label>
              <input
                v-model="newGroup.name"
                type="text"
                class="input"
                placeholder="输入群组名称"
                required
              />
            </div>
            <div class="mb-4">
              <label class="block text-sm font-medium mb-2">描述</label>
              <textarea
                v-model="newGroup.description"
                class="input resize-none"
                rows="3"
                placeholder="简单描述这个群组..."
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
                :disabled="!newGroup.name.trim()"
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
import { useAuthStore } from "@/stores/auth";
import api from "@/utils/api";
import { Loader2, Pencil, Plus, Trash2, Users } from "lucide-vue-next";
import { onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const authStore = useAuthStore();

const groups = ref([]);
const loading = ref(true);
const showCreateModal = ref(false);
const newGroup = reactive({ name: "", description: "" });

async function fetchGroups() {
  loading.value = true;
  try {
    const response = await api.get("/groups");
    groups.value = response.data.groups;
  } catch (error) {
    authStore.showToast("获取群组失败", "error");
  } finally {
    loading.value = false;
  }
}

async function createGroup() {
  try {
    const response = await api.post("/groups", newGroup);
    groups.value.unshift(response.data.group);
    showCreateModal.value = false;
    newGroup.name = "";
    newGroup.description = "";
    router.push(`/groups/${response.data.group.id}/edit`);
  } catch (error) {
    authStore.showToast("创建失败", "error");
  }
}

async function deleteGroup(group) {
  if (!confirm(`确定删除群组 "${group.name}" 吗？`)) return;
  try {
    await api.delete(`/groups/${group.id}`);
    groups.value = groups.value.filter((g) => g.id !== group.id);
    authStore.showToast("删除成功", "success");
  } catch (error) {
    authStore.showToast("删除失败", "error");
  }
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("zh-CN");
}

onMounted(() => {
  fetchGroups();
});
</script>
