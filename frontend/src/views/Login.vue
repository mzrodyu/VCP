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
        <p class="text-dark-text-secondary mt-2">登录您的账户</p>
      </div>

      <!-- Login Form -->
      <div class="card p-6">
        <form @submit.prevent="handleLogin">
          <div class="mb-4">
            <label class="block text-sm font-medium mb-2">用户名或邮箱</label>
            <input
              v-model="form.username"
              type="text"
              class="input"
              :class="{ 'input-error': errors.username }"
              placeholder="请输入用户名或邮箱"
              required
            />
            <p v-if="errors.username" class="text-red-400 text-sm mt-1">
              {{ errors.username }}
            </p>
          </div>

          <div class="mb-6">
            <label class="block text-sm font-medium mb-2">密码</label>
            <div class="relative">
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                class="input pr-10"
                :class="{ 'input-error': errors.password }"
                placeholder="请输入密码"
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

          <button
            type="submit"
            class="btn btn-primary w-full"
            :disabled="loading"
          >
            <Loader2 v-if="loading" class="w-5 h-5 animate-spin mr-2" />
            {{ loading ? "登录中..." : "登录" }}
          </button>
        </form>

        <div class="mt-6 text-center">
          <p class="text-dark-text-secondary">
            还没有账户？
            <router-link
              to="/register"
              class="text-primary-400 hover:text-primary-300"
            >
              立即注册
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
import { useRoute, useRouter } from "vue-router";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const form = reactive({
  username: "",
  password: "",
});

const errors = reactive({
  username: "",
  password: "",
});

const loading = ref(false);
const showPassword = ref(false);

async function handleLogin() {
  errors.username = "";
  errors.password = "";

  if (!form.username.trim()) {
    errors.username = "请输入用户名或邮箱";
    return;
  }

  if (!form.password) {
    errors.password = "请输入密码";
    return;
  }

  loading.value = true;

  const result = await authStore.login(form.username, form.password);

  loading.value = false;

  if (result.success) {
    const redirect = route.query.redirect || "/";
    router.push(redirect);
  }
}
</script>
