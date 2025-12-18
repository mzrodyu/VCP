<template>
  <div class="p-6 max-w-4xl mx-auto">
    <div v-if="loading" class="flex justify-center py-12">
      <Loader2 class="w-8 h-8 animate-spin text-primary-400" />
    </div>

    <template v-else-if="group">
      <div class="flex items-center gap-4 mb-6">
        <button
          @click="router.back()"
          class="p-2 hover:bg-dark-hover rounded-lg"
        >
          <ArrowLeft class="w-5 h-5" />
        </button>
        <div class="flex-1">
          <h1 class="text-2xl font-bold">编辑群组</h1>
          <p class="text-dark-text-secondary">{{ group.name }}</p>
        </div>
      </div>

      <!-- Basic Info -->
      <div class="card p-6 mb-6">
        <h2 class="text-lg font-semibold mb-4">基本信息</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">名称</label>
            <input v-model="form.name" type="text" class="input" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">描述</label>
            <textarea
              v-model="form.description"
              class="input resize-none"
              rows="3"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">对话模式</label>
            <select v-model="form.chat_mode" class="input">
              <option value="sequential">顺序发言</option>
              <option value="random">随机发言</option>
              <option value="manual">手动指定</option>
            </select>
          </div>
        </div>
        <div class="mt-4 flex justify-end">
          <button @click="saveGroup" class="btn btn-primary" :disabled="saving">
            保存
          </button>
        </div>
      </div>

      <!-- Members -->
      <div class="card p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold">群组成员</h2>
          <button
            @click="showAddMemberModal = true"
            class="btn btn-secondary btn-sm"
          >
            <Plus class="w-4 h-4 mr-1" />
            添加成员
          </button>
        </div>

        <div
          v-if="members.length === 0"
          class="text-center py-8 text-dark-text-secondary"
        >
          暂无成员，请添加助手到群组
        </div>

        <div v-else class="space-y-2">
          <div
            v-for="member in members"
            :key="member.id"
            class="flex items-center gap-3 p-3 bg-dark-bg rounded-lg"
          >
            <div
              class="w-10 h-10 rounded-full bg-primary-600/20 flex items-center justify-center"
            >
              {{ member.agent_name?.[0] || "A" }}
            </div>
            <div class="flex-1">
              <div class="font-medium">{{ member.agent_name }}</div>
              <div class="text-sm text-dark-text-secondary">
                触发概率: {{ (member.trigger_probability * 100).toFixed(0) }}%
              </div>
            </div>
            <button
              @click="removeMember(member)"
              class="p-2 text-red-400 hover:bg-dark-hover rounded"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- Add Member Modal -->
    <Teleport to="body">
      <div
        v-if="showAddMemberModal"
        class="modal-overlay"
        @click.self="showAddMemberModal = false"
      >
        <div class="modal-content p-6">
          <h2 class="text-xl font-semibold mb-4">添加成员</h2>
          <div class="max-h-64 overflow-y-auto space-y-2">
            <div
              v-for="agent in availableAgents"
              :key="agent.id"
              class="flex items-center gap-3 p-3 hover:bg-dark-hover rounded-lg cursor-pointer"
              @click="addMember(agent)"
            >
              <div
                class="w-10 h-10 rounded-full bg-primary-600/20 flex items-center justify-center"
              >
                {{ agent.name[0] }}
              </div>
              <span>{{ agent.name }}</span>
            </div>
          </div>
          <div class="mt-4 flex justify-end">
            <button
              @click="showAddMemberModal = false"
              class="btn btn-secondary"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { useAgentsStore } from "@/stores/agents";
import { useAuthStore } from "@/stores/auth";
import api from "@/utils/api";
import { ArrowLeft, Loader2, Plus, Trash2 } from "lucide-vue-next";
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const agentsStore = useAgentsStore();

const loading = ref(true);
const saving = ref(false);
const group = ref(null);
const members = ref([]);
const showAddMemberModal = ref(false);

const form = reactive({ name: "", description: "", chat_mode: "sequential" });

const availableAgents = computed(() => {
  const memberIds = members.value.map((m) => m.agent_id);
  return agentsStore.agents.filter((a) => !memberIds.includes(a.id));
});

async function loadGroup() {
  loading.value = true;
  try {
    const response = await api.get(`/groups/${route.params.id}`);
    group.value = response.data.group;
    form.name = group.value.name;
    form.description = group.value.description || "";
    form.chat_mode = group.value.chat_mode || "sequential";
    members.value = group.value.members || [];
  } catch (error) {
    authStore.showToast("加载群组失败", "error");
    router.back();
  } finally {
    loading.value = false;
  }
}

async function saveGroup() {
  saving.value = true;
  try {
    await api.put(`/groups/${group.value.id}`, form);
    authStore.showToast("保存成功", "success");
  } catch (error) {
    authStore.showToast("保存失败", "error");
  } finally {
    saving.value = false;
  }
}

async function addMember(agent) {
  try {
    const response = await api.post(`/groups/${group.value.id}/members`, {
      agent_id: agent.id,
    });
    members.value.push(response.data.member);
    showAddMemberModal.value = false;
    authStore.showToast("添加成功", "success");
  } catch (error) {
    authStore.showToast(error.response?.data?.error || "添加失败", "error");
  }
}

async function removeMember(member) {
  if (!confirm("确定移除该成员吗？")) return;
  try {
    await api.delete(`/groups/${group.value.id}/members/${member.id}`);
    members.value = members.value.filter((m) => m.id !== member.id);
    authStore.showToast("移除成功", "success");
  } catch (error) {
    authStore.showToast("移除失败", "error");
  }
}

onMounted(() => {
  loadGroup();
  agentsStore.fetchAgents();
});
</script>
