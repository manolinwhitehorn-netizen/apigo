import { reactive, computed } from 'vue'
import type {
  SceneType,
  ProjectItem,
  TeamMember,
  ShareConfig,
  ApiEndpoint,
  EndpointGroup
} from '@/types/api'

const defaultProjects: ProjectItem[] = [
  {
    id: 'proj-ecommerce',
    name: '核心电商交易系统 API',
    description: '包含用户中心、订单支付、物流回调等核心接口',
    icon: 'shopping-bag',
    iconBgClass: 'bg-indigo-50',
    iconTextClass: 'text-indigo-600',
    badgeText: '已发布 2 份文档',
    badgeClass: 'bg-emerald-50 text-emerald-600',
    endpointCount: 28,
    memberCount: 5,
    version: 'v1.2.0',
    baseUrl: 'https://api.shop.com',
    envName: '正式环境',
    avatars: [
      { text: '陈', bgClass: 'bg-indigo-500' },
      { text: '林', bgClass: 'bg-emerald-500' },
      { text: '王', bgClass: 'bg-amber-500' }
    ],
    groups: [
      {
        id: 'grp-user-auth',
        name: '用户与鉴权模块',
        endpoints: [
          {
            id: 'ep-user-profile',
            groupId: 'grp-user-auth',
            method: 'GET',
            name: '查询用户详情信息',
            path: '/api/v1/users/{user_id}/profile',
            description:
              '根据传入的 user_id 获取指定用户的个人档案、VIP 订阅状态以及最近一笔交易快照。调用此接口需要在 Header 中传入有效的 Bearer Token。',
            checkedForShare: true,
            status: '已发布',
            pathParams: [
              {
                name: 'user_id',
                type: 'string',
                required: true,
                description: '全局唯一用户 ID',
                example: 'usr_9823471'
              }
            ],
            queryParams: [
              {
                name: 'include_orders',
                type: 'boolean',
                required: false,
                description: '是否附带返回最近订单列表，默认 false',
                defaultValue: 'false',
                example: 'true'
              }
            ],
            headerParams: [
              {
                name: 'Authorization',
                type: 'string',
                required: true,
                description: 'Bearer 访问令牌',
                example: 'Bearer eyJhbGciOiJIUzI1NiIs...'
              }
            ],
            responseSchema: [
              {
                name: 'code',
                type: 'integer',
                required: true,
                description: '状态码，0 代表成功'
              },
              {
                name: 'message',
                type: 'string',
                description: '提示信息'
              },
              {
                name: 'data',
                type: 'object',
                description: '用户详情核心载荷',
                children: [
                  {
                    name: 'user_id',
                    type: 'string',
                    description: '用户唯一 ID'
                  },
                  {
                    name: 'nickname',
                    type: 'string',
                    description: '用户显示昵称'
                  },
                  {
                    name: 'vip_status',
                    type: 'boolean',
                    description: '是否为有效 VIP 会员'
                  }
                ]
              }
            ],
            responseExample: {
              code: 0,
              message: 'success',
              data: {
                user_id: 'usr_9823471',
                nickname: 'Alex Chen',
                vip_status: true,
                recent_orders: [
                  {
                    order_no: 'ORD2026101988',
                    amount: 299.0,
                    status: 'PAID'
                  }
                ]
              }
            }
          },
          {
            id: 'ep-user-login',
            groupId: 'grp-user-auth',
            method: 'POST',
            name: '用户登录获取 Token',
            path: '/api/v1/auth/login',
            description:
              '通过账号密码或短信验证码登录系统，验证成功后签发 JWT Access Token 与 Refresh Token。',
            checkedForShare: true,
            status: '已发布',
            pathParams: [],
            queryParams: [
              {
                name: 'login_type',
                type: 'string',
                required: false,
                description: '登录方式：password 或 sms，默认 password',
                defaultValue: 'password',
                example: 'password'
              }
            ],
            headerParams: [
              {
                name: 'Content-Type',
                type: 'string',
                required: true,
                description: '请求体格式',
                example: 'application/json'
              }
            ],
            responseSchema: [
              {
                name: 'code',
                type: 'integer',
                required: true,
                description: '状态码，0 代表成功'
              },
              {
                name: 'message',
                type: 'string',
                description: '提示信息'
              },
              {
                name: 'data',
                type: 'object',
                description: '鉴权令牌载荷',
                children: [
                  {
                    name: 'access_token',
                    type: 'string',
                    description: 'JWT 访问令牌'
                  },
                  {
                    name: 'expires_in',
                    type: 'integer',
                    description: '有效期（秒）'
                  },
                  {
                    name: 'token_type',
                    type: 'string',
                    description: '固定为 Bearer'
                  }
                ]
              }
            ],
            responseExample: {
              code: 0,
              message: 'success',
              data: {
                access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.apiflow',
                expires_in: 7200,
                token_type: 'Bearer'
              }
            }
          }
        ]
      },
      {
        id: 'grp-order-pay',
        name: '订单与支付模块',
        endpoints: [
          {
            id: 'ep-order-create',
            groupId: 'grp-order-pay',
            method: 'POST',
            name: '创建商品交易订单',
            path: '/api/v1/orders',
            description:
              '根据购物车商品 SKU 列表、收货地址与优惠券创建待支付交易订单，并锁定库存。',
            checkedForShare: true,
            status: '已发布',
            pathParams: [],
            queryParams: [
              {
                name: 'client_channel',
                type: 'string',
                required: false,
                description: '下单渠道标识 (app / mini_program / web)',
                defaultValue: 'app',
                example: 'mini_program'
              }
            ],
            headerParams: [
              {
                name: 'Authorization',
                type: 'string',
                required: true,
                description: 'Bearer 访问令牌',
                example: 'Bearer eyJhbGciOiJIUzI1NiIs...'
              },
              {
                name: 'Idempotency-Key',
                type: 'string',
                required: true,
                description: '幂等防重放唯一键',
                example: 'idem_20261026_001'
              }
            ],
            responseSchema: [
              {
                name: 'code',
                type: 'integer',
                required: true,
                description: '状态码，0 代表成功'
              },
              {
                name: 'message',
                type: 'string',
                description: '提示信息'
              },
              {
                name: 'data',
                type: 'object',
                description: '新订单信息',
                children: [
                  {
                    name: 'order_no',
                    type: 'string',
                    description: '平台交易订单号'
                  },
                  {
                    name: 'pay_amount',
                    type: 'number',
                    description: '应付金额（元）'
                  },
                  {
                    name: 'status',
                    type: 'string',
                    description: '订单状态 (PENDING_PAYMENT)'
                  }
                ]
              }
            ],
            responseExample: {
              code: 0,
              message: 'success',
              data: {
                order_no: 'ORD202610269912',
                pay_amount: 299.0,
                status: 'PENDING_PAYMENT'
              }
            }
          },
          {
            id: 'ep-pay-status',
            groupId: 'grp-order-pay',
            method: 'GET',
            name: '查询支付状态结果',
            path: '/api/v1/orders/{order_no}/payment-status',
            description:
              '轮询或主动查询指定订单号的实时支付流水状态及第三方支付渠道回执信息。',
            checkedForShare: true,
            status: '已发布',
            pathParams: [
              {
                name: 'order_no',
                type: 'string',
                required: true,
                description: '平台交易订单号',
                example: 'ORD2026101988'
              }
            ],
            queryParams: [],
            headerParams: [
              {
                name: 'Authorization',
                type: 'string',
                required: true,
                description: 'Bearer 访问令牌',
                example: 'Bearer eyJhbGciOiJIUzI1NiIs...'
              }
            ],
            responseSchema: [
              {
                name: 'code',
                type: 'integer',
                required: true,
                description: '状态码，0 代表成功'
              },
              {
                name: 'message',
                type: 'string',
                description: '提示信息'
              },
              {
                name: 'data',
                type: 'object',
                description: '支付状态载荷',
                children: [
                  {
                    name: 'order_no',
                    type: 'string',
                    description: '平台订单号'
                  },
                  {
                    name: 'pay_status',
                    type: 'string',
                    description: '支付状态：PAID / UNPAID / REFUNDED'
                  },
                  {
                    name: 'paid_at',
                    type: 'string',
                    description: '支付完成时间 (ISO8601)'
                  }
                ]
              }
            ],
            responseExample: {
              code: 0,
              message: 'success',
              data: {
                order_no: 'ORD2026101988',
                pay_status: 'PAID',
                paid_at: '2026-10-26T14:30:00+08:00'
              }
            }
          },
          {
            id: 'ep-order-destroy',
            groupId: 'grp-order-pay',
            method: 'DEL',
            name: '[内部] 强制销毁异常订单',
            path: '/api/v1/internal/orders/{order_no}/destroy',
            description:
              '内部运维与风控专用接口：强制物理清理风控拦截或死锁测试订单，严禁对外公开。',
            checkedForShare: false,
            isInternal: true,
            status: '开发中',
            pathParams: [
              {
                name: 'order_no',
                type: 'string',
                required: true,
                description: '需强制销毁的异常订单号',
                example: 'ORD_ABNORMAL_001'
              }
            ],
            queryParams: [
              {
                name: 'reason',
                type: 'string',
                required: true,
                description: '销毁原因审计备注',
                example: 'risk_control_block'
              }
            ],
            headerParams: [
              {
                name: 'X-Internal-Secret',
                type: 'string',
                required: true,
                description: '内网网关签名密钥',
                example: 'sec_internal_99812'
              }
            ],
            responseSchema: [
              {
                name: 'code',
                type: 'integer',
                required: true,
                description: '状态码，0 代表成功'
              },
              {
                name: 'message',
                type: 'string',
                description: '操作结果说明'
              }
            ],
            responseExample: {
              code: 0,
              message: 'order destroyed permanently'
            }
          }
        ]
      }
    ]
  },
  {
    id: 'proj-payment-gateway',
    name: '开放平台商户支付网关',
    description: '供外部合作商户接入的统一下单与退款标准接口',
    icon: 'credit-card',
    iconBgClass: 'bg-emerald-50',
    iconTextClass: 'text-emerald-600',
    badgeText: '内部私有',
    badgeClass: 'bg-slate-100 text-slate-500',
    endpointCount: 14,
    memberCount: 3,
    version: 'v2.0.1',
    baseUrl: 'https://pay.open.shop.com',
    envName: '生产网关',
    avatars: [
      { text: '陈', bgClass: 'bg-indigo-500' },
      { text: '张', bgClass: 'bg-purple-500' }
    ],
    groups: [
      {
        id: 'grp-merchant-pay',
        name: '商户统一下单模块',
        endpoints: [
          {
            id: 'ep-unified-order',
            groupId: 'grp-merchant-pay',
            method: 'POST',
            name: '商户统一下单接口',
            path: '/gateway/v2/pay/unifiedorder',
            description: '外部合作商户发起聚合扫码、H5 或小程序统一下单请求。',
            checkedForShare: true,
            status: '已发布',
            pathParams: [],
            queryParams: [],
            headerParams: [
              {
                name: 'X-Merchant-Id',
                type: 'string',
                required: true,
                description: '开放平台分配的商户号',
                example: 'mch_10092831'
              }
            ],
            responseSchema: [
              {
                name: 'code',
                type: 'integer',
                required: true,
                description: '状态码，0 代表成功'
              },
              {
                name: 'message',
                type: 'string',
                description: '网关提示信息'
              },
              {
                name: 'data',
                type: 'object',
                description: '预支付交易会话标识',
                children: [
                  {
                    name: 'prepay_id',
                    type: 'string',
                    description: '预支付会话 ID'
                  },
                  {
                    name: 'pay_url',
                    type: 'string',
                    description: '收银台跳转或二维码链接'
                  }
                ]
              }
            ],
            responseExample: {
              code: 0,
              message: 'success',
              data: {
                prepay_id: 'wx26150452991823',
                pay_url: 'https://pay.open.shop.com/cashier/wx26150452991823'
              }
            }
          }
        ]
      }
    ]
  }
]

const defaultMembers: TeamMember[] = [
  {
    id: 'mem-1',
    name: 'Alex Chen (创建者)',
    avatarText: '陈',
    avatarBg: 'bg-indigo-600',
    roleLabel: '创建者',
    permission: '管理员',
    email: 'alex.chen@company.com'
  },
  {
    id: 'mem-2',
    name: '林俊杰 (后端开发)',
    avatarText: '林',
    avatarBg: 'bg-emerald-600',
    roleLabel: '后端开发',
    permission: '读写共建',
    email: 'jj.lin@company.com'
  }
]

const state = reactive({
  currentScene: 'projects' as SceneType,
  projects: defaultProjects as ProjectItem[],
  activeProjectId: 'proj-ecommerce',
  activeWorkspaceEndpointId: 'ep-user-profile',
  activePublicEndpointId: 'ep-user-profile',
  members: defaultMembers as TeamMember[],
  activeModal: null as null | 'modal-share' | 'modal-invite' | 'modal-new-project',
  shareConfig: {
    id: 'cbd8474d-4d1d-473b-8953-065e521a9e1a',
    projectId: 'proj-ecommerce',
    title: '核心电商交易系统 API 对外联调文档',
    accessType: 'password',
    password: '8829',
    shareUrl: 'https://s.apiflow.cn/cbd8474d-4d1d-473b-8953-065e521a9e1a',
    selectedEndpointIds: ['ep-user-profile', 'ep-user-login', 'ep-order-create', 'ep-pay-status'],
    createdAt: '2026-10-26 15:00'
  } as ShareConfig,
  toastMessage: '' as string
})

let toastTimer: ReturnType<typeof setTimeout> | null = null

export function useAppStore() {
  const activeProject = computed<ProjectItem>(() => {
    return (
      state.projects.find((p) => p.id === state.activeProjectId) || state.projects[0]
    )
  })

  const allEndpointsInActiveProject = computed<ApiEndpoint[]>(() => {
    return activeProject.value.groups.flatMap((g) => g.endpoints)
  })

  const activeWorkspaceEndpoint = computed<ApiEndpoint>(() => {
    return (
      allEndpointsInActiveProject.value.find(
        (e) => e.id === state.activeWorkspaceEndpointId
      ) || allEndpointsInActiveProject.value[0]
    )
  })

  const checkedEndpointsInActiveProject = computed<ApiEndpoint[]>(() => {
    return allEndpointsInActiveProject.value.filter((e) => e.checkedForShare)
  })

  const checkedGroupsInActiveProject = computed<EndpointGroup[]>(() => {
    return activeProject.value.groups
      .map((g) => ({
        ...g,
        endpoints: g.endpoints.filter((e) => e.checkedForShare)
      }))
      .filter((g) => g.endpoints.length > 0)
  })

  const activePublicEndpoint = computed<ApiEndpoint>(() => {
    const sharedList = checkedEndpointsInActiveProject.value
    return (
      sharedList.find((e) => e.id === state.activePublicEndpointId) ||
      sharedList[0] ||
      allEndpointsInActiveProject.value[0]
    )
  })

  function showToast(msg: string) {
    state.toastMessage = msg
    if (toastTimer) clearTimeout(toastTimer)
    toastTimer = setTimeout(() => {
      state.toastMessage = ''
    }, 2400)
  }

  function switchScene(scene: SceneType) {
    state.currentScene = scene
  }

  function openProjectWorkspace(projectId: string) {
    state.activeProjectId = projectId
    const proj = state.projects.find((p) => p.id === projectId)
    if (proj && proj.groups.length > 0 && proj.groups[0].endpoints.length > 0) {
      const firstEp = proj.groups[0].endpoints[0].id
      state.activeWorkspaceEndpointId = firstEp
      state.activePublicEndpointId = firstEp
    }
    state.currentScene = 'workspace'
  }

  function openModal(modalId: 'modal-share' | 'modal-invite' | 'modal-new-project') {
    state.activeModal = modalId
  }

  function closeModal() {
    state.activeModal = null
  }

  function toggleGroupCheck(group: EndpointGroup, checked: boolean) {
    group.endpoints.forEach((ep) => {
      ep.checkedForShare = checked
    })
  }

  function isGroupAllChecked(group: EndpointGroup): boolean {
    return group.endpoints.length > 0 && group.endpoints.every((ep) => ep.checkedForShare)
  }

  async function createNewProject(name: string, description: string) {
    const trimmedName = name.trim() || 'AI 智能客服微服务接口'
    const trimmedDesc =
      description.trim() || '提供多轮会话问答、知识库检索与工单流转标准接口'

    const newProj: ProjectItem = {
      id: 'proj-' + Date.now(),
      name: trimmedName,
      description: trimmedDesc,
      icon: 'shopping-bag',
      iconBgClass: 'bg-indigo-50',
      iconTextClass: 'text-indigo-600',
      badgeText: '刚刚创建',
      badgeClass: 'bg-indigo-50 text-indigo-600',
      endpointCount: 4,
      memberCount: 1,
      version: 'v1.0.0',
      baseUrl: 'https://api.shop.com',
      envName: '正式环境',
      avatars: [{ text: '陈', bgClass: 'bg-indigo-500' }],
      groups: JSON.parse(JSON.stringify(defaultProjects[0].groups))
    }

    try {
      await fetch('/api/v1/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmedName, description: trimmedDesc })
      })
    } catch {
      // Ignore network error if running standalone Vite dev server
    }

    state.projects.push(newProj)
    state.activeProjectId = newProj.id
    state.activeWorkspaceEndpointId = newProj.groups[0].endpoints[0].id
    state.activePublicEndpointId = newProj.groups[0].endpoints[0].id
    closeModal()
    switchScene('workspace')
    showToast(`已创建项目「${trimmedName}」`)
  }

  async function inviteMember(email: string, permission: '管理员' | '读写共建' | '只读访客') {
    if (email.trim()) {
      const prefix = email.trim().split('@')[0]
      const initial = prefix.slice(0, 1).toUpperCase()
      state.members.push({
        id: 'mem-' + Date.now(),
        name: `${prefix} (协作者)`,
        avatarText: initial,
        avatarBg: 'bg-amber-500',
        roleLabel: '协作者',
        permission,
        email: email.trim()
      })
      activeProject.value.memberCount += 1
      try {
        await fetch('/api/v1/members/invite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), permission })
        })
      } catch {
        // Standalone fallback
      }
      showToast(`已向 ${email.trim()} 发送共建邀请`)
    } else {
      showToast('邀请已发送')
    }
    closeModal()
  }

  async function saveEndpointChanges(pathValue: string) {
    if (activeWorkspaceEndpoint.value) {
      activeWorkspaceEndpoint.value.path = pathValue
      try {
        await fetch(`/api/v1/endpoints/${activeWorkspaceEndpoint.value.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            path: pathValue,
            name: activeWorkspaceEndpoint.value.name
          })
        })
      } catch {
        // Standalone fallback
      }
      showToast('接口定义已保存并实时同步至分享文档')
    }
  }

  async function loadFromBackend() {
    try {
      const res = await fetch('/api/v1/bootstrap')
      if (res.ok) {
        const data = await res.json()
        if (data?.projects?.length) {
          state.projects = data.projects
        }
      }
    } catch {
      // Uses built-in prototype state when running pure frontend
    }
  }

  return {
    state,
    activeProject,
    allEndpointsInActiveProject,
    activeWorkspaceEndpoint,
    checkedEndpointsInActiveProject,
    checkedGroupsInActiveProject,
    activePublicEndpoint,
    showToast,
    switchScene,
    openProjectWorkspace,
    openModal,
    closeModal,
    toggleGroupCheck,
    isGroupAllChecked,
    createNewProject,
    inviteMember,
    saveEndpointChanges,
    loadFromBackend
  }
}
