<template>
  <div class="p-6 max-w-3xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">设置</h1>

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

    <!-- Profile Settings -->
    <div v-show="activeTab === 'profile'" class="space-y-6">
      <div class="card p-6">
        <h2 class="text-lg font-semibold mb-4">个人资料</h2>
        <div class="flex gap-6">
          <div class="flex-shrink-0">
            <div class="relative">
              <img
                v-if="profile.avatar_url"
                :src="profile.avatar_url"
                class="w-24 h-24 rounded-full object-cover"
              />
              <div
                v-else
                class="w-24 h-24 rounded-full bg-primary-600 flex items-center justify-center text-2xl font-bold text-white"
              >
                {{ profile.display_name?.[0] || "U" }}
              </div>
              <label
                class="absolute bottom-0 right-0 p-2 bg-dark-card border border-dark-border rounded-full cursor-pointer hover:bg-dark-hover"
              >
                <Camera class="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="uploadAvatar"
                />
              </label>
            </div>
          </div>
          <div class="flex-1 space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2">显示名称</label>
              <input v-model="profile.display_name" type="text" class="input" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">邮箱</label>
              <input v-model="profile.email" type="email" class="input" />
            </div>
          </div>
        </div>
        <div class="mt-4 flex justify-end">
          <button
            @click="saveProfile"
            class="btn btn-primary"
            :disabled="saving"
          >
            保存
          </button>
        </div>
      </div>

      <div class="card p-6">
        <h2 class="text-lg font-semibold mb-4">修改密码</h2>
        <div class="space-y-4 max-w-md">
          <div>
            <label class="block text-sm font-medium mb-2">当前密码</label>
            <input v-model="password.old" type="password" class="input" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">新密码</label>
            <input v-model="password.new" type="password" class="input" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">确认新密码</label>
            <input v-model="password.confirm" type="password" class="input" />
          </div>
        </div>
        <div class="mt-4 flex justify-end">
          <button
            @click="changePassword"
            class="btn btn-primary"
            :disabled="!canChangePassword"
          >
            修改密码
          </button>
        </div>
      </div>
    </div>

    <!-- API Settings -->
    <div v-show="activeTab === 'api'" class="space-y-6">
      <div class="card p-6">
        <h2 class="text-lg font-semibold mb-4">API 配置</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">API 地址</label>
            <input
              v-model="settings.vcp_api_url"
              type="text"
              class="input"
              placeholder="http://localhost:5000"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">API 密钥</label>
            <input
              v-model="settings.vcp_api_key"
              type="password"
              class="input"
              placeholder="留空则不使用密钥"
            />
          </div>
          <div class="flex gap-3">
            <button
              @click="testApi"
              class="btn btn-secondary"
              :disabled="testing"
            >
              <Loader2 v-if="testing" class="w-4 h-4 animate-spin mr-2" />
              测试连接
            </button>
            <button @click="saveApiSettings" class="btn btn-primary">
              保存
            </button>
          </div>
          <div
            v-if="apiTestResult"
            :class="[
              'p-3 rounded-lg',
              apiTestResult.success
                ? 'bg-green-900/20 text-green-400'
                : 'bg-red-900/20 text-red-400',
            ]"
          >
            {{ apiTestResult.message }}
          </div>
        </div>
      </div>

      <div class="card p-6">
        <h2 class="text-lg font-semibold mb-4">默认模型设置</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">默认模型</label>
            <select v-model="settings.default_model" class="input">
              <option value="">选择模型</option>
              <option
                v-for="model in availableModels"
                :key="model"
                :value="model"
              >
                {{ model }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium mb-2"
              >默认 Temperature ({{ settings.default_temperature }})</label
            >
            <input
              v-model.number="settings.default_temperature"
              type="range"
              min="0"
              max="2"
              step="0.1"
              class="w-full"
            />
          </div>
          <div>
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                v-model="settings.stream_output"
                class="w-4 h-4"
              />
              <span>默认使用流式输出</span>
            </label>
          </div>
        </div>
        <div class="mt-4 flex justify-end">
          <button @click="saveSettings" class="btn btn-primary">保存</button>
        </div>
      </div>
    </div>

    <!-- UI Settings -->
    <div v-show="activeTab === 'ui'" class="space-y-6">
      <div class="card p-6">
        <h2 class="text-lg font-semibold mb-4">界面设置</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">主题</label>
            <select v-model="settings.theme" class="input">
              <option value="dark">深色</option>
              <option value="light">浅色</option>
              <option value="system">跟随系统</option>
            </select>
          </div>
          <div>
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                v-model="settings.enable_notifications"
                class="w-4 h-4"
              />
              <span>启用通知</span>
            </label>
          </div>
          <div>
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                v-model="settings.notification_sound"
                class="w-4 h-4"
              />
              <span>通知声音</span>
            </label>
          </div>
        </div>
        <div class="mt-4 flex justify-end">
          <button @click="saveSettings" class="btn btn-primary">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from "@/stores/auth";
import api from "@/utils/api";
import { Camera, Loader2 } from "lucide-vue-next";
import { computed, onMounted, reactive, ref } from "vue";

const authStore = useAuthStore();

const activeTab = ref("profile");
const saving = ref(false);
const testing = ref(false);
const apiTestResult = ref(null);
const availableModels = ref([]);

const tabs = [
  { id: "profile", label: "个人资料" },
  { id: "api", label: "API 设置" },
  { id: "ui", label: "界面设置" },
];

const profile = reactive({
  display_name: "",
  email: "",
  avatar_url: "",
});

const password = reactive({
  old: "",
  new: "",
  confirm: "",
});

const settings = reactive({
  theme: "dark",
  vcp_api_url: "",
  vcp_api_key: "",
  default_model: "",
  default_temperature: 0.7,
  stream_output: true,
  enable_notifications: true,
  notification_sound: true,
});

const canChangePassword = computed(() => {
  return (
    password.old &&
    password.new &&
    password.new === password.confirm &&
    password.new.length >= 6
  );
});

async function loadProfile() {
  if (authStore.user) {
    profile.display_name = authStore.user.display_name || "";
    profile.email = authStore.user.email || "";
    profile.avatar_url = authStore.user.avatar_url || "";
  }
}

async function loadSettings() {
  try {
    const response = await api.get("/settings");
    Object.assign(settings, response.data.settings);
  } catch (error) {
    console.error("Failed to load settings:", error);
  }
}

async function saveProfile() {
  saving.value = true;
  await authStore.updateProfile({
    display_name: profile.display_name,
    email: profile.email,
  });
  saving.value = false;
}

async function uploadAvatar(e) {
  const file = e.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await api.post("/users/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    profile.avatar_url = response.data.avatar_url;
    authStore.showToast("头像上传成功", "success");
  } catch (error) {
    authStore.showToast("头像上传失败", "error");
  }
}

async function changePassword() {
  const result = await authStore.changePassword(password.old, password.new);
  if (result.success) {
    password.old = "";
    password.new = "";
    password.confirm = "";
  }
}

async function saveApiSettings() {
  try {
    await api.put("/settings/api", {
      vcp_api_url: settings.vcp_api_url,
      vcp_api_key: settings.vcp_api_key,
    });
    authStore.showToast("API设置已保存", "success");
  } catch (error) {
    authStore.showToast("保存失败", "error");
  }
}

async function testApi() {
  testing.value = true;
  apiTestResult.value = null;

  try {
    const response = await api.post("/settings/test-api");
    apiTestResult.value = { success: true, message: response.data.message };
    if (response.data.models) {
      availableModels.value = response.data.models;
    }
  } catch (error) {
    apiTestResult.value = {
      success: false,
      message: error.response?.data?.error || "连接失败",
    };
  } finally {
    testing.value = false;
  }
}

async function saveSettings() {
  try {
    await api.put("/settings", settings);
    authStore.showToast("设置已保存", "success");
  } catch (error) {
    authStore.showToast("保存失败", "error");
  }
}

onMounted(() => {
  loadProfile();
  loadSettings();
});
</script>
