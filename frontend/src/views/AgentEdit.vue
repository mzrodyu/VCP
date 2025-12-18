<template>
  <div class="p-6 max-w-4xl mx-auto">
    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-12">
      <Loader2 class="w-8 h-8 animate-spin text-primary-400" />
    </div>

    <template v-else-if="agent">
      <!-- Header -->
      <div class="flex items-center gap-4 mb-6">
        <button
          @click="router.back()"
          class="p-2 hover:bg-dark-hover rounded-lg"
        >
          <ArrowLeft class="w-5 h-5" />
        </button>
        <div class="flex-1">
          <h1 class="text-2xl font-bold">编辑助手</h1>
          <p class="text-dark-text-secondary">{{ agent.name }}</p>
        </div>
        <router-link :to="`/chat/${agent.id}`" class="btn btn-secondary">
          <MessageSquare class="w-4 h-4 mr-2" />
          聊天
        </router-link>
      </div>

      <!-- Tabs -->
      <div class="flex border-b border-dark-border mb-6">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :class="['tab', activeTab === tab.id ? 'active' : '']"
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Tab Content -->
      <form @submit.prevent="saveAgent">
        <!-- Basic Info -->
        <div v-show="activeTab === 'basic'" class="space-y-6">
          <!-- Avatar and Name -->
          <div class="flex gap-6">
            <div class="flex-shrink-0">
              <div class="relative">
                <img
                  v-if="form.avatar_url"
                  :src="form.avatar_url"
                  class="w-24 h-24 rounded-full object-cover"
                />
                <div
                  v-else
                  class="w-24 h-24 rounded-full bg-primary-600/20 flex items-center justify-center"
                >
                  <Bot class="w-12 h-12 text-primary-400" />
                </div>
                <label
                  class="absolute bottom-0 right-0 p-2 bg-dark-card border border-dark-border rounded-full cursor-pointer hover:bg-dark-hover"
                >
                  <Camera class="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    class="hidden"
                    @change="handleAvatarChange"
                  />
                </label>
              </div>
            </div>
            <div class="flex-1 space-y-4">
              <div>
                <label class="block text-sm font-medium mb-2">名称 *</label>
                <input v-model="form.name" type="text" class="input" required />
              </div>
              <div>
                <label class="block text-sm font-medium mb-2">描述</label>
                <textarea
                  v-model="form.description"
                  class="input resize-none"
                  rows="3"
                />
              </div>
            </div>
          </div>

          <div class="flex items-center gap-4">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" v-model="form.is_public" class="w-4 h-4" />
              <span>公开此助手</span>
            </label>
          </div>
        </div>

        <!-- Prompts -->
        <div v-show="activeTab === 'prompts'" class="space-y-6">
          <div>
            <label class="block text-sm font-medium mb-2">主系统提示词</label>
            <textarea
              v-model="form.system_prompt_main"
              class="input resize-none font-mono text-sm"
              rows="10"
              placeholder="定义AI的角色、性格和行为..."
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2"
              >越狱提示词 (可选)</label
            >
            <textarea
              v-model="form.system_prompt_jailbreak"
              class="input resize-none font-mono text-sm"
              rows="6"
              placeholder="在对话末尾添加的额外指令..."
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2"
              >助手笔记 (可选)</label
            >
            <textarea
              v-model="form.system_prompt_assistant"
              class="input resize-none font-mono text-sm"
              rows="4"
              placeholder="角色相关的背景信息..."
            />
          </div>
        </div>

        <!-- Model Settings -->
        <div v-show="activeTab === 'model'" class="space-y-6">
          <div>
            <label class="block text-sm font-medium mb-2">模型名称</label>
            <input
              v-model="form.model"
              type="text"
              class="input"
              placeholder="例如: gpt-3.5-turbo"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-2"
                >Temperature ({{ form.temperature }})</label
              >
              <input
                v-model.number="form.temperature"
                type="range"
                min="0"
                max="2"
                step="0.1"
                class="w-full"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2"
                >Top P ({{ form.top_p }})</label
              >
              <input
                v-model.number="form.top_p"
                type="range"
                min="0"
                max="1"
                step="0.05"
                class="w-full"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-2"
                >上下文Token上限</label
              >
              <input
                v-model.number="form.context_token_limit"
                type="number"
                class="input"
                min="0"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2"
                >最大输出Token</label
              >
              <input
                v-model.number="form.max_output_tokens"
                type="number"
                class="input"
                min="0"
              />
            </div>
          </div>

          <div>
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                v-model="form.stream_output"
                class="w-4 h-4"
              />
              <span>流式输出</span>
            </label>
          </div>
        </div>

        <!-- Regex Rules -->
        <div v-show="activeTab === 'regex'" class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="font-medium">正则替换规则</h3>
            <button
              type="button"
              @click="addRegexRule"
              class="btn btn-secondary btn-sm"
            >
              <Plus class="w-4 h-4 mr-1" />
              添加规则
            </button>
          </div>

          <div
            v-for="(rule, index) in form.regex_rules"
            :key="index"
            class="card p-4"
          >
            <div class="flex items-start gap-4">
              <div class="flex-1 space-y-3">
                <div>
                  <label class="block text-xs text-dark-text-secondary mb-1"
                    >匹配模式</label
                  >
                  <input
                    v-model="rule.pattern"
                    type="text"
                    class="input font-mono text-sm"
                    placeholder="正则表达式"
                  />
                </div>
                <div>
                  <label class="block text-xs text-dark-text-secondary mb-1"
                    >替换为</label
                  >
                  <input
                    v-model="rule.replacement"
                    type="text"
                    class="input font-mono text-sm"
                    placeholder="替换内容"
                  />
                </div>
              </div>
              <button
                type="button"
                @click="removeRegexRule(index)"
                class="p-2 text-red-400 hover:bg-dark-hover rounded"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>

          <p
            v-if="form.regex_rules.length === 0"
            class="text-center text-dark-text-secondary py-8"
          >
            暂无正则替换规则
          </p>
        </div>

        <!-- Save Button -->
        <div class="mt-8 flex justify-end gap-3">
          <button
            type="button"
            @click="router.back()"
            class="btn btn-secondary"
          >
            取消
          </button>
          <button type="submit" class="btn btn-primary" :disabled="saving">
            <Loader2 v-if="saving" class="w-4 h-4 animate-spin mr-2" />
            保存
          </button>
        </div>
      </form>
    </template>
  </div>
</template>

<script setup>
import { useAgentsStore } from "@/stores/agents";
import api from "@/utils/api";
import {
  ArrowLeft,
  Bot,
  Camera,
  Loader2,
  MessageSquare,
  Plus,
  Trash2,
} from "lucide-vue-next";
import { onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const agentsStore = useAgentsStore();

const loading = ref(true);
const saving = ref(false);
const agent = ref(null);
const activeTab = ref("basic");

const tabs = [
  { id: "basic", label: "基本信息" },
  { id: "prompts", label: "提示词" },
  { id: "model", label: "模型设置" },
  { id: "regex", label: "正则规则" },
];

const form = reactive({
  name: "",
  description: "",
  avatar_url: "",
  is_public: false,
  system_prompt_main: "",
  system_prompt_jailbreak: "",
  system_prompt_assistant: "",
  model: "",
  temperature: 0.7,
  top_p: 0.9,
  top_k: 40,
  context_token_limit: 4000,
  max_output_tokens: 1000,
  stream_output: true,
  regex_rules: [],
});

async function loadAgent() {
  loading.value = true;
  const result = await agentsStore.fetchAgent(route.params.id);
  if (result) {
    agent.value = result;
    Object.assign(form, {
      name: result.name || "",
      description: result.description || "",
      avatar_url: result.avatar_url || "",
      is_public: result.is_public || false,
      system_prompt_main: result.system_prompt_main || "",
      system_prompt_jailbreak: result.system_prompt_jailbreak || "",
      system_prompt_assistant: result.system_prompt_assistant || "",
      model: result.model || "",
      temperature: result.temperature ?? 0.7,
      top_p: result.top_p ?? 0.9,
      top_k: result.top_k ?? 40,
      context_token_limit: result.context_token_limit ?? 4000,
      max_output_tokens: result.max_output_tokens ?? 1000,
      stream_output: result.stream_output ?? true,
      regex_rules: result.regex_rules || [],
    });
  }
  loading.value = false;
}

async function handleAvatarChange(e) {
  const file = e.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await api.post(
      `/agents/${agent.value.id}/avatar`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    form.avatar_url = response.data.avatar_url;
  } catch (error) {
    console.error("Avatar upload failed:", error);
  }
}

function addRegexRule() {
  form.regex_rules.push({ pattern: "", replacement: "", enabled: true });
}

function removeRegexRule(index) {
  form.regex_rules.splice(index, 1);
}

async function saveAgent() {
  saving.value = true;
  await agentsStore.updateAgent(agent.value.id, { ...form });
  saving.value = false;
}

onMounted(() => {
  loadAgent();
});
</script>
