import api from "@/utils/api";
import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useAuthStore = defineStore("auth", () => {
  const user = ref(null);
  const token = ref(localStorage.getItem("token") || null);
  const toasts = ref([]);

  const isAuthenticated = computed(() => !!user.value);
  const isAdmin = computed(() => user.value?.is_admin || false);

  async function login(username, password) {
    try {
      const response = await api.post("/auth/login", { username, password });
      token.value = response.data.access_token;
      user.value = response.data.user;
      localStorage.setItem("token", token.value);
      showToast("登录成功", "success");
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || "登录失败";
      showToast(message, "error");
      return { success: false, error: message };
    }
  }

  async function register(userData) {
    try {
      const response = await api.post("/auth/register", userData);
      token.value = response.data.access_token;
      user.value = response.data.user;
      localStorage.setItem("token", token.value);
      showToast("注册成功", "success");
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || "注册失败";
      showToast(message, "error");
      return { success: false, error: message };
    }
  }

  async function fetchCurrentUser() {
    if (!token.value) return;

    try {
      const response = await api.get("/auth/me");
      user.value = response.data.user;
    } catch (error) {
      logout();
    }
  }

  function logout() {
    user.value = null;
    token.value = null;
    localStorage.removeItem("token");
  }

  async function updateProfile(data) {
    try {
      const response = await api.put("/auth/me", data);
      user.value = response.data.user;
      showToast("个人信息更新成功", "success");
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || "更新失败";
      showToast(message, "error");
      return { success: false, error: message };
    }
  }

  async function changePassword(oldPassword, newPassword) {
    try {
      await api.post("/auth/change-password", {
        old_password: oldPassword,
        new_password: newPassword,
      });
      showToast("密码修改成功", "success");
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || "密码修改失败";
      showToast(message, "error");
      return { success: false, error: message };
    }
  }

  function showToast(message, type = "info") {
    const id = Date.now();
    toasts.value.push({ id, message, type });
    setTimeout(() => {
      toasts.value = toasts.value.filter((t) => t.id !== id);
    }, 3000);
  }

  return {
    user,
    token,
    toasts,
    isAuthenticated,
    isAdmin,
    login,
    register,
    fetchCurrentUser,
    logout,
    updateProfile,
    changePassword,
    showToast,
  };
});
