<template>
  <Teleport to="body">
    <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-content p-6 max-w-2xl">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold">
            {{ isEdit ? "编辑笔记" : "新建笔记" }}
          </h2>
          <button
            @click="$emit('close')"
            class="p-2 hover:bg-dark-hover rounded"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <form @submit.prevent="handleSubmit">
          <div class="mb-4">
            <label class="block text-sm font-medium mb-2">标题</label>
            <input
              v-model="form.title"
              type="text"
              class="input"
              placeholder="输入笔记标题"
              required
            />
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium mb-2">内容</label>
            <textarea
              v-model="form.content"
              class="input resize-none"
              rows="10"
              placeholder="输入笔记内容..."
            />
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium mb-2">颜色标签</label>
            <div class="flex gap-2">
              <button
                v-for="color in colors"
                :key="color"
                type="button"
                :class="[
                  'w-8 h-8 rounded-full border-2',
                  form.color === color ? 'border-white' : 'border-transparent',
                ]"
                :style="{ backgroundColor: color }"
                @click="form.color = form.color === color ? null : color"
              />
            </div>
          </div>

          <div class="flex justify-end gap-3">
            <button
              type="button"
              @click="$emit('close')"
              class="btn btn-secondary"
            >
              取消
            </button>
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="!form.title.trim()"
            >
              {{ isEdit ? "保存" : "创建" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { X } from "lucide-vue-next";
import { reactive, watch } from "vue";

const props = defineProps({
  show: { type: Boolean, default: false },
  note: { type: Object, default: null },
  isEdit: { type: Boolean, default: false },
});

const emit = defineEmits(["close", "submit"]);

const colors = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
];

const form = reactive({
  title: "",
  content: "",
  color: null,
});

watch(
  () => props.note,
  (note) => {
    if (note) {
      form.title = note.title || "";
      form.content = note.content || "";
      form.color = note.color || null;
    } else {
      form.title = "";
      form.content = "";
      form.color = null;
    }
  },
  { immediate: true }
);

function handleSubmit() {
  emit("submit", { ...form });
}
</script>
