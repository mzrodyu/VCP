<template>
  <div class="h-full">
    <router-view />

    <!-- Toast notifications -->
    <div class="fixed bottom-4 right-4 z-50 space-y-2">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="[
            'px-4 py-3 rounded-lg shadow-lg border max-w-sm',
            toast.type === 'success'
              ? 'bg-green-900/50 border-green-700 text-green-200'
              : '',
            toast.type === 'error'
              ? 'bg-red-900/50 border-red-700 text-red-200'
              : '',
            toast.type === 'warning'
              ? 'bg-yellow-900/50 border-yellow-700 text-yellow-200'
              : '',
            toast.type === 'info'
              ? 'bg-blue-900/50 border-blue-700 text-blue-200'
              : '',
          ]"
        >
          {{ toast.message }}
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from "@/stores/auth";
import { computed } from "vue";

const authStore = useAuthStore();
const toasts = computed(() => authStore.toasts);
</script>

<style>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
