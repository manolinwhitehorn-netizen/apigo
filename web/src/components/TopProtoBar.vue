<script setup lang="ts">
import { ExternalLink } from 'lucide-vue-next'
import { useAppStore } from '@/store/useAppStore'

const { state, switchScene } = useAppStore()
</script>

<template>
  <!-- 顶部原型演示切换器（方便快速预览 3 个核心页面） -->
  <div
    class="h-10 bg-indigo-950 text-indigo-200 px-4 flex items-center justify-between text-xs shrink-0 z-50 border-b border-indigo-900"
  >
    <div class="flex items-center space-x-2">
      <span class="px-2 py-0.5 bg-indigo-500/30 text-indigo-300 rounded font-medium">
        交互原型导航
      </span>
      <span class="text-indigo-400">点击右侧按钮切换查看完整业务闭环：</span>
    </div>
    <div class="flex items-center space-x-2">
      <button
        id="btn-scene-projects"
        @click="switchScene('projects')"
        :class="[
          'px-3 py-1 rounded font-medium transition',
          state.currentScene === 'projects'
            ? 'bg-indigo-600 text-white'
            : 'hover:bg-indigo-900 text-indigo-300'
        ]"
      >
        1. 团队项目大厅 (新建/管理)
      </button>
      <button
        id="btn-scene-workspace"
        @click="switchScene('workspace')"
        :class="[
          'px-3 py-1 rounded font-medium transition',
          state.currentScene === 'workspace'
            ? 'bg-indigo-600 text-white'
            : 'hover:bg-indigo-900 text-indigo-300'
        ]"
      >
        2. 项目工作台 (勾选接口/邀请共建)
      </button>
      <button
        id="btn-scene-public-doc"
        @click="switchScene('public-doc')"
        :class="[
          'px-3 py-1 rounded font-medium flex items-center space-x-1 transition',
          state.currentScene === 'public-doc'
            ? 'bg-indigo-600 text-white'
            : 'hover:bg-indigo-900 text-emerald-400'
        ]"
      >
        <ExternalLink class="w-3.5 h-3.5" />
        <span>3. 仿 s.apifox.cn 分享文档页 (含在线调试)</span>
      </button>
    </div>
  </div>
</template>
