<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold">世界书</h1>
        <p class="text-dark-text-secondary">管理动态上下文注入的知识库</p>
      </div>
      <button @click="showCreateModal = true" class="btn btn-primary">
        <Plus class="w-4 h-4 mr-2" />
        创建世界书
      </button>
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <Loader2 class="w-8 h-8 animate-spin text-primary-400" />
    </div>

    <div v-else-if="worldbooks.length === 0" class="card p-12 text-center">
      <BookOpen class="w-16 h-16 text-dark-text-secondary mx-auto mb-4" />
      <h3 class="text-lg font-semibold mb-2">还没有世界书</h3>
      <p class="text-dark-text-secondary mb-4">创建世界书来为AI提供背景知识</p>
      <button @click="showCreateModal = true" class="btn btn-primary">
        <Plus class="w-4 h-4 mr-2" />
        创建世界书
      </button>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="wb in worldbooks"
        :key="wb.id"
        class="card p-4 hover:border-primary-500/50 transition-colors"
      >
        <div class="flex items-start justify-between mb-2">
          <h3 class="font-semibold">{{ wb.name }}</h3>
          <div class="flex gap-1">
            <span v-if="wb.is_public" class="badge badge-success">公开</span>
            <span
              :class="[
                'badge',
                wb.is_enabled ? 'badge-primary' : 'badge-secondary',
              ]"
            >
              {{ wb.is_enabled ? "启用" : "禁用" }}
            </span>
          </div>
        </div>
        <p
          v-if="wb.description"
          class="text-sm text-dark-text-secondary mb-3 line-clamp-2"
        >
          {{ wb.description }}
        </p>
        <div class="text-xs text-dark-text-secondary mb-3">
          {{ wb.entry_count }} 个条目 · Token预算: {{ wb.token_budget }}
        </div>
        <div class="flex items-center justify-between">
          <span class="text-xs text-dark-text-secondary">{{
            formatDate(wb.updated_at)
          }}</span>
          <div class="flex gap-1">
            <router-link
              :to="`/worldbooks/${wb.id}`"
              class="p-2 hover:bg-dark-hover rounded-lg"
              title="编辑"
            >
              <Pencil class="w-4 h-4" />
            </router-link>
            <button
              @click="duplicateWorldbook(wb)"
              class="p-2 hover:bg-dark-hover rounded-lg"
              title="复制"
            >
              <Copy class="w-4 h-4" />
            </button>
            <button
              @click="deleteWorldbook(wb)"
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
          <h2 class="text-xl font-semibold mb-4">创建世界书</h2>
          <form @submit.prevent="createWorldbook">
            <div class="mb-4">
              <label class="block text-sm font-medium mb-2">名称 *</label>
              <input v-model="newWb.name" type="text" class="input" required />
            </div>
            <div class="mb-4">
              <label class="block text-sm font-medium mb-2">描述</label>
              <textarea
                v-model="newWb.description"
                class="input resize-none"
                rows="3"
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
                :disabled="!newWb.name.trim()"
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
import { BookOpen, Copy, Loader2, Pencil, Plus, Trash2 } from "lucide-vue-next";
import { onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const authStore = useAuthStore();

const worldbooks = ref([]);
const loading = ref(true);
const showCreateModal = ref(false);
const newWb = reactive({ name: "", description: "" });

async function fetchWorldbooks() {
  loading.value = true;
  try {
    const response = await api.get("/worldbook");
    worldbooks.value = response.data.worldbooks;
  } catch (error) {
    authStore.showToast("获取世界书失败", "error");
  } finally {
    loading.value = false;
  }
}

async function createWorldbook() {
  try {
    const response = await api.post("/worldbook", newWb);
    worldbooks.value.unshift(response.data.worldbook);
    showCreateModal.value = false;
    newWb.name = "";
    newWb.description = "";
    router.push(`/worldbooks/${response.data.worldbook.id}`);
  } catch (error) {
    authStore.showToast("创建失败", "error");
  }
}

async function duplicateWorldbook(wb) {
  try {
    const response = await api.post(`/worldbook/${wb.id}/duplicate`);
    worldbooks.value.unshift(response.data.worldbook);
    authStore.showToast("复制成功", "success");
  } catch (error) {
    authStore.showToast("复制失败", "error");
  }
}

async function deleteWorldbook(wb) {
  if (!confirm(`确定删除世界书 "${wb.name}" 吗？`)) return;
  try {
    await api.delete(`/worldbook/${wb.id}`);
    worldbooks.value = worldbooks.value.filter((w) => w.id !== wb.id);
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
  fetchWorldbooks();
});
</script>
