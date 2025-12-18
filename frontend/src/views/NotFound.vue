<template>
  <div class="min-h-screen bg-dark-bg flex items-center justify-center p-4">
    <div class="text-center">
      <div class="text-8xl font-bold text-primary-600 mb-4">404</div>
      <h1 class="text-2xl font-semibold mb-2">页面未找到</h1>
      <p class="text-dark-text-secondary mb-6">您访问的页面不存在或已被移除</p>
      <router-link to="/" class="btn btn-primary">
        <Home class="w-4 h-4 mr-2" />
        返回首页
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { Home } from "lucide-vue-next";
</script>
