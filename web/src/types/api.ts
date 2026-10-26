export type SceneType = 'projects' | 'workspace' | 'public-doc'

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DEL' | 'PATCH'

export interface TeamMember {
  id: string
  name: string
  avatarText: string
  avatarBg: string
  roleLabel: string
  permission: '管理员' | '读写共建' | '只读访客'
  email?: string
}

export interface ApiParam {
  name: string
  type: string
  required: boolean
  description: string
  example?: string
  defaultValue?: string
}

export interface SchemaField {
  name: string
  type: string
  required?: boolean
  description: string
  children?: SchemaField[]
}

export interface ApiEndpoint {
  id: string
  groupId: string
  method: HttpMethod
  name: string
  path: string
  description: string
  checkedForShare: boolean
  isInternal?: boolean
  status: '已发布' | '开发中' | '已废弃'
  pathParams: ApiParam[]
  queryParams: ApiParam[]
  headerParams: ApiParam[]
  responseSchema: SchemaField[]
  responseExample: Record<string, any>
}

export interface EndpointGroup {
  id: string
  name: string
  endpoints: ApiEndpoint[]
}

export interface ProjectItem {
  id: string
  name: string
  description: string
  icon: 'shopping-bag' | 'credit-card' | 'cpu' | 'globe' | 'layers'
  iconBgClass: string
  iconTextClass: string
  badgeText: string
  badgeClass: string
  endpointCount: number
  memberCount: number
  version: string
  baseUrl: string
  envName: string
  avatars: { text: string; bgClass: string }[]
  groups: EndpointGroup[]
}

export interface ShareConfig {
  id: string
  projectId: string
  title: string
  accessType: 'public' | 'password' | 'team'
  password: string
  shareUrl: string
  selectedEndpointIds: string[]
  createdAt: string
}
