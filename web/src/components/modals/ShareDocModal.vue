<script setup lang="ts">
import { Globe, X } from 'lucide-vue-next'
import { useAppStore } from '@/store/useAppStore'

const {
  state,
  checkedGroupsInActiveProject,
  checkedEndpointsInActiveProject,
  closeModal,
  switchScene,
  showToast
} = useAppStore()

async function goToPublicDocFromModal() {
  try {
    await navigator.clipboard.writeText(state.shareConfig.shareUrl)
    showToast('分享链接已复制，已打开文档预览')
  } catch {
    showToast('已生成并打开分享文档预览')
  }
  closeModal()
  switchScene('public-doc')
}
</script>

<template>
  <!-- 弹窗 1：勾选接口生成在线分享链接配置弹窗 (核心功能) -->
  <div
    v-if="state.activeModal === 'modal-share'"
    id="modal-share"
    @click.self="closeModal"
    class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50"
  >
    <div class="bg-white rounded-2xl w-[520px] shadow-2xl border border-slate-200 overflow-hidden">
      <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <Globe class="w-5 h-5 text-indigo-600" />
          <h3 class="font-bold text-slate-900 text-base">生成并共享在线 API 文档</h3>
        </div>
        <button @click="closeModal" class="text-slate-400 hover:text-slate-600">
          <X class="w-4 h-4" />
        </button>
      </div>
      <div class="p-6 space-y-4 text-xs">
        <div>
          <label class="font-semibold text-slate-700 block mb-1.5">分享文档标题</label>
          <input
            v-model="state.shareConfig.title"
            type="text"
            class="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div>
          <label class="font-semibold text-slate-700 block mb-1.5">包含的接口范围</label>
          <div
            class="p-3 bg-indigo-50/60 border border-indigo-100 rounded-lg text-indigo-900 flex items-center justify-between"
          >
            <span>
              已选择
              <strong
                >{{ checkedGroupsInActiveProject.length }} 个分组，共
                {{ checkedEndpointsInActiveProject.length }} 个指定接口</strong
              >（已过滤内部未勾选接口）
            </span>
            <span
              class="text-indigo-600 font-medium cursor-pointer"
              @click="
                () => {
                  closeModal()
                  switchScene('workspace')
                }
              "
            >
              重新勾选
            </span>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="font-semibold text-slate-700 block mb-1.5">访问权限控制</label>
            <select
              v-model="state.shareConfig.accessType"
              class="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-indigo-500"
            >
              <option value="public">公开访问 (拿到链接即可查看)</option>
              <option value="password">密码访问 (需输入提取码)</option>
              <option value="team">仅团队内部成员可看</option>
            </select>
          </div>
          <div>
            <label class="font-semibold text-slate-700 block mb-1.5">访问密码</label>
            <input
              v-model="state.shareConfig.password"
              type="text"
              :disabled="state.shareConfig.accessType !== 'password'"
              class="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono disabled:bg-slate-100 disabled:text-slate-400"
            />
          </div>
        </div>
        <div class="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
          <div class="text-slate-500 font-medium">
            生成的专属分享链接（实时同步最新接口定义）：
          </div>
          <div class="flex items-center space-x-2">
            <input
              type="text"
              readonly
              :value="state.shareConfig.shareUrl"
              class="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded font-mono text-indigo-600 text-[11px]"
            />
            <button
              @click="goToPublicDocFromModal"
              class="px-3 py-1.5 bg-indigo-600 text-white rounded font-medium hover:bg-indigo-700 shrink-0 transition"
            >
              复制并预览文档 →
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
