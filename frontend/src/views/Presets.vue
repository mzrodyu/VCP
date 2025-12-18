<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold">预设管理</h1>
        <p class="text-dark-text-secondary">创建和管理系统提示词预设</p>
      </div>
      <button @click="showCreateModal = true" class="btn btn-primary">
        <Plus class="w-4 h-4 mr-2" />
        创建预设
      </button>
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <Loader2 class="w-8 h-8 animate-spin text-primary-400" />
    </div>

    <div v-else-if="presets.length === 0" class="card p-12 text-center">
      <Sliders class="w-16 h-16 text-dark-text-secondary mx-auto mb-4" />
      <h3 class="text-lg font-semibold mb-2">还没有预设</h3>
      <p class="text-dark-text-secondary mb-4">创建预设来快速配置助手</p>
      <button @click="showCreateModal = true" class="btn btn-primary">
        <Plus class="w-4 h-4 mr-2" />
        创建预设
      </button>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="preset in presets"
        :key="preset.id"
        class="card p-4 hover:border-primary-500/50 transition-colors"
      >
        <div class="flex items-start justify-between mb-2">
          <h3 class="font-semibold">{{ preset.name }}</h3>
          <span v-if="preset.is_public" class="badge badge-success">公开</span>
        </div>
        <p
          v-if="preset.description"
          class="text-sm text-dark-text-secondary mb-3 line-clamp-2"
        >
          {{ preset.description }}
        </p>
        <div class="flex items-center justify-between">
          <span class="text-xs text-dark-text-secondary"
            >使用 {{ preset.usage_count }} 次</span
          >
          <div class="flex gap-1">
            <button
              @click="editPreset(preset)"
              class="p-2 hover:bg-dark-hover rounded-lg"
              title="编辑"
            >
              <Pencil class="w-4 h-4" />
            </button>
            <button
              @click="duplicatePreset(preset)"
              class="p-2 hover:bg-dark-hover rounded-lg"
              title="复制"
            >
              <Copy class="w-4 h-4" />
            </button>
            <button
              @click="deletePreset(preset)"
              class="p-2 hover:bg-dark-hover rounded-lg text-red-400"
              title="删除"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <Teleport to="body">
      <div
        v-if="showCreateModal || showEditModal"
        class="modal-overlay"
        @click.self="closeModal"
      >
        <div class="modal-content p-6 max-w-2xl">
          <h2 class="text-xl font-semibold mb-4">
            {{ showEditModal ? "编辑预设" : "创建预设" }}
          </h2>
          <form
            @submit.prevent="showEditModal ? updatePreset() : createPreset()"
          >
            <div class="mb-4">
              <label class="block text-sm font-medium mb-2">名称 *</label>
              <input v-model="form.name" type="text" class="input" required />
            </div>
            <div class="mb-4">
              <label class="block text-sm font-medium mb-2">描述</label>
              <textarea
                v-model="form.description"
                class="input resize-none"
                rows="2"
              />
            </div>
            <div class="mb-4">
              <label class="block text-sm font-medium mb-2">系统提示词</label>
              <textarea
                v-model="form.content.system_prompt"
                class="input resize-none font-mono text-sm"
                rows="8"
                placeholder="输入系统提示词..."
              />
            </div>
            <div class="mb-4">
              <label class="block text-sm font-medium mb-2">越狱提示词</label>
              <textarea
                v-model="form.content.jailbreak"
                class="input resize-none font-mono text-sm"
                rows="4"
              />
            </div>
            <div class="mb-4">
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  v-model="form.is_public"
                  class="w-4 h-4"
                />
                <span>公开此预设</span>
              </label>
            </div>
            <div class="flex justify-end gap-3">
              <button
                type="button"
                @click="closeModal"
                class="btn btn-secondary"
              >
                取消
              </button>
              <button type="submit" class="btn btn-primary">
                {{ showEditModal ? "保存" : "创建" }}
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
import { Copy, Loader2, Pencil, Plus, Sliders, Trash2 } from "lucide-vue-next";
import { onMounted, reactive, ref } from "vue";

const authStore = useAuthStore();

const presets = ref([]);
const loading = ref(true);
const showCreateModal = ref(false);
const showEditModal = ref(false);
const editingId = ref(null);

const form = reactive({
  name: "",
  description: "",
  content: { system_prompt: "", jailbreak: "" },
  is_public: false,
});

async function fetchPresets() {
  loading.value = true;
  try {
    const response = await api.get("/presets");
    presets.value = response.data.presets;
  } catch (error) {
    authStore.showToast("获取预设失败", "error");
  } finally {
    loading.value = false;
  }
}

function resetForm() {
  form.name = "";
  form.description = "";
  form.content = { system_prompt: "", jailbreak: "" };
  form.is_public = false;
}

function closeModal() {
  showCreateModal.value = false;
  showEditModal.value = false;
  editingId.value = null;
  resetForm();
}

async function createPreset() {
  try {
    const response = await api.post("/presets", form);
    presets.value.unshift(response.data.preset);
    closeModal();
    authStore.showToast("创建成功", "success");
  } catch (error) {
    authStore.showToast("创建失败", "error");
  }
}

async function editPreset(preset) {
  try {
    const response = await api.get(`/presets/${preset.id}`);
    const data = response.data.preset;
    form.name = data.name;
    form.description = data.description || "";
    form.content = data.content || { system_prompt: "", jailbreak: "" };
    form.is_public = data.is_public;
    editingId.value = preset.id;
    showEditModal.value = true;
  } catch (error) {
    authStore.showToast("加载预设失败", "error");
  }
}

async function updatePreset() {
  try {
    const response = await api.put(`/presets/${editingId.value}`, form);
    const idx = presets.value.findIndex((p) => p.id === editingId.value);
    if (idx !== -1) presets.value[idx] = response.data.preset;
    closeModal();
    authStore.showToast("保存成功", "success");
  } catch (error) {
    authStore.showToast("保存失败", "error");
  }
}

async function duplicatePreset(preset) {
  try {
    const response = await api.post(`/presets/${preset.id}/duplicate`);
    presets.value.unshift(response.data.preset);
    authStore.showToast("复制成功", "success");
  } catch (error) {
    authStore.showToast("复制失败", "error");
  }
}

async function deletePreset(preset) {
  if (!confirm(`确定删除预设 "${preset.name}" 吗？`)) return;
  try {
    await api.delete(`/presets/${preset.id}`);
    presets.value = presets.value.filter((p) => p.id !== preset.id);
    authStore.showToast("删除成功", "success");
  } catch (error) {
    authStore.showToast("删除失败", "error");
  }
}

onMounted(() => {
  fetchPresets();
});
</script>
