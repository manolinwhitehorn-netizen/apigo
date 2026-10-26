<script setup lang="ts">
import { onMounted } from 'vue'
import TopProtoBar from '@/components/TopProtoBar.vue'
import ProjectHallView from '@/views/ProjectHallView.vue'
import WorkspaceView from '@/views/WorkspaceView.vue'
import PublicDocView from '@/views/PublicDocView.vue'
import ShareDocModal from '@/components/modals/ShareDocModal.vue'
import InviteMemberModal from '@/components/modals/InviteMemberModal.vue'
import NewProjectModal from '@/components/modals/NewProjectModal.vue'
import { useAppStore } from '@/store/useAppStore'

const { state, loadFromBackend } = useAppStore()

onMounted(() => {
  loadFromBackend()
})
</script>

<template>
  <div class="h-screen flex flex-col overflow-hidden bg-slate-50 text-slate-800 text-sm select-none">
    <!-- 顶部原型演示切换器 -->
    <TopProtoBar />

    <!-- 3 个核心业务场景视图 -->
    <ProjectHallView v-if="state.currentScene === 'projects'" />
    <WorkspaceView v-else-if="state.currentScene === 'workspace'" />
    <PublicDocView v-else-if="state.currentScene === 'public-doc'" />

    <!-- 全局弹窗 -->
    <ShareDocModal />
    <InviteMemberModal />
    <NewProjectModal />

    <!-- 轻量交互提示 Toast -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-2"
    >
      <div
        v-if="state.toastMessage"
        class="fixed bottom-5 right-5 z-50 px-4 py-2.5 bg-slate-900 text-white text-xs font-medium rounded-xl shadow-lg border border-slate-700 flex items-center space-x-2"
      >
        <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
        <span>{{ state.toastMessage }}</span>
      </div>
    </Transition>
  </div>
</template>
