<template>
  <div
    :class="['flex gap-3', message.role === 'user' ? 'flex-row-reverse' : '']"
  >
    <!-- Avatar -->
    <div class="flex-shrink-0">
      <template v-if="message.role === 'assistant'">
        <img
          v-if="agent?.avatar_url"
          :src="agent.avatar_url"
          class="w-8 h-8 rounded-full"
        />
        <div
          v-else
          class="w-8 h-8 rounded-full bg-primary-600/20 flex items-center justify-center"
        >
          <Bot class="w-4 h-4 text-primary-400" />
        </div>
      </template>
      <div
        v-else
        class="w-8 h-8 rounded-full bg-green-600/20 flex items-center justify-center"
      >
        <User class="w-4 h-4 text-green-400" />
      </div>
    </div>

    <!-- Message Content -->
    <div
      :class="[
        'max-w-[70%] group',
        message.role === 'user' ? 'text-right' : '',
      ]"
    >
      <div class="text-xs text-dark-text-secondary mb-1">
        {{ message.role === "user" ? "你" : agent?.name || "AI" }}
        <span v-if="message.is_edited" class="ml-1">(已编辑)</span>
      </div>

      <div
        :class="[
          'rounded-lg p-3 inline-block text-left',
          message.role === 'user'
            ? 'bg-primary-600 text-white'
            : 'bg-dark-card border border-dark-border',
        ]"
      >
        <div
          class="message-content markdown-body"
          v-html="renderedContent"
        ></div>

        <!-- Typing indicator for streaming -->
        <div v-if="streaming && !message.content" class="typing-indicator">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      <!-- Actions -->
      <div
        v-if="!streaming && message.id !== 'streaming'"
        class="mt-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2"
        :class="message.role === 'user' ? 'justify-end' : 'justify-start'"
      >
        <button
          @click="$emit('edit', message)"
          class="p-1 hover:bg-dark-hover rounded text-dark-text-secondary hover:text-dark-text"
          title="编辑"
        >
          <Pencil class="w-3 h-3" />
        </button>
        <button
          v-if="message.role === 'assistant'"
          @click="$emit('regenerate', message)"
          class="p-1 hover:bg-dark-hover rounded text-dark-text-secondary hover:text-dark-text"
          title="重新生成"
        >
          <RefreshCw class="w-3 h-3" />
        </button>
        <button
          @click="copyContent"
          class="p-1 hover:bg-dark-hover rounded text-dark-text-secondary hover:text-dark-text"
          title="复制"
        >
          <Copy class="w-3 h-3" />
        </button>
        <button
          @click="$emit('delete', message)"
          class="p-1 hover:bg-dark-hover rounded text-red-400"
          title="删除"
        >
          <Trash2 class="w-3 h-3" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from "@/stores/auth";
import { Bot, Copy, Pencil, RefreshCw, Trash2, User } from "lucide-vue-next";
import { marked } from "marked";
import { computed } from "vue";

const props = defineProps({
  message: {
    type: Object,
    required: true,
  },
  agent: {
    type: Object,
    default: null,
  },
  streaming: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["edit", "delete", "regenerate"]);
const authStore = useAuthStore();

const renderedContent = computed(() => {
  if (!props.message.content) return "";

  try {
    return marked(props.message.content, {
      breaks: true,
      gfm: true,
    });
  } catch (e) {
    return props.message.content;
  }
});

function copyContent() {
  navigator.clipboard.writeText(props.message.content);
  authStore.showToast("已复制到剪贴板", "success");
}
</script>
