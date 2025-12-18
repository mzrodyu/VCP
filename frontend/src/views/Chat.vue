<template>
  <div class="flex h-full">
    <!-- Topics Sidebar -->
    <div class="w-64 bg-dark-sidebar border-r border-dark-border flex flex-col">
      <div class="p-4 border-b border-dark-border">
        <div class="flex items-center justify-between mb-2">
          <h2 class="font-semibold">话题</h2>
          <button
            @click="createTopic"
            class="p-1 hover:bg-dark-hover rounded"
            title="新建话题"
          >
            <Plus class="w-4 h-4" />
          </button>
        </div>
        <input
          v-model="searchTerm"
          type="text"
          class="input text-sm"
          placeholder="搜索话题..."
        />
      </div>

      <div class="flex-1 overflow-y-auto p-2">
        <div
          v-for="topic in filteredTopics"
          :key="topic.id"
          :class="[
            'p-3 rounded-lg cursor-pointer mb-1 group',
            currentTopicId === topic.id
              ? 'bg-primary-600/20 border border-primary-500/50'
              : 'hover:bg-dark-hover',
          ]"
          @click="selectTopic(topic)"
        >
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium truncate">{{ topic.name }}</span>
            <div class="opacity-0 group-hover:opacity-100 flex gap-1">
              <button
                @click.stop="editTopic(topic)"
                class="p-1 hover:bg-dark-bg rounded"
              >
                <Pencil class="w-3 h-3" />
              </button>
              <button
                @click.stop="deleteTopic(topic)"
                class="p-1 hover:bg-dark-bg rounded text-red-400"
              >
                <Trash2 class="w-3 h-3" />
              </button>
            </div>
          </div>
          <div class="text-xs text-dark-text-secondary mt-1">
            {{ topic.message_count || 0 }} 条消息
          </div>
        </div>
      </div>
    </div>

    <!-- Chat Area -->
    <div class="flex-1 flex flex-col">
      <!-- Agent Header -->
      <div
        v-if="currentAgent"
        class="h-14 bg-dark-sidebar border-b border-dark-border flex items-center justify-between px-4"
      >
        <div class="flex items-center gap-3">
          <img
            v-if="currentAgent.avatar_url"
            :src="currentAgent.avatar_url"
            class="w-10 h-10 rounded-full"
          />
          <div
            v-else
            class="w-10 h-10 rounded-full bg-primary-600/20 flex items-center justify-center"
          >
            <span class="font-semibold text-primary-400">{{
              currentAgent.name[0]
            }}</span>
          </div>
          <div>
            <h3 class="font-semibold">{{ currentAgent.name }}</h3>
            <p class="text-xs text-dark-text-secondary">
              {{ currentAgent.model || "未设置模型" }}
            </p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <router-link
            :to="`/agents/${currentAgent.id}/edit`"
            class="btn btn-ghost btn-sm"
          >
            <Settings class="w-4 h-4" />
          </router-link>
          <button @click="clearChat" class="btn btn-ghost btn-sm text-red-400">
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Messages -->
      <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-4">
        <div v-if="chatStore.loading" class="flex justify-center py-8">
          <Loader2 class="w-8 h-8 animate-spin text-primary-400" />
        </div>

        <div
          v-else-if="
            chatStore.messages.length === 0 && !chatStore.streamingMessage
          "
          class="flex flex-col items-center justify-center h-full text-center"
        >
          <MessageSquare class="w-16 h-16 text-dark-text-secondary mb-4" />
          <h3 class="text-lg font-semibold mb-2">开始对话</h3>
          <p class="text-dark-text-secondary">
            发送一条消息开始与 {{ currentAgent?.name }} 聊天
          </p>
        </div>

        <template v-else>
          <ChatMessage
            v-for="message in chatStore.messages"
            :key="message.id"
            :message="message"
            :agent="currentAgent"
            @edit="editMessage"
            @delete="deleteMessage"
            @regenerate="regenerateMessage"
          />

          <!-- Streaming Message -->
          <ChatMessage
            v-if="chatStore.streamingMessage"
            :message="chatStore.streamingMessage"
            :agent="currentAgent"
            :streaming="true"
          />
        </template>
      </div>

      <!-- Input Area -->
      <div class="border-t border-dark-border p-4">
        <form @submit.prevent="sendMessage" class="flex gap-3">
          <div class="flex-1 relative">
            <textarea
              ref="inputRef"
              v-model="inputMessage"
              class="input resize-none pr-12"
              :rows="inputRows"
              placeholder="输入消息... (Shift+Enter换行)"
              @keydown="handleKeydown"
              :disabled="chatStore.generating || !currentTopicId"
            />
            <button
              type="submit"
              :disabled="
                !inputMessage.trim() || chatStore.generating || !currentTopicId
              "
              class="absolute right-2 bottom-2 p-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              <Send class="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- Edit Topic Modal -->
  <Teleport to="body">
    <div
      v-if="showEditTopicModal"
      class="modal-overlay"
      @click.self="showEditTopicModal = false"
    >
      <div class="modal-content p-6">
        <h2 class="text-xl font-semibold mb-4">编辑话题</h2>
        <input
          v-model="editingTopicName"
          type="text"
          class="input mb-4"
          placeholder="话题名称"
        />
        <div class="flex justify-end gap-3">
          <button @click="showEditTopicModal = false" class="btn btn-secondary">
            取消
          </button>
          <button @click="saveTopicName" class="btn btn-primary">保存</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import ChatMessage from "@/components/ChatMessage.vue";
import { useAgentsStore } from "@/stores/agents";
import { useAuthStore } from "@/stores/auth";
import { useChatStore } from "@/stores/chat";
import {
  Loader2,
  MessageSquare,
  Pencil,
  Plus,
  Send,
  Settings,
  Trash2,
} from "lucide-vue-next";
import { computed, nextTick, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const agentsStore = useAgentsStore();
const chatStore = useChatStore();
const authStore = useAuthStore();

const inputMessage = ref("");
const inputRef = ref(null);
const messagesContainer = ref(null);
const searchTerm = ref("");
const showEditTopicModal = ref(false);
const editingTopic = ref(null);
const editingTopicName = ref("");

const currentAgent = computed(() => agentsStore.currentAgent);
const currentTopicId = computed(() => agentsStore.currentTopic?.id);

const filteredTopics = computed(() => {
  if (!searchTerm.value) return agentsStore.topics;
  const term = searchTerm.value.toLowerCase();
  return agentsStore.topics.filter((t) => t.name.toLowerCase().includes(term));
});

const inputRows = computed(() => {
  const lines = inputMessage.value.split("\n").length;
  return Math.min(Math.max(lines, 1), 5);
});

watch(
  () => route.params.agentId,
  async (newId) => {
    if (newId) {
      await agentsStore.fetchAgent(newId);
      await agentsStore.fetchTopics(newId);

      // Select first topic or from route
      if (route.params.topicId) {
        const topic = agentsStore.topics.find(
          (t) => t.id == route.params.topicId
        );
        if (topic) selectTopic(topic);
      } else if (agentsStore.topics.length > 0) {
        selectTopic(agentsStore.topics[0]);
      }
    }
  },
  { immediate: true }
);

watch(
  () => chatStore.messages,
  () => {
    nextTick(() => scrollToBottom());
  },
  { deep: true }
);

watch(
  () => chatStore.streamingMessage?.content,
  () => {
    nextTick(() => scrollToBottom());
  }
);

function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
}

async function selectTopic(topic) {
  agentsStore.setCurrentTopic(topic);
  chatStore.clearMessages();
  await chatStore.fetchMessages(topic.id);
  router.replace(`/chat/${currentAgent.value.id}/${topic.id}`);
}

async function createTopic() {
  const result = await agentsStore.createTopic(currentAgent.value.id, "新话题");
  if (result.success) {
    selectTopic(result.topic);
  }
}

function editTopic(topic) {
  editingTopic.value = topic;
  editingTopicName.value = topic.name;
  showEditTopicModal.value = true;
}

async function saveTopicName() {
  if (!editingTopicName.value.trim()) return;
  await agentsStore.updateTopic(
    editingTopic.value.id,
    editingTopicName.value.trim()
  );
  showEditTopicModal.value = false;
}

async function deleteTopic(topic) {
  if (!confirm("确定删除这个话题吗？")) return;
  await agentsStore.deleteTopic(topic.id);
  if (currentTopicId.value === topic.id && agentsStore.topics.length > 0) {
    selectTopic(agentsStore.topics[0]);
  }
}

async function sendMessage() {
  if (!inputMessage.value.trim() || chatStore.generating) return;

  const content = inputMessage.value.trim();
  inputMessage.value = "";

  const result = await chatStore.sendMessage(currentTopicId.value, content);
  if (result.success) {
    await chatStore.generateResponse(currentTopicId.value);
  }
}

function handleKeydown(e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
}

async function editMessage(message) {
  const newContent = prompt("编辑消息:", message.content);
  if (newContent !== null && newContent !== message.content) {
    await chatStore.updateMessage(message.id, newContent);
  }
}

async function deleteMessage(message) {
  if (confirm("确定删除这条消息吗？")) {
    await chatStore.deleteMessage(message.id);
  }
}

async function regenerateMessage(message) {
  await chatStore.regenerateResponse(message.id);
}

async function clearChat() {
  if (!confirm("确定清空所有聊天记录吗？")) return;
  await chatStore.clearHistory(currentTopicId.value);
}

onMounted(() => {
  if (route.params.agentId) {
    agentsStore.fetchAgent(route.params.agentId);
  }
});
</script>
