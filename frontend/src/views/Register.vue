<template>
  <div class="min-h-screen bg-dark-bg flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-8">
        <div
          class="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4"
        >
          <MessageSquare class="w-10 h-10 text-white" />
        </div>
        <h1 class="text-2xl font-bold">VCPChat Web</h1>
        <p class="text-dark-text-secondary mt-2">创建新账户</p>
      </div>

      <!-- Register Form -->
      <div class="card p-6">
        <form @submit.prevent="handleRegister">
          <div class="mb-4">
            <label class="block text-sm font-medium mb-2">用户名</label>
            <input
              v-model="form.username"
              type="text"
              class="input"
              :class="{ 'input-error': errors.username }"
              placeholder="3-80个字符"
              required
            />
            <p v-if="errors.username" class="text-red-400 text-sm mt-1">
              {{ errors.username }}
            </p>
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium mb-2">邮箱</label>
            <input
              v-model="form.email"
              type="email"
              class="input"
              :class="{ 'input-error': errors.email }"
              placeholder="example@email.com"
              required
            />
            <p v-if="errors.email" class="text-red-400 text-sm mt-1">
              {{ errors.email }}
            </p>
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium mb-2"
              >显示名称 (可选)</label
            >
            <input
              v-model="form.display_name"
              type="text"
              class="input"
              placeholder="您希望显示的名称"
            />
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium mb-2">密码</label>
            <div class="relative">
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                class="input pr-10"
                :class="{ 'input-error': errors.password }"
                placeholder="至少6个字符"
                required
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-dark-text-secondary hover:text-dark-text"
              >
                <Eye v-if="!showPassword" class="w-5 h-5" />
                <EyeOff v-else class="w-5 h-5" />
              </button>
            </div>
            <p v-if="errors.password" class="text-red-400 text-sm mt-1">
              {{ errors.password }}
            </p>
          </div>

          <div class="mb-6">
            <label class="block text-sm font-medium mb-2">确认密码</label>
            <input
              v-model="form.confirmPassword"
              :type="showPassword ? 'text' : 'password'"
              class="input"
              :class="{ 'input-error': errors.confirmPassword }"
              placeholder="再次输入密码"
              required
            />
            <p v-if="errors.confirmPassword" class="text-red-400 text-sm mt-1">
              {{ errors.confirmPassword }}
            </p>
          </div>

          <button
            type="submit"
            class="btn btn-primary w-full"
            :disabled="loading"
          >
            <Loader2 v-if="loading" class="w-5 h-5 animate-spin mr-2" />
            {{ loading ? "注册中..." : "注册" }}
          </button>
        </form>

        <div class="mt-6 text-center">
          <p class="text-dark-text-secondary">
            已有账户？
            <router-link
              to="/login"
              class="text-primary-400 hover:text-primary-300"
            >
              立即登录
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from "@/stores/auth";
import { Eye, EyeOff, Loader2, MessageSquare } from "lucide-vue-next";
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const authStore = useAuthStore();

const form = reactive({
  username: "",
  email: "",
  display_name: "",
  password: "",
  confirmPassword: "",
});

const errors = reactive({
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
});

const loading = ref(false);
const showPassword = ref(false);

async function handleRegister() {
  // Clear errors
  Object.keys(errors).forEach((key) => (errors[key] = ""));

  // Validate
  let hasError = false;

  if (!form.username.trim() || form.username.length < 3) {
    errors.username = "用户名至少3个字符";
    hasError = true;
  }

  if (!form.email.trim() || !form.email.includes("@")) {
    errors.email = "请输入有效的邮箱地址";
    hasError = true;
  }

  if (!form.password || form.password.length < 6) {
    errors.password = "密码至少6个字符";
    hasError = true;
  }

  if (form.password !== form.confirmPassword) {
    errors.confirmPassword = "两次输入的密码不一致";
    hasError = true;
  }

  if (hasError) return;

  loading.value = true;

  const result = await authStore.register({
    username: form.username,
    email: form.email,
    display_name: form.display_name || form.username,
    password: form.password,
  });

  loading.value = false;

  if (result.success) {
    router.push("/");
  }
}
</script>
