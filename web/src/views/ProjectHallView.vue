<script setup lang="ts">
import {
  FolderKanban,
  Users,
  Share2,
  UserPlus,
  Plus,
  ShoppingBag,
  CreditCard,
  PlusCircle,
  Cpu,
  Globe,
  Layers
} from 'lucide-vue-next'
import { useAppStore } from '@/store/useAppStore'

const { state, openModal, openProjectWorkspace } = useAppStore()

const iconMap = {
  'shopping-bag': ShoppingBag,
  'credit-card': CreditCard,
  cpu: Cpu,
  globe: Globe,
  layers: Layers
}
</script>

<template>
  <!-- 场景 1：团队项目大厅（新建项目、团队成员概览） -->
  <div id="scene-projects" class="flex-1 flex overflow-hidden">
    <!-- 左侧团队栏 -->
    <aside class="w-60 bg-white border-r border-slate-200 p-4 flex flex-col justify-between">
      <div class="space-y-6">
        <div class="flex items-center space-x-2.5 px-2">
          <div
            class="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center shadow-sm"
          >
            AF
          </div>
          <div>
            <div class="font-bold text-slate-900">极客云研发团队</div>
            <div class="text-[11px] text-slate-400">专业协作版 · 12 名成员</div>
          </div>
        </div>
        <nav class="space-y-1 text-xs font-medium">
          <a
            href="#"
            @click.prevent
            class="flex items-center space-x-2.5 px-3 py-2 rounded-lg bg-indigo-50 text-indigo-700"
          >
            <FolderKanban class="w-4 h-4" />
            <span>所有项目 ({{ state.projects.length + 1 }})</span>
          </a>
          <a
            href="#"
            @click.prevent="openModal('modal-invite')"
            class="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100"
          >
            <Users class="w-4 h-4" />
            <span>团队成员与权限</span>
          </a>
          <a
            href="#"
            @click.prevent="openModal('modal-share')"
            class="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100"
          >
            <Share2 class="w-4 h-4" />
            <span>对外分享文档管理</span>
          </a>
        </nav>
      </div>
      <div class="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs space-y-2">
        <div class="font-medium text-slate-700">快速邀请同事共建</div>
        <p class="text-slate-400 text-[11px]">支持按项目分配管理员、开发者或只读访客权限。</p>
        <button
          @click="openModal('modal-invite')"
          class="w-full py-1.5 bg-white border border-slate-200 rounded-lg text-indigo-600 font-medium hover:bg-slate-50"
        >
          + 邀请成员
        </button>
      </div>
    </aside>

    <!-- 右侧项目卡片网格 -->
    <main class="flex-1 p-8 overflow-y-auto">
      <div class="max-w-5xl mx-auto space-y-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-xl font-bold text-slate-900">团队项目空间</h1>
            <p class="text-xs text-slate-500 mt-1">点击项目进入接口设计、调试与文档生成工作台</p>
          </div>
          <div class="flex items-center space-x-3">
            <button
              @click="openModal('modal-invite')"
              class="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg font-medium text-xs flex items-center space-x-1.5"
            >
              <UserPlus class="w-4 h-4 text-slate-500" />
              <span>成员管理</span>
            </button>
            <button
              @click="openModal('modal-new-project')"
              class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-xs flex items-center space-x-1.5 shadow-sm"
            >
              <Plus class="w-4 h-4" />
              <span>新建项目</span>
            </button>
          </div>
        </div>

        <!-- 项目卡片列表 -->
        <div id="project-grid" class="grid grid-cols-3 gap-5">
          <div
            v-for="proj in state.projects"
            :key="proj.id"
            @click="openProjectWorkspace(proj.id)"
            class="bg-white p-5 rounded-xl border border-slate-200 hover:border-indigo-500 hover:shadow-md transition cursor-pointer group flex flex-col justify-between h-44"
          >
            <div>
              <div class="flex items-center justify-between">
                <div
                  :class="[
                    'w-10 h-10 rounded-lg flex items-center justify-center font-bold',
                    proj.iconBgClass,
                    proj.iconTextClass
                  ]"
                >
                  <component :is="iconMap[proj.icon] || ShoppingBag" class="w-5 h-5" />
                </div>
                <span
                  :class="[
                    'px-2 py-0.5 text-[10px] rounded-full font-medium',
                    proj.badgeClass
                  ]"
                >
                  {{ proj.badgeText }}
                </span>
              </div>
              <h3
                class="font-bold text-slate-900 text-base mt-3 group-hover:text-indigo-600 transition"
              >
                {{ proj.name }}
              </h3>
              <p class="text-xs text-slate-400 mt-1 line-clamp-1">
                {{ proj.description }}
              </p>
            </div>
            <div
              class="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-400"
            >
              <span>{{ proj.endpointCount }} 个接口 · {{ proj.memberCount }} 人共建</span>
              <div class="flex -space-x-1.5">
                <div
                  v-for="(av, idx) in proj.avatars"
                  :key="idx"
                  :class="[
                    'w-6 h-6 rounded-full text-white text-[10px] flex items-center justify-center ring-2 ring-white',
                    av.bgClass
                  ]"
                >
                  {{ av.text }}
                </div>
              </div>
            </div>
          </div>

          <!-- 新建项目占位卡片 -->
          <div
            @click="openModal('modal-new-project')"
            class="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-xl p-5 flex flex-col items-center justify-center text-slate-400 hover:text-indigo-600 cursor-pointer transition h-44"
          >
            <PlusCircle class="w-7 h-7 mb-2" />
            <span class="font-medium text-xs">新建 API 项目</span>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
