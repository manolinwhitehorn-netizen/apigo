<script setup lang="ts">
import { ref } from 'vue'
import { X } from 'lucide-vue-next'
import { useAppStore } from '@/store/useAppStore'

const { state, activeProject, closeModal, inviteMember } = useAppStore()

const inviteEmail = ref('')
const invitePermission = ref<'读写共建' | '管理员' | '只读访客'>('读写共建')

function handleInvite() {
  inviteMember(inviteEmail.value, invitePermission.value)
  inviteEmail.value = ''
}
</script>

<template>
  <!-- 弹窗 2：邀请成员共建弹窗 -->
  <div
    v-if="state.activeModal === 'modal-invite'"
    id="modal-invite"
    @click.self="closeModal"
    class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50"
  >
    <div class="bg-white rounded-2xl w-[460px] shadow-2xl border border-slate-200 overflow-hidden">
      <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 class="font-bold text-slate-900 text-base">邀请成员共建项目</h3>
        <button @click="closeModal" class="text-slate-400 hover:text-slate-600">
          <X class="w-4 h-4" />
        </button>
      </div>
      <div class="p-6 space-y-4 text-xs">
        <div>
          <label class="font-semibold text-slate-700 block mb-1.5">通过邮箱邀请同事</label>
          <div class="flex space-x-2">
            <input
              v-model="inviteEmail"
              type="email"
              placeholder="输入同事邮箱，如 dev@company.com"
              @keyup.enter="handleInvite"
              class="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
            />
            <select
              v-model="invitePermission"
              class="px-2 py-2 border border-slate-200 rounded-lg bg-slate-50"
            >
              <option value="读写共建">读写共建 (Editor)</option>
              <option value="管理员">管理员 (Admin)</option>
              <option value="只读访客">只读访客 (Viewer)</option>
            </select>
          </div>
        </div>
        <div class="pt-2">
          <div class="text-slate-400 mb-2">
            当前项目共建成员 ({{ activeProject.memberCount }})
          </div>
          <div class="space-y-2 max-h-40 overflow-y-auto">
            <div
              v-for="mem in state.members"
              :key="mem.id"
              class="flex items-center justify-between py-1.5"
            >
              <div class="flex items-center space-x-2">
                <div
                  :class="[
                    'w-6 h-6 rounded-full text-white flex items-center justify-center font-bold',
                    mem.avatarBg
                  ]"
                >
                  {{ mem.avatarText }}
                </div>
                <span class="font-medium text-slate-800">{{ mem.name }}</span>
              </div>
              <span
                :class="
                  mem.permission === '读写共建'
                    ? 'text-indigo-600 font-medium'
                    : 'text-slate-400'
                "
              >
                {{ mem.permission }}
              </span>
            </div>
          </div>
        </div>
        <button
          @click="handleInvite"
          class="w-full py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition"
        >
          发送邀请
        </button>
      </div>
    </div>
  </div>
</template>
