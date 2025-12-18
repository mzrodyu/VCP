<template>
  <div class="flex h-full">
    <!-- Notes Tree Sidebar -->
    <div class="w-64 bg-dark-sidebar border-r border-dark-border flex flex-col">
      <div class="p-4 border-b border-dark-border">
        <div class="flex items-center justify-between mb-2">
          <h2 class="font-semibold">笔记</h2>
          <div class="flex gap-1">
            <button
              @click="createNote(false)"
              class="p-1 hover:bg-dark-hover rounded"
              title="新建笔记"
            >
              <FileText class="w-4 h-4" />
            </button>
            <button
              @click="createNote(true)"
              class="p-1 hover:bg-dark-hover rounded"
              title="新建文件夹"
            >
              <FolderPlus class="w-4 h-4" />
            </button>
          </div>
        </div>
        <input
          v-model="searchTerm"
          type="text"
          class="input text-sm"
          placeholder="搜索笔记..."
        />
      </div>

      <div class="flex-1 overflow-y-auto p-2">
        <NoteTreeItem
          v-for="note in rootNotes"
          :key="note.id"
          :note="note"
          :selected-id="selectedNote?.id"
          @select="selectNote"
          @delete="deleteNote"
        />
        <p
          v-if="rootNotes.length === 0"
          class="text-center text-dark-text-secondary py-4 text-sm"
        >
          暂无笔记
        </p>
      </div>
    </div>

    <!-- Note Editor -->
    <div class="flex-1 flex flex-col">
      <template v-if="selectedNote && !selectedNote.is_folder">
        <!-- Note Header -->
        <div
          class="h-14 bg-dark-sidebar border-b border-dark-border flex items-center justify-between px-4"
        >
          <input
            v-model="editingTitle"
            type="text"
            class="bg-transparent text-lg font-semibold focus:outline-none flex-1"
            @blur="updateNoteTitle"
            @keydown.enter="updateNoteTitle"
          />
          <div class="flex items-center gap-2">
            <button
              @click="togglePin"
              :class="[
                'p-2 rounded',
                selectedNote.is_pinned
                  ? 'text-yellow-400'
                  : 'text-dark-text-secondary hover:text-dark-text',
              ]"
            >
              <Pin class="w-4 h-4" />
            </button>
            <button
              @click="deleteNote(selectedNote)"
              class="p-2 text-red-400 hover:bg-dark-hover rounded"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Note Content -->
        <div class="flex-1 p-4 overflow-auto">
          <textarea
            v-model="editingContent"
            class="w-full h-full bg-transparent resize-none focus:outline-none text-dark-text"
            placeholder="开始写笔记..."
            @blur="updateNoteContent"
          />
        </div>

        <!-- Note Footer -->
        <div
          class="h-10 border-t border-dark-border flex items-center justify-between px-4 text-xs text-dark-text-secondary"
        >
          <span>创建于 {{ formatDate(selectedNote.created_at) }}</span>
          <span>最后编辑 {{ formatDate(selectedNote.updated_at) }}</span>
        </div>
      </template>

      <template v-else-if="selectedNote && selectedNote.is_folder">
        <div class="flex-1 flex items-center justify-center text-center">
          <div>
            <Folder class="w-16 h-16 text-dark-text-secondary mx-auto mb-4" />
            <h3 class="text-lg font-semibold mb-2">{{ selectedNote.title }}</h3>
            <p class="text-dark-text-secondary">
              {{ selectedNote.children_count }} 个项目
            </p>
          </div>
        </div>
      </template>

      <template v-else>
        <div class="flex-1 flex items-center justify-center text-center">
          <div>
            <FileText class="w-16 h-16 text-dark-text-secondary mx-auto mb-4" />
            <h3 class="text-lg font-semibold mb-2">选择或创建笔记</h3>
            <p class="text-dark-text-secondary mb-4">
              从左侧选择一个笔记，或创建新笔记
            </p>
            <button @click="createNote(false)" class="btn btn-primary">
              <Plus class="w-4 h-4 mr-2" />
              新建笔记
            </button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import NoteTreeItem from "@/components/NoteTreeItem.vue";
import { useAuthStore } from "@/stores/auth";
import api from "@/utils/api";
import {
  FileText,
  Folder,
  FolderPlus,
  Pin,
  Plus,
  Trash2,
} from "lucide-vue-next";
import { computed, onMounted, ref, watch } from "vue";

const authStore = useAuthStore();

const notes = ref([]);
const selectedNote = ref(null);
const searchTerm = ref("");
const editingTitle = ref("");
const editingContent = ref("");

const rootNotes = computed(() => {
  if (searchTerm.value) {
    return notes.value.filter((n) =>
      n.title.toLowerCase().includes(searchTerm.value.toLowerCase())
    );
  }
  return notes.value.filter((n) => !n.parent_id);
});

watch(selectedNote, (note) => {
  if (note) {
    editingTitle.value = note.title;
    editingContent.value = note.content || "";
  }
});

async function fetchNotes() {
  try {
    const response = await api.get("/notes");
    notes.value = response.data.notes;
  } catch (error) {
    authStore.showToast("获取笔记失败", "error");
  }
}

async function selectNote(note) {
  if (note.is_folder) {
    selectedNote.value = note;
  } else {
    try {
      const response = await api.get(`/notes/${note.id}`);
      selectedNote.value = response.data.note;
    } catch (error) {
      authStore.showToast("获取笔记失败", "error");
    }
  }
}

async function createNote(isFolder) {
  try {
    const response = await api.post("/notes", {
      title: isFolder ? "新文件夹" : "新笔记",
      is_folder: isFolder,
      parent_id: selectedNote.value?.is_folder ? selectedNote.value.id : null,
    });
    notes.value.unshift(response.data.note);
    if (!isFolder) {
      selectNote(response.data.note);
    }
    authStore.showToast("创建成功", "success");
  } catch (error) {
    authStore.showToast("创建失败", "error");
  }
}

async function updateNoteTitle() {
  if (!selectedNote.value || editingTitle.value === selectedNote.value.title)
    return;
  try {
    await api.put(`/notes/${selectedNote.value.id}`, {
      title: editingTitle.value,
    });
    selectedNote.value.title = editingTitle.value;
    const idx = notes.value.findIndex((n) => n.id === selectedNote.value.id);
    if (idx !== -1) notes.value[idx].title = editingTitle.value;
  } catch (error) {
    authStore.showToast("更新失败", "error");
  }
}

async function updateNoteContent() {
  if (
    !selectedNote.value ||
    editingContent.value === selectedNote.value.content
  )
    return;
  try {
    await api.put(`/notes/${selectedNote.value.id}`, {
      content: editingContent.value,
    });
    selectedNote.value.content = editingContent.value;
  } catch (error) {
    authStore.showToast("保存失败", "error");
  }
}

async function togglePin() {
  try {
    await api.put(`/notes/${selectedNote.value.id}`, {
      is_pinned: !selectedNote.value.is_pinned,
    });
    selectedNote.value.is_pinned = !selectedNote.value.is_pinned;
    authStore.showToast(
      selectedNote.value.is_pinned ? "已置顶" : "已取消置顶",
      "success"
    );
  } catch (error) {
    authStore.showToast("操作失败", "error");
  }
}

async function deleteNote(note) {
  if (!confirm(`确定删除 "${note.title}" 吗？`)) return;
  try {
    await api.delete(`/notes/${note.id}`);
    notes.value = notes.value.filter((n) => n.id !== note.id);
    if (selectedNote.value?.id === note.id) {
      selectedNote.value = null;
    }
    authStore.showToast("删除成功", "success");
  } catch (error) {
    authStore.showToast("删除失败", "error");
  }
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleString("zh-CN");
}

onMounted(() => {
  fetchNotes();
});
</script>
