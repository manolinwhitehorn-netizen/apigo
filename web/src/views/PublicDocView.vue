<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  BookOpenCheck,
  Search,
  Download,
  FileText,
  Play,
  Copy,
  Terminal,
  Send
} from 'lucide-vue-next'
import { useAppStore } from '@/store/useAppStore'
import { highlightCode, highlightJson } from '@/utils/highlight'
import type { HttpMethod, ApiEndpoint } from '@/types/api'

const {
  state,
  activeProject,
  checkedGroupsInActiveProject,
  activePublicEndpoint,
  showToast
} = useAppStore()

const searchQuery = ref('')
const searchInputRef = ref<HTMLInputElement | null>(null)
const isDebugMode = ref(false)
const activeCodeLang = ref<'cURL' | 'JavaScript' | 'Python' | 'Go'>('cURL')
const activeResponseStatus = ref<'200' | '401'>('200')

// Debug form state
const debugPathUserId = ref('usr_9823471')
const debugQueryIncludeOrders = ref('true')
const debugHeaderAuth = ref('Bearer eyJhbGciOiJIUzI1NiIs...')
const debugLatency = ref('38ms')
const debugOutput = ref(
  JSON.stringify(
    {
      code: 0,
      message: 'live_debug_success',
      data: {
        user_id: 'usr_9823471',
        nickname: 'Alex Chen',
        vip_status: true
      }
    },
    null,
    2
  )
)

const filteredGroups = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return checkedGroupsInActiveProject.value
  return checkedGroupsInActiveProject.value
    .map((g) => ({
      ...g,
      endpoints: g.endpoints.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.path.toLowerCase().includes(q) ||
          e.method.toLowerCase().includes(q)
      )
    }))
    .filter((g) => g.endpoints.length > 0)
})

const activeGroupName = computed(() => {
  const ep = activePublicEndpoint.value
  if (!ep) return '用户与鉴权模块'
  const grp = activeProject.value.groups.find((g) => g.id === ep.groupId)
  return grp ? grp.name : '用户与鉴权模块'
})

// Parse path segments to highlight {param} tokens
const pathSegments = computed(() => {
  const raw = activePublicEndpoint.value?.path || '/api/v1/users/{user_id}/profile'
  const parts = raw.split(/(\{[^}]+\})/g).filter(Boolean)
  return parts.map((text) => ({
    text,
    isParam: text.startsWith('{') && text.endsWith('}')
  }))
})

const generatedCode = computed(() => {
  const ep = activePublicEndpoint.value
  const baseUrl = activeProject.value.baseUrl
  const resolvedPath = (ep?.path || '/api/v1/users/{user_id}/profile').replace(
    '{user_id}',
    'usr_9823471'
  ).replace('{order_no}', 'ORD2026101988')
  const querySuffix =
    ep?.id === 'ep-user-profile' ? '?include_orders=true' : ''
  const fullUrl = `${baseUrl}${resolvedPath}${querySuffix}`
  const method = ep?.method === 'DEL' ? 'DELETE' : ep?.method || 'GET'

  if (activeCodeLang.value === 'cURL') {
    return `curl --location --request ${method} \\
  '${fullUrl}' \\
  --header 'Authorization: Bearer YOUR_ACCESS_TOKEN' \\
  --header 'Accept: application/json'`
  }
  if (activeCodeLang.value === 'JavaScript') {
    return `const response = await fetch('${fullUrl}', {
  method: '${method}',
  headers: {
    'Authorization': 'Bearer YOUR_ACCESS_TOKEN',
    'Accept': 'application/json'
  }
});
const data = await response.json();
console.log(data);`
  }
  if (activeCodeLang.value === 'Python') {
    return `import requests

url = "${fullUrl}"
headers = {
    "Authorization": "Bearer YOUR_ACCESS_TOKEN",
    "Accept": "application/json"
}

response = requests.request("${method}", url, headers=headers)
print(response.json())`
  }
  return `package main

import (
	"fmt"
	"io"
	"net/http"
)

func main() {
	req, _ := http.NewRequest("${method}", "${fullUrl}", nil)
	req.Header.Add("Authorization", "Bearer YOUR_ACCESS_TOKEN")
	req.Header.Add("Accept", "application/json")

	res, _ := http.DefaultClient.Do(req)
	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)
	fmt.Println(string(body))
}`
})

const formattedResponseExample = computed(() => {
  if (activeResponseStatus.value === '401') {
    return JSON.stringify(
      {
        code: 40101,
        message: 'unauthorized: invalid or expired bearer token',
        data: null
      },
      null,
      2
    )
  }
  return JSON.stringify(activePublicEndpoint.value?.responseExample || {}, null, 2)
})

const highlightedCode = computed(() =>
  highlightCode(generatedCode.value, activeCodeLang.value)
)

const highlightedResponseExample = computed(() =>
  highlightJson(formattedResponseExample.value)
)

const highlightedDebugOutput = computed(() => highlightJson(debugOutput.value))

function selectPublicEndpoint(ep: ApiEndpoint) {
  state.activePublicEndpointId = ep.id
  activeResponseStatus.value = '200'
}

function togglePublicDebug() {
  isDebugMode.value = !isDebugMode.value
}

async function runPublicTest() {
  debugOutput.value = `// 正在请求 ${activeProject.value.baseUrl} ...`
  const start = performance.now()
  try {
    const res = await fetch('/api/v1/debug/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpointId: activePublicEndpoint.value?.id,
        userId: debugPathUserId.value,
        includeOrders: debugQueryIncludeOrders.value
      })
    })
    if (res.ok) {
      const data = await res.json()
      debugLatency.value = `${Math.max(12, Math.round(performance.now() - start))}ms`
      debugOutput.value = JSON.stringify(data, null, 2)
      return
    }
  } catch {
    // Fallback to simulated prototype response
  }

  setTimeout(() => {
    debugLatency.value = '38ms'
    debugOutput.value = JSON.stringify(
      {
        code: 0,
        message: 'live_debug_success',
        timestamp: Date.now(),
        data: {
          user_id: debugPathUserId.value || 'usr_9823471',
          nickname: 'Alex Chen',
          vip_status: true
        }
      },
      null,
      2
    )
  }, 250)
}

async function copyCode() {
  try {
    await navigator.clipboard.writeText(generatedCode.value)
    showToast('代码已复制到剪贴板')
  } catch {
    showToast('已复制代码示例')
  }
}

function exportOpenAPI() {
  const openApiDoc = {
    openapi: '3.0.3',
    info: {
      title: `${activeProject.value.name} 文档`,
      version: activeProject.value.version,
      description: activeProject.value.description
    },
    servers: [{ url: activeProject.value.baseUrl, description: activeProject.value.envName }],
    paths: Object.fromEntries(
      checkedGroupsInActiveProject.value
        .flatMap((g) => g.endpoints)
        .map((ep) => [
          ep.path,
          {
            [ep.method.toLowerCase() === 'del' ? 'delete' : ep.method.toLowerCase()]: {
              summary: ep.name,
              description: ep.description,
              responses: {
                '200': {
                  description: '成功响应',
                  content: {
                    'application/json': {
                      example: ep.responseExample
                    }
                  }
                }
              }
            }
          }
        ])
    )
  }
  const blob = new Blob([JSON.stringify(openApiDoc, null, 2)], {
    type: 'application/json'
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `openapi-${activeProject.value.version}.json`
  a.click()
  URL.revokeObjectURL(url)
  showToast('已导出 OpenAPI 3.0 规范文件')
}

function methodTreeBadgeStyle(method: HttpMethod, isActive: boolean) {
  if (method === 'GET') {
    return isActive
      ? 'text-emerald-600 bg-emerald-100/80'
      : 'text-emerald-600 bg-emerald-50'
  }
  if (method === 'POST') {
    return 'text-blue-600 bg-blue-50'
  }
  if (method === 'DEL') {
    return 'text-rose-500 bg-rose-50'
  }
  return 'text-amber-600 bg-amber-50'
}

function methodHeroBadgeStyle(method: HttpMethod) {
  switch (method) {
    case 'GET':
      return 'bg-emerald-600 text-white'
    case 'POST':
      return 'bg-blue-600 text-white'
    case 'DEL':
      return 'bg-rose-600 text-white'
    default:
      return 'bg-amber-600 text-white'
  }
}

function handleKeydown(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    searchInputRef.value?.focus()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <!-- 场景 3：仿 https://s.apifox.cn/... 独立对外分享的交互式 API 文档页 -->
  <div id="scene-public-doc" class="flex-1 flex flex-col overflow-hidden bg-white">
    <!-- 文档顶部公开导航栏 -->
    <header
      class="h-14 border-b border-slate-200 px-6 flex items-center justify-between bg-white shrink-0"
    >
      <div class="flex items-center space-x-3">
        <div
          class="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center shadow-sm"
        >
          <BookOpenCheck class="w-4 h-4" />
        </div>
        <div>
          <div class="flex items-center space-x-2">
            <span class="font-bold text-slate-900 text-base">
              {{ activeProject.name }} 文档
            </span>
            <span
              class="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[11px] font-mono"
            >
              {{ activeProject.version }}
            </span>
          </div>
        </div>
      </div>

      <!-- 中部全局搜索 -->
      <div class="w-80 relative flex items-center">
        <Search class="w-4 h-4 text-slate-400 absolute left-3" />
        <input
          ref="searchInputRef"
          v-model="searchQuery"
          type="text"
          placeholder="搜索接口名称、路径或参数..."
          class="w-full pl-9 pr-12 py-1.5 bg-slate-100/80 border border-transparent focus:bg-white focus:border-indigo-500 rounded-lg text-xs focus:outline-none transition"
        />
        <span
          class="absolute right-2.5 text-[10px] text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono"
        >
          ⌘K
        </span>
      </div>

      <!-- 右侧环境显示与导出 -->
      <div class="flex items-center space-x-3 text-xs">
        <div
          class="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
        >
          <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span class="text-slate-500">{{ activeProject.envName }}:</span>
          <span class="font-mono text-slate-800 font-medium">{{
            activeProject.baseUrl
          }}</span>
        </div>
        <button
          @click="exportOpenAPI"
          class="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-700 font-medium flex items-center space-x-1"
        >
          <Download class="w-3.5 h-3.5" />
          <span>导出 OpenAPI</span>
        </button>
      </div>
    </header>

    <!-- 仿 s.apifox.cn 经典三栏式主体：左目录树 + 中间参数文档 + 右侧代码示例与在线调试 -->
    <div class="flex-1 flex overflow-hidden">
      <!-- 1. 左栏：仅展示被勾选公开的接口树 -->
      <aside
        class="w-64 border-r border-slate-200 bg-slate-50/40 overflow-y-auto p-3 space-y-4 shrink-0 text-xs"
      >
        <div>
          <div class="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            快速开始
          </div>
          <div class="mt-1 space-y-0.5">
            <a
              href="#"
              @click.prevent="showToast('已打开鉴权说明与错误码规范章节')"
              class="flex items-center space-x-2 px-2.5 py-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <FileText class="w-3.5 h-3.5 text-slate-400" />
              <span>鉴权说明与错误码规范</span>
            </a>
          </div>
        </div>

        <div v-for="group in filteredGroups" :key="group.id">
          <div class="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            {{ group.name }}
          </div>
          <div class="mt-1 space-y-0.5">
            <a
              v-for="ep in group.endpoints"
              :key="ep.id"
              href="#"
              @click.prevent="selectPublicEndpoint(ep)"
              :class="[
                'flex items-center space-x-2 px-2.5 py-2 rounded-lg transition',
                activePublicEndpoint?.id === ep.id
                  ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100/80'
                  : 'text-slate-600 hover:bg-slate-100'
              ]"
            >
              <span
                :class="[
                  'font-mono text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0',
                  methodTreeBadgeStyle(ep.method, activePublicEndpoint?.id === ep.id)
                ]"
              >
                {{ ep.method }}
              </span>
              <span class="truncate">{{ ep.name }}</span>
            </a>
          </div>
        </div>
      </aside>

      <!-- 2. 中栏：结构化接口文档详情 -->
      <main class="flex-1 min-w-0 overflow-y-auto p-8" v-if="activePublicEndpoint">
        <div class="max-w-4xl mx-auto space-y-6">
          <!-- 接口标题与状态 -->
          <div>
            <div class="flex items-center space-x-2 text-xs text-slate-400 mb-2">
              <span>{{ activeGroupName }}</span>
              <span>/</span>
              <span class="text-slate-600">{{ activePublicEndpoint.name }}</span>
            </div>
            <div class="flex items-center justify-between">
              <h1 class="text-2xl font-bold text-slate-900">
                {{ activePublicEndpoint.name }}
              </h1>
              <span
                class="px-2.5 py-0.5 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-medium"
              >
                ● {{ activePublicEndpoint.status }}
              </span>
            </div>
          </div>

          <!-- HTTP 方法 + 路径 + 在线调试按钮 (Apifox 标志性设计) -->
          <div
            class="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between"
          >
            <div class="flex items-center space-x-3 font-mono text-xs">
              <span
                :class="[
                  'px-2.5 py-1 font-bold rounded-md',
                  methodHeroBadgeStyle(activePublicEndpoint.method)
                ]"
              >
                {{ activePublicEndpoint.method }}
              </span>
              <span class="text-slate-400">{{ activeProject.baseUrl }}</span>
              <span class="text-slate-900 font-semibold">
                <template v-for="(seg, sIdx) in pathSegments" :key="sIdx">
                  <span
                    v-if="seg.isParam"
                    class="text-indigo-600 bg-indigo-50 px-1 rounded"
                    >{{ seg.text }}</span
                  >
                  <template v-else>{{ seg.text }}</template>
                </template>
              </span>
            </div>
            <button
              id="btn-try-it"
              @click="togglePublicDebug"
              class="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium flex items-center space-x-1.5 shadow-sm transition"
            >
              <Play class="w-3.5 h-3.5" />
              <span>在线调试 (Try it out)</span>
            </button>
          </div>

          <p
            v-if="activePublicEndpoint.id === 'ep-user-profile'"
            class="text-slate-600 text-xs leading-relaxed"
          >
            根据传入的
            <code class="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-800"
              >user_id</code
            >
            获取指定用户的个人档案、VIP 订阅状态以及最近一笔交易快照。调用此接口需要在 Header
            中传入有效的 Bearer Token。
          </p>
          <p v-else class="text-slate-600 text-xs leading-relaxed">
            {{ activePublicEndpoint.description }}
          </p>

          <!-- 请求参数：Path & Query 参数 -->
          <div class="space-y-3">
            <h3 class="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <span>请求参数 (Request Parameters)</span>
            </h3>

            <template v-if="activePublicEndpoint.pathParams.length > 0">
              <div class="text-xs font-semibold text-slate-500">Path 参数</div>
              <div class="border border-slate-200 rounded-xl overflow-hidden">
                <table class="w-full text-left text-xs">
                  <thead class="bg-slate-50 border-b border-slate-200 text-slate-500">
                    <tr>
                      <th class="py-2.5 px-4">参数名</th>
                      <th class="py-2.5 px-4">类型</th>
                      <th class="py-2.5 px-4">必填</th>
                      <th class="py-2.5 px-4">说明与示例值</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-200">
                    <tr v-for="param in activePublicEndpoint.pathParams" :key="param.name">
                      <td class="py-3 px-4 font-mono font-semibold text-slate-900">
                        {{ param.name }}
                      </td>
                      <td class="py-3 px-4 font-mono text-indigo-600">{{ param.type }}</td>
                      <td class="py-3 px-4">
                        <span
                          v-if="param.required"
                          class="text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded text-[10px] font-medium"
                        >
                          必填
                        </span>
                        <span
                          v-else
                          class="text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded text-[10px]"
                        >
                          可选
                        </span>
                      </td>
                      <td class="py-3 px-4 text-slate-600">
                        {{ param.description }}
                        <span
                          v-if="param.example"
                          class="ml-2 text-slate-400 font-mono"
                        >
                          示例: {{ param.example }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </template>

            <template v-if="activePublicEndpoint.queryParams.length > 0">
              <div class="text-xs font-semibold text-slate-500 pt-2">Query 参数</div>
              <div class="border border-slate-200 rounded-xl overflow-hidden">
                <table class="w-full text-left text-xs">
                  <thead class="bg-slate-50 border-b border-slate-200 text-slate-500">
                    <tr>
                      <th class="py-2.5 px-4">参数名</th>
                      <th class="py-2.5 px-4">类型</th>
                      <th class="py-2.5 px-4">必填</th>
                      <th class="py-2.5 px-4">说明与示例值</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-200">
                    <tr v-for="param in activePublicEndpoint.queryParams" :key="param.name">
                      <td class="py-3 px-4 font-mono font-semibold text-slate-900">
                        {{ param.name }}
                      </td>
                      <td class="py-3 px-4 font-mono text-indigo-600">{{ param.type }}</td>
                      <td class="py-3 px-4">
                        <span
                          v-if="param.required"
                          class="text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded text-[10px] font-medium"
                        >
                          必填
                        </span>
                        <span
                          v-else
                          class="text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded text-[10px]"
                        >
                          可选
                        </span>
                      </td>
                      <td class="py-3 px-4 text-slate-600">
                        <template v-if="param.name === 'include_orders'">
                          是否附带返回最近订单列表，默认 <code class="font-mono">false</code>
                        </template>
                        <template v-else>
                          {{ param.description }}
                        </template>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </template>
          </div>

          <!-- 返回响应 Schema 树 -->
          <div class="space-y-3 pt-2">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-bold text-slate-900">返回响应 (Responses)</h3>
              <div class="flex space-x-1 text-xs">
                <span
                  @click="activeResponseStatus = '200'"
                  :class="[
                    'px-2.5 py-1 font-mono rounded-md cursor-pointer transition',
                    activeResponseStatus === '200'
                      ? 'bg-emerald-50 text-emerald-700 font-medium border border-emerald-200'
                      : 'text-slate-500 hover:bg-slate-100'
                  ]"
                >
                  200 成功
                </span>
                <span
                  @click="activeResponseStatus = '401'"
                  :class="[
                    'px-2.5 py-1 font-mono rounded-md cursor-pointer transition',
                    activeResponseStatus === '401'
                      ? 'bg-rose-50 text-rose-700 font-medium border border-rose-200'
                      : 'text-slate-500 hover:bg-slate-100'
                  ]"
                >
                  401 未授权
                </span>
              </div>
            </div>

            <div
              class="border border-slate-200 rounded-xl p-4 bg-slate-50/50 font-mono text-xs space-y-2.5"
            >
              <template
                v-for="(field, fIdx) in activePublicEndpoint.responseSchema"
                :key="field.name"
              >
                <div
                  v-if="!field.children"
                  :class="[
                    'flex items-center justify-between',
                    fIdx < activePublicEndpoint.responseSchema.length - 1
                      ? 'border-b border-slate-200/80 pb-2'
                      : ''
                  ]"
                >
                  <div>
                    <span class="font-bold text-slate-900">{{ field.name }}</span>
                    <span class="text-indigo-600 ml-2">{{ field.type }}</span>
                    <span
                      v-if="field.required"
                      class="text-rose-500 text-[10px] font-sans ml-1"
                    >
                      必填
                    </span>
                  </div>
                  <span class="font-sans text-slate-500">{{ field.description }}</span>
                </div>

                <div v-else>
                  <div class="flex items-center justify-between">
                    <div>
                      <span class="font-bold text-slate-900">{{ field.name }}</span>
                      <span class="text-amber-600 ml-2">{{ field.type }}</span>
                    </div>
                    <span class="font-sans text-slate-500">{{ field.description }}</span>
                  </div>
                  <div class="pl-5 mt-2 border-l-2 border-slate-300 space-y-2">
                    <div
                      v-for="child in field.children"
                      :key="child.name"
                      class="flex justify-between"
                    >
                      <div>
                        <span class="text-slate-800">{{ child.name }}</span>
                        <span class="text-indigo-600 ml-2">{{ child.type }}</span>
                      </div>
                      <span class="font-sans text-slate-500">{{ child.description }}</span>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
      </main>

      <!-- 3. 右栏：仿 s.apifox.cn 深色代码面板 & 在线调试抽屉 -->
      <aside
        class="w-[420px] xl:w-[480px] 2xl:w-[520px] bg-slate-900 text-slate-100 flex flex-col shrink-0 border-l border-slate-800"
      >
        <!-- 默认态：多语言请求代码示例 + 响应示例 -->
        <div
          v-show="!isDebugMode"
          id="public-code-panel"
          class="flex-1 flex flex-col overflow-hidden"
        >
          <!-- 上半部：自动生成的调用代码 -->
          <div class="h-1/2 min-h-0 flex flex-col border-b border-slate-800">
            <div
              class="h-10 px-4 border-b border-slate-800 flex items-center justify-between text-xs bg-slate-950/50 shrink-0"
            >
              <div class="flex space-x-3 font-mono">
                <button
                  v-for="lang in (['cURL', 'JavaScript', 'Python', 'Go'] as const)"
                  :key="lang"
                  @click="activeCodeLang = lang"
                  :class="[
                    'py-2.5 transition',
                    activeCodeLang === lang
                      ? 'text-indigo-400 font-semibold border-b-2 border-indigo-400'
                      : 'text-slate-400 hover:text-white'
                  ]"
                >
                  {{ lang }}
                </button>
              </div>
              <button
                @click="copyCode"
                class="text-slate-400 hover:text-white flex items-center space-x-1"
              >
                <Copy class="w-3.5 h-3.5" />
                <span>复制</span>
              </button>
            </div>
            <pre
              class="flex-1 p-4 font-mono text-xs text-slate-200 overflow-y-auto overflow-x-hidden whitespace-pre-wrap break-all leading-relaxed dark-scrollbar select-text"
              v-html="highlightedCode"
            ></pre>
          </div>

          <!-- 下半部：响应示例 JSON -->
          <div class="h-1/2 min-h-0 flex flex-col">
            <div
              class="h-10 px-4 border-b border-slate-800 flex items-center justify-between text-xs bg-slate-950/50 shrink-0"
            >
              <span class="font-medium text-slate-300">
                响应示例 ({{ activeResponseStatus === '200' ? '200 OK' : '401 Unauthorized' }})
              </span>
              <span class="font-mono text-[11px] text-emerald-400">application/json</span>
            </div>
            <pre
              class="flex-1 p-4 font-mono text-xs text-slate-200 overflow-y-auto overflow-x-hidden whitespace-pre-wrap break-all leading-relaxed dark-scrollbar select-text"
              v-html="highlightedResponseExample"
            ></pre>
          </div>
        </div>

        <!-- 激活态：点击“在线调试 (Try it out)”后切换出的交互发包面板 -->
        <div
          v-show="isDebugMode"
          id="public-debug-panel"
          class="flex-1 flex flex-col overflow-hidden bg-slate-900"
        >
          <div
            class="h-11 px-4 border-b border-slate-800 flex items-center justify-between bg-indigo-950/60"
          >
            <div class="flex items-center space-x-2 text-xs font-semibold text-indigo-300">
              <Terminal class="w-4 h-4" />
              <span>在线调试控制台 (Try it out)</span>
            </div>
            <button @click="togglePublicDebug" class="text-xs text-slate-400 hover:text-white">
              返回代码示例 ✕
            </button>
          </div>

          <div class="p-4 space-y-4 flex-1 overflow-y-auto text-xs">
            <div>
              <label class="text-slate-400 block mb-1">
                Path 参数：<code class="text-white font-mono">user_id</code> *
              </label>
              <input
                v-model="debugPathUserId"
                type="text"
                class="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded font-mono text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label class="text-slate-400 block mb-1">
                Query 参数：<code class="text-white font-mono">include_orders</code>
              </label>
              <input
                v-model="debugQueryIncludeOrders"
                type="text"
                class="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded font-mono text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label class="text-slate-400 block mb-1">
                Header：<code class="text-white font-mono">Authorization</code>
              </label>
              <input
                v-model="debugHeaderAuth"
                type="text"
                class="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded font-mono text-emerald-400 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <button
              @click="runPublicTest"
              class="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg shadow flex items-center justify-center space-x-1.5 transition"
            >
              <Send class="w-3.5 h-3.5" />
              <span>发送真实请求</span>
            </button>

            <div class="pt-3 border-t border-slate-800">
              <div class="flex justify-between text-[11px] text-slate-400 mb-2">
                <span>实时响应结果</span>
                <span class="text-emerald-400 font-mono">200 OK · {{ debugLatency }}</span>
              </div>
              <pre
                id="public-test-output"
                class="p-3 bg-slate-950 rounded-lg font-mono text-[11px] text-slate-200 overflow-y-auto overflow-x-hidden whitespace-pre-wrap break-all leading-relaxed dark-scrollbar select-text"
                v-html="highlightedDebugOutput"
              ></pre>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>
