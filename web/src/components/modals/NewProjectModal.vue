<script setup lang="ts">
import { ref } from 'vue'
import { X } from 'lucide-vue-next'
import { useAppStore } from '@/store/useAppStore'

const { state, closeModal, createNewProject } = useAppStore()

const projectName = ref('')
const projectDesc = ref('')

function handleCreate() {
  createNewProject(projectName.value, projectDesc.value)
  projectName.value = ''
  projectDesc.value = ''
}
</script>

<template>
  <!-- 弹窗 3：新建项目弹窗 -->
  <div
    v-if="state.activeModal === 'modal-new-project'"
    id="modal-new-project"
    @click.self="closeModal"
    class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50"
  >
    <div class="bg-white rounded-2xl w-[420px] shadow-2xl border border-slate-200 overflow-hidden">
      <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 class="font-bold text-slate-900 text-base">新建 API 协作项目</h3>
        <button @click="closeModal" class="text-slate-400 hover:text-slate-600">
          <X class="w-4 h-4" />
        </button>
      </div>
      <div class="p-6 space-y-4 text-xs">
        <div>
          <label class="font-semibold text-slate-700 block mb-1.5">项目名称 *</label>
          <input
            id="new-proj-name"
            v-model="projectName"
            type="text"
            placeholder="例如：AI 智能客服微服务接口"
            @keyup.enter="handleCreate"
            class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div>
          <label class="font-semibold text-slate-700 block mb-1.5">项目简介</label>
          <textarea
            v-model="projectDesc"
            rows="2"
            placeholder="描述该项目的业务范畴..."
            class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
          ></textarea>
        </div>
        <div class="flex justify-end space-x-2 pt-2">
          <button
            @click="closeModal"
            class="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
          >
            取消
          </button>
          <button
            @click="handleCreate"
            class="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
          >
            创建并进入项目
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
