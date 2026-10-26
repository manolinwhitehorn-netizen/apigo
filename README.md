# ApiGo (ApiFlow) - 项目协同与在线文档分享一体化应用

基于 `apigo-demo.html` 原型构建的前后端一体化应用（**Go `embed.FS` + Vue 3 + TypeScript + Vite + Tailwind CSS + Lucide Icons**）。

## 目录结构

```text
apigo/
├── main.go                       # Go 一体化后端入口（内嵌前端静态产物 + API 路由）
├── go.mod                        # Go 模块定义
├── apigo-demo.html               # 原始 HTML 交互原型
└── web/                          # 前端工程目录 (Vue 3 + TypeScript + Vite + Tailwind CSS)
    ├── embed.go                  # Go //go:embed all:dist 静态资源嵌入与 SPA 路由回退封装
    ├── dist/                     # 前端构建产物目录（直接被 Go 编译进单文件二进制）
    └── src/
        ├── App.vue               # 顶层布局与场景/弹窗挂载容器
        ├── types/api.ts          # 核心领域模型 TS 类型定义
        ├── store/useAppStore.ts  # 响应式状态管理与后端接口联动
        ├── components/
        │   ├── TopProtoBar.vue   # 顶部三场景交互切换导航栏
        │   └── modals/           # 分享文档、邀请成员、新建项目 3 个核心弹窗
        └── views/
            ├── ProjectHallView.vue # 场景 1：团队项目大厅（新建项目、成员概览）
            ├── WorkspaceView.vue   # 场景 2：项目工作台（勾选接口批量生成分享文档）
            └── PublicDocView.vue   # 场景 3：仿 s.apifox.cn 在线文档页（含多语言代码与 Try it out 调试）
```

## 快速启动

### 1. 前端独立开发模式（带热更新与 `/api` 代理）

```bash
cd web
npm install
npm run dev
```

### 2. Go 一体化单二进制编译与运行

```bash
# 1. 构建前端静态资源至 web/dist
cd web && npm run build && cd ..

# 2. 直接运行或编译为单个可执行文件
go run .
# 或
go build -o apigo.exe .
./apigo.exe -addr :8080
```
