<script setup lang="ts">
import { ref, watch } from 'vue'
import { ArrowLeft, FolderOpen, Users, Share2 } from 'lucide-vue-next'
import { useAppStore } from '@/store/useAppStore'
import type { HttpMethod, ApiEndpoint } from '@/types/api'

const {
  state,
  activeProject,
  activeWorkspaceEndpoint,
  checkedEndpointsInActiveProject,
  switchScene,
  openModal,
  toggleGroupCheck,
  isGroupAllChecked,
  saveEndpointChanges
} = useAppStore()

const editablePath = ref(activeWorkspaceEndpoint.value?.path || '')

watch(
  () => activeWorkspaceEndpoint.value,
  (ep) => {
    if (ep) {
      editablePath.value = ep.path
    }
  },
  { immediate: true }
)

function selectEndpoint(ep: ApiEndpoint) {
  state.activeWorkspaceEndpointId = ep.id
  if (ep.checkedForShare) {
    state.activePublicEndpointId = ep.id
  }
}

function methodBadgeStyle(method: HttpMethod) {
  switch (method) {
    case 'GET':
      return 'text-emerald-600 bg-emerald-50'
    case 'POST':
      return 'text-blue-600 bg-blue-50'
    case 'DEL':
      return 'text-rose-500 bg-rose-50'
    case 'PUT':
    case 'PATCH':
      return 'text-amber-600 bg-amber-50'
    default:
      return 'text-slate-600 bg-slate-100'
  }
}

function methodEditorBadgeStyle(method: HttpMethod) {
  switch (method) {
    case 'GET':
      return 'bg-emerald-50 text-emerald-700'
    case 'POST':
      return 'bg-blue-50 text-blue-700'
    case 'DEL':
      return 'bg-rose-50 text-rose-700'
    default:
      return 'bg-amber-50 text-amber-700'
  }
}
</script>

<template>
  <!-- 场景 2：项目工作台（支持勾选指定接口 ➔ 一键生成在线分享文档） -->
  <div id="scene-workspace" class="flex-1 flex overflow-hidden">
    <!-- 左侧接口树（带多选 Checkbox，用于批量生成文档） -->
    <aside class="w-72 bg-white border-r border-slate-200 flex flex-col shrink-0">
      <div class="h-12 px-3.5 border-b border-slate-200 flex items-center justify-between">
        <div class="flex items-center space-x-2 overflow-hidden">
          <button
            @click="switchScene('projects')"
            class="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 shrink-0"
            title="返回项目大厅"
          >
            <ArrowLeft class="w-4 h-4" />
          </button>
          <span class="font-bold text-slate-800 truncate">{{ activeProject.name }}</span>
        </div>
      </div>

      <!-- 批量勾选提示栏 -->
      <div
        class="px-3 py-2 bg-indigo-50/70 border-b border-indigo-100 flex items-center justify-between text-xs"
      >
        <span class="text-indigo-700 font-medium">勾选接口以批量生成文档</span>
        <button
          @click="openModal('modal-share')"
          class="px-2 py-1 bg-indigo-600 text-white rounded text-[11px] font-medium hover:bg-indigo-700 shadow-sm"
        >
          生成分享文档 ({{ checkedEndpointsInActiveProject.length }})
        </button>
      </div>

      <!-- 带 Checkbox 的接口目录树 -->
      <div class="flex-1 overflow-y-auto p-2 space-y-1 text-xs">
        <div
          v-for="(group, gIdx) in activeProject.groups"
          :key="group.id"
          :class="{ 'pt-1': gIdx > 0 }"
        >
          <label
            class="flex items-center space-x-2 px-2 py-1.5 rounded hover:bg-slate-100 cursor-pointer font-medium text-slate-700"
          >
            <input
              type="checkbox"
              :checked="group.endpoints.some((e) => e.checkedForShare)"
              @change="
                toggleGroupCheck(group, ($event.target as HTMLInputElement).checked)
              "
              class="accent-indigo-600 rounded"
            />
            <FolderOpen class="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span class="truncate">
              {{ group.name }}{{ gIdx === 0 && isGroupAllChecked(group) ? ' (已全选)' : '' }}
            </span>
          </label>
          <div class="pl-5 space-y-0.5 mt-0.5">
            <div
              v-for="ep in group.endpoints"
              :key="ep.id"
              @click="selectEndpoint(ep)"
              :class="[
                'flex items-center space-x-2 px-2 py-1.5 rounded cursor-pointer transition',
                state.activeWorkspaceEndpointId === ep.id
                  ? 'bg-indigo-50 text-indigo-700 font-medium'
                  : ep.isInternal
                    ? 'hover:bg-slate-100 text-slate-400'
                    : 'hover:bg-slate-100 text-slate-600'
              ]"
            >
              <input
                type="checkbox"
                v-model="ep.checkedForShare"
                @click.stop
                class="accent-indigo-600"
              />
              <span
                :class="[
                  'font-mono text-[10px] font-bold px-1 rounded shrink-0',
                  methodBadgeStyle(ep.method)
                ]"
              >
                {{ ep.method }}
              </span>
              <span class="truncate">{{ ep.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </aside>

    <!-- 右侧接口编辑与顶部协作栏 -->
    <main class="flex-1 flex flex-col bg-white overflow-hidden" v-if="activeWorkspaceEndpoint">
      <header
        class="h-12 border-b border-slate-200 px-4 flex items-center justify-between bg-slate-50/50"
      >
        <div class="flex items-center space-x-2 text-xs">
          <span
            :class="[
              'font-mono text-[10px] font-bold px-1.5 py-0.5 rounded',
              methodBadgeStyle(activeWorkspaceEndpoint.method)
            ]"
          >
            {{ activeWorkspaceEndpoint.method }}
          </span>
          <span class="font-semibold text-slate-800">{{ activeWorkspaceEndpoint.name }}</span>
          <span class="text-slate-400 font-mono">{{ activeWorkspaceEndpoint.path }}</span>
        </div>
        <!-- 顶部协同与分享核心操作区 -->
        <div class="flex items-center space-x-2.5 text-xs">
          <button
            @click="openModal('modal-invite')"
            class="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 font-medium flex items-center space-x-1.5"
          >
            <Users class="w-3.5 h-3.5 text-indigo-600" />
            <span>邀请共建 ({{ activeProject.memberCount }}人)</span>
          </button>
          <button
            @click="openModal('modal-share')"
            class="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium flex items-center space-x-1.5 shadow-sm"
          >
            <Share2 class="w-3.5 h-3.5" />
            <span>发布 / 分享 API 文档</span>
          </button>
        </div>
      </header>

      <!-- 简易编辑预览区 -->
      <div class="flex-1 p-6 overflow-y-auto space-y-5">
        <div class="flex items-center space-x-2">
          <span
            :class="[
              'px-2.5 py-1.5 font-mono font-bold text-xs rounded-md',
              methodEditorBadgeStyle(activeWorkspaceEndpoint.method)
            ]"
          >
            {{ activeWorkspaceEndpoint.method }}
          </span>
          <input
            type="text"
            v-model="editablePath"
            class="flex-1 px-3 py-1.5 border border-slate-200 rounded-md font-mono text-xs focus:outline-none focus:border-indigo-500"
          />
          <button
            @click="saveEndpointChanges(editablePath)"
            class="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-medium transition"
          >
            保存并同步文档
          </button>
        </div>

        <div
          class="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between"
        >
          <div>
            <span class="font-semibold text-slate-800">提示：</span> 你在左侧勾选了
            <strong class="text-indigo-600"
              >{{ checkedEndpointsInActiveProject.length }} 个核心接口</strong
            >（已排除内部敏感删除接口）。点击右上角「发布 / 分享 API 文档」即可生成类似
            <code class="font-mono text-indigo-600">s.apifox.cn</code> 的在线文档链接。
          </div>
          <button
            @click="openModal('modal-share')"
            class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shrink-0 ml-4 transition"
          >
            立即配置分享链接 →
          </button>
        </div>
      </div>
    </main>
  </div>
</template>
