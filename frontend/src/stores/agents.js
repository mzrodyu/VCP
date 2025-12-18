import api from "@/utils/api";
import { defineStore } from "pinia";
import { ref } from "vue";
import { useAuthStore } from "./auth";

export const useAgentsStore = defineStore("agents", () => {
  const agents = ref([]);
  const currentAgent = ref(null);
  const topics = ref([]);
  const currentTopic = ref(null);
  const loading = ref(false);

  const authStore = useAuthStore();

  async function fetchAgents() {
    loading.value = true;
    try {
      const response = await api.get("/agents");
      agents.value = response.data.agents;
    } catch (error) {
      authStore.showToast("获取Agent列表失败", "error");
    } finally {
      loading.value = false;
    }
  }

  async function fetchAgent(id) {
    loading.value = true;
    try {
      const response = await api.get(`/agents/${id}`);
      currentAgent.value = response.data.agent;
      return response.data.agent;
    } catch (error) {
      authStore.showToast("获取Agent详情失败", "error");
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function createAgent(data) {
    try {
      const response = await api.post("/agents", data);
      agents.value.unshift(response.data.agent);
      authStore.showToast("Agent创建成功", "success");
      return { success: true, agent: response.data.agent };
    } catch (error) {
      const message = error.response?.data?.error || "创建失败";
      authStore.showToast(message, "error");
      return { success: false, error: message };
    }
  }

  async function updateAgent(id, data) {
    try {
      const response = await api.put(`/agents/${id}`, data);
      const index = agents.value.findIndex((a) => a.id === id);
      if (index !== -1) {
        agents.value[index] = response.data.agent;
      }
      if (currentAgent.value?.id === id) {
        currentAgent.value = response.data.agent;
      }
      authStore.showToast("Agent更新成功", "success");
      return { success: true, agent: response.data.agent };
    } catch (error) {
      const message = error.response?.data?.error || "更新失败";
      authStore.showToast(message, "error");
      return { success: false, error: message };
    }
  }

  async function deleteAgent(id) {
    try {
      await api.delete(`/agents/${id}`);
      agents.value = agents.value.filter((a) => a.id !== id);
      if (currentAgent.value?.id === id) {
        currentAgent.value = null;
      }
      authStore.showToast("Agent删除成功", "success");
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || "删除失败";
      authStore.showToast(message, "error");
      return { success: false, error: message };
    }
  }

  async function duplicateAgent(id) {
    try {
      const response = await api.post(`/agents/${id}/duplicate`);
      agents.value.unshift(response.data.agent);
      authStore.showToast("Agent复制成功", "success");
      return { success: true, agent: response.data.agent };
    } catch (error) {
      const message = error.response?.data?.error || "复制失败";
      authStore.showToast(message, "error");
      return { success: false, error: message };
    }
  }

  async function fetchTopics(agentId) {
    try {
      const response = await api.get(`/topics/agent/${agentId}`);
      topics.value = response.data.topics;
      return response.data.topics;
    } catch (error) {
      authStore.showToast("获取话题列表失败", "error");
      return [];
    }
  }

  async function createTopic(agentId, name) {
    try {
      const response = await api.post(`/topics/agent/${agentId}`, { name });
      topics.value.unshift(response.data.topic);
      authStore.showToast("话题创建成功", "success");
      return { success: true, topic: response.data.topic };
    } catch (error) {
      const message = error.response?.data?.error || "创建失败";
      authStore.showToast(message, "error");
      return { success: false, error: message };
    }
  }

  async function updateTopic(topicId, name) {
    try {
      const response = await api.put(`/topics/${topicId}`, { name });
      const index = topics.value.findIndex((t) => t.id === topicId);
      if (index !== -1) {
        topics.value[index] = response.data.topic;
      }
      authStore.showToast("话题更新成功", "success");
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || "更新失败";
      authStore.showToast(message, "error");
      return { success: false, error: message };
    }
  }

  async function deleteTopic(topicId) {
    try {
      await api.delete(`/topics/${topicId}`);
      topics.value = topics.value.filter((t) => t.id !== topicId);
      if (currentTopic.value?.id === topicId) {
        currentTopic.value = null;
      }
      authStore.showToast("话题删除成功", "success");
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || "删除失败";
      authStore.showToast(message, "error");
      return { success: false, error: message };
    }
  }

  function setCurrentAgent(agent) {
    currentAgent.value = agent;
  }

  function setCurrentTopic(topic) {
    currentTopic.value = topic;
  }

  return {
    agents,
    currentAgent,
    topics,
    currentTopic,
    loading,
    fetchAgents,
    fetchAgent,
    createAgent,
    updateAgent,
    deleteAgent,
    duplicateAgent,
    fetchTopics,
    createTopic,
    updateTopic,
    deleteTopic,
    setCurrentAgent,
    setCurrentTopic,
  };
});
