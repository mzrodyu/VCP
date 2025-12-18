import api from "@/utils/api";
import { defineStore } from "pinia";
import { ref } from "vue";
import { useAuthStore } from "./auth";

export const useChatStore = defineStore("chat", () => {
  const messages = ref([]);
  const loading = ref(false);
  const generating = ref(false);
  const streamingMessage = ref(null);

  const authStore = useAuthStore();

  async function fetchMessages(topicId) {
    loading.value = true;
    try {
      const response = await api.get(`/chat/history/${topicId}`);
      messages.value = response.data.messages;
      return response.data.messages;
    } catch (error) {
      authStore.showToast("获取聊天记录失败", "error");
      return [];
    } finally {
      loading.value = false;
    }
  }

  async function sendMessage(topicId, content, attachments = []) {
    try {
      const response = await api.post("/chat/send", {
        topic_id: topicId,
        content,
        attachments,
      });
      messages.value.push(response.data.message);
      return { success: true, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.error || "发送失败";
      authStore.showToast(message, "error");
      return { success: false, error: message };
    }
  }

  async function generateResponse(topicId) {
    generating.value = true;
    streamingMessage.value = {
      role: "assistant",
      content: "",
      id: "streaming",
    };

    try {
      const response = await fetch("/api/chat/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authStore.token}`,
        },
        body: JSON.stringify({ topic_id: topicId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "生成失败");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.content) {
                streamingMessage.value.content += data.content;
              }

              if (data.done) {
                const finalMessage = {
                  ...streamingMessage.value,
                  id: data.message_id,
                };
                messages.value.push(finalMessage);
                streamingMessage.value = null;
              }

              if (data.error) {
                throw new Error(data.error);
              }
            } catch (e) {
              if (e.message !== "Unexpected end of JSON input") {
                console.error("Parse error:", e);
              }
            }
          }
        }
      }

      return { success: true };
    } catch (error) {
      authStore.showToast(error.message || "生成失败", "error");
      streamingMessage.value = null;
      return { success: false, error: error.message };
    } finally {
      generating.value = false;
    }
  }

  async function updateMessage(messageId, content) {
    try {
      const response = await api.put(`/chat/message/${messageId}`, { content });
      const index = messages.value.findIndex((m) => m.id === messageId);
      if (index !== -1) {
        messages.value[index] = response.data.message;
      }
      authStore.showToast("消息更新成功", "success");
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || "更新失败";
      authStore.showToast(message, "error");
      return { success: false, error: message };
    }
  }

  async function deleteMessage(messageId) {
    try {
      await api.delete(`/chat/message/${messageId}`);
      messages.value = messages.value.filter((m) => m.id !== messageId);
      authStore.showToast("消息删除成功", "success");
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || "删除失败";
      authStore.showToast(message, "error");
      return { success: false, error: message };
    }
  }

  async function regenerateResponse(messageId) {
    try {
      const response = await api.post("/chat/regenerate", {
        message_id: messageId,
      });
      messages.value = messages.value.filter((m) => m.id !== messageId);
      return await generateResponse(response.data.topic_id);
    } catch (error) {
      const message = error.response?.data?.error || "重新生成失败";
      authStore.showToast(message, "error");
      return { success: false, error: message };
    }
  }

  async function clearHistory(topicId) {
    try {
      await api.delete(`/chat/topic/${topicId}/clear`);
      messages.value = [];
      authStore.showToast("聊天记录已清空", "success");
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || "清空失败";
      authStore.showToast(message, "error");
      return { success: false, error: message };
    }
  }

  function clearMessages() {
    messages.value = [];
    streamingMessage.value = null;
  }

  return {
    messages,
    loading,
    generating,
    streamingMessage,
    fetchMessages,
    sendMessage,
    generateResponse,
    updateMessage,
    deleteMessage,
    regenerateResponse,
    clearHistory,
    clearMessages,
  };
});
