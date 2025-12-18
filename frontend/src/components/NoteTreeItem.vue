<template>
  <div>
    <div
      :class="[
        'flex items-center gap-2 p-2 rounded-lg cursor-pointer group',
        selectedId === note.id ? 'bg-primary-600/20' : 'hover:bg-dark-hover',
      ]"
      :style="{ paddingLeft: `${depth * 12 + 8}px` }"
      @click="$emit('select', note)"
    >
      <button
        v-if="note.is_folder"
        @click.stop="expanded = !expanded"
        class="p-0.5"
      >
        <ChevronRight
          :class="['w-4 h-4 transition-transform', expanded ? 'rotate-90' : '']"
        />
      </button>
      <component
        :is="note.is_folder ? (expanded ? FolderOpen : Folder) : FileText"
        class="w-4 h-4 text-dark-text-secondary"
      />
      <span class="flex-1 truncate text-sm">{{ note.title }}</span>
      <Pin v-if="note.is_pinned" class="w-3 h-3 text-yellow-400" />
      <button
        @click.stop="$emit('delete', note)"
        class="p-1 opacity-0 group-hover:opacity-100 text-red-400 hover:bg-dark-bg rounded"
      >
        <Trash2 class="w-3 h-3" />
      </button>
    </div>

    <div v-if="note.is_folder && expanded && children.length > 0">
      <NoteTreeItem
        v-for="child in children"
        :key="child.id"
        :note="child"
        :all-notes="allNotes"
        :selected-id="selectedId"
        :depth="depth + 1"
        @select="$emit('select', $event)"
        @delete="$emit('delete', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import {
  ChevronRight,
  FileText,
  Folder,
  FolderOpen,
  Pin,
  Trash2,
} from "lucide-vue-next";
import { computed, ref } from "vue";

const props = defineProps({
  note: { type: Object, required: true },
  allNotes: { type: Array, default: () => [] },
  selectedId: { type: Number, default: null },
  depth: { type: Number, default: 0 },
});

defineEmits(["select", "delete"]);

const expanded = ref(false);

const children = computed(() => {
  return props.allNotes.filter((n) => n.parent_id === props.note.id);
});
</script>
