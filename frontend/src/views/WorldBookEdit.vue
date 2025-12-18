<template>
  <div class="p-6 max-w-4xl mx-auto">
    <div v-if="loading" class="flex justify-center py-12">
      <Loader2 class="w-8 h-8 animate-spin text-primary-400" />
    </div>

    <template v-else-if="worldbook">
      <div class="flex items-center gap-4 mb-6">
        <button
          @click="router.back()"
          class="p-2 hover:bg-dark-hover rounded-lg"
        >
          <ArrowLeft class="w-5 h-5" />
        </button>
        <div class="flex-1">
          <h1 class="text-2xl font-bold">编辑世界书</h1>
          <p class="text-dark-text-secondary">{{ worldbook.name }}</p>
        </div>
      </div>

      <!-- Settings -->
      <div class="card p-6 mb-6">
        <h2 class="text-lg font-semibold mb-4">世界书设置</h2>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-2">名称</label>
            <input v-model="form.name" type="text" class="input" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">扫描深度</label>
            <input
              v-model.number="form.scan_depth"
              type="number"
              class="input"
              min="1"
              max="20"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Token预算</label>
            <input
              v-model.number="form.token_budget"
              type="number"
              class="input"
              min="100"
            />
          </div>
          <div class="flex items-center gap-4">
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                v-model="form.is_enabled"
                class="w-4 h-4"
              />
              <span>启用</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" v-model="form.is_public" class="w-4 h-4" />
              <span>公开</span>
            </label>
          </div>
        </div>
        <div class="mt-4">
          <label class="block text-sm font-medium mb-2">描述</label>
          <textarea
            v-model="form.description"
            class="input resize-none"
            rows="2"
          />
        </div>
        <div class="mt-4 flex justify-end">
          <button
            @click="saveWorldbook"
            class="btn btn-primary"
            :disabled="saving"
          >
            保存设置
          </button>
        </div>
      </div>

      <!-- Entries -->
      <div class="card p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold">条目列表</h2>
          <button @click="addEntry" class="btn btn-secondary btn-sm">
            <Plus class="w-4 h-4 mr-1" />
            添加条目
          </button>
        </div>

        <div
          v-if="entries.length === 0"
          class="text-center py-8 text-dark-text-secondary"
        >
          暂无条目，点击添加按钮创建
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="entry in entries"
            :key="entry.id"
            class="bg-dark-bg rounded-lg p-4"
          >
            <div class="flex items-start gap-4">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <input
                    v-model="entry.name"
                    type="text"
                    class="bg-transparent font-medium focus:outline-none"
                    placeholder="条目名称"
                    @blur="updateEntry(entry)"
                  />
                  <span
                    :class="[
                      'badge',
                      entry.is_enabled ? 'badge-success' : 'badge-secondary',
                    ]"
                  >
                    {{ entry.is_enabled ? "启用" : "禁用" }}
                  </span>
                  <span v-if="entry.is_constant" class="badge badge-warning"
                    >常驻</span
                  >
                </div>

                <div class="mb-2">
                  <label class="text-xs text-dark-text-secondary"
                    >触发关键词 (逗号分隔)</label
                  >
                  <input
                    :value="entry.keywords?.join(', ')"
                    type="text"
                    class="input text-sm mt-1"
                    @change="
                      (e) => {
                        entry.keywords = e.target.value
                          .split(',')
                          .map((k) => k.trim())
                          .filter((k) => k);
                        updateEntry(entry);
                      }
                    "
                  />
                </div>

                <div>
                  <label class="text-xs text-dark-text-secondary">内容</label>
                  <textarea
                    v-model="entry.content"
                    class="input text-sm mt-1 resize-none"
                    rows="3"
                    @blur="updateEntry(entry)"
                  />
                </div>
              </div>

              <div class="flex flex-col gap-1">
                <button
                  @click="
                    entry.is_enabled = !entry.is_enabled;
                    updateEntry(entry);
                  "
                  class="p-2 hover:bg-dark-hover rounded"
                  :title="entry.is_enabled ? '禁用' : '启用'"
                >
                  <Power
                    :class="[
                      'w-4 h-4',
                      entry.is_enabled
                        ? 'text-green-400'
                        : 'text-dark-text-secondary',
                    ]"
                  />
                </button>
                <button
                  @click="deleteEntry(entry)"
                  class="p-2 hover:bg-dark-hover rounded text-red-400"
                  title="删除"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { useAuthStore } from "@/stores/auth";
import api from "@/utils/api";
import { ArrowLeft, Loader2, Plus, Power, Trash2 } from "lucide-vue-next";
import { onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const loading = ref(true);
const saving = ref(false);
const worldbook = ref(null);
const entries = ref([]);

const form = reactive({
  name: "",
  description: "",
  scan_depth: 5,
  token_budget: 1000,
  is_enabled: true,
  is_public: false,
});

async function loadWorldbook() {
  loading.value = true;
  try {
    const response = await api.get(`/worldbook/${route.params.id}`);
    worldbook.value = response.data.worldbook;
    entries.value = response.data.worldbook.entries || [];
    Object.assign(form, {
      name: worldbook.value.name,
      description: worldbook.value.description || "",
      scan_depth: worldbook.value.scan_depth,
      token_budget: worldbook.value.token_budget,
      is_enabled: worldbook.value.is_enabled,
      is_public: worldbook.value.is_public,
    });
  } catch (error) {
    authStore.showToast("加载失败", "error");
    router.back();
  } finally {
    loading.value = false;
  }
}

async function saveWorldbook() {
  saving.value = true;
  try {
    await api.put(`/worldbook/${worldbook.value.id}`, form);
    authStore.showToast("保存成功", "success");
  } catch (error) {
    authStore.showToast("保存失败", "error");
  } finally {
    saving.value = false;
  }
}

async function addEntry() {
  try {
    const response = await api.post(
      `/worldbook/${worldbook.value.id}/entries`,
      {
        name: "新条目",
        content: "",
        keywords: [],
      }
    );
    entries.value.push(response.data.entry);
  } catch (error) {
    authStore.showToast("添加失败", "error");
  }
}

async function updateEntry(entry) {
  try {
    await api.put(`/worldbook/entries/${entry.id}`, {
      name: entry.name,
      content: entry.content,
      keywords: entry.keywords,
      is_enabled: entry.is_enabled,
      is_constant: entry.is_constant,
    });
  } catch (error) {
    authStore.showToast("更新失败", "error");
  }
}

async function deleteEntry(entry) {
  if (!confirm("确定删除此条目吗？")) return;
  try {
    await api.delete(`/worldbook/entries/${entry.id}`);
    entries.value = entries.value.filter((e) => e.id !== entry.id);
    authStore.showToast("删除成功", "success");
  } catch (error) {
    authStore.showToast("删除失败", "error");
  }
}

onMounted(() => {
  loadWorldbook();
});
</script>
