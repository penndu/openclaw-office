## Context

OpenClaw Office 当前是一个单页面应用——`App.tsx` 直接渲染 `AppShell` + `OfficeView`（2D/3D 切换），没有路由系统。所有状态集中在 `office-store.ts`（约 426 行），通过 `ws-client.ts` 直连 Gateway WebSocket。

ClawX（Electron 桌面版）已具备完整的多页面工作台：使用 `react-router-dom` 做路由，`MainLayout`（TitleBar + Sidebar + Outlet）做布局，Sidebar 导航含 Chat/Cron/Skills/Channels/Dashboard/Settings 六项，所有 Gateway 通信走 `window.electron.ipcRenderer.invoke('gateway:rpc', method, params)` 的 IPC 桥接。

本次 Phase A 需要在 OpenClaw Office（Web 端）建立同等的路由与布局框架，但必须：

1. 不依赖 Electron IPC——使用 Adapter 模式封装通信层
2. 保持 Office 办公室视图（2D/3D）作为默认主页
3. 在 TopBar 添加「控制台」菜单作为管控页面的入口
4. 不破坏现有的 Agent 监控、WebSocket 连接、3D 渲染等功能

## Goals / Non-Goals

**Goals:**

- 建立 React Router 路由系统，Office 为 `/` 路由，管控页面各有独立路由
- 在 TopBar 新增「控制台」下拉菜单，提供到 Dashboard/Channels/Skills/Cron/Settings 的导航
- 设计 Gateway Adapter 接口层，定义与 OpenClaw Gateway 同名的方法签名
- 实现 Mock Adapter Provider，使前端无需 Gateway 即可独立运行和演示
- 创建各管控页面的 Zustand Store 骨架（接口定义 + 初始 actions）
- 创建各管控页面的占位组件（标题 + 空态）
- 建立 Domain Mapping 工具，统一 ViewModel 转换模式

**Non-Goals:**

- 不实现管控页面的完整业务逻辑（Phase B/C 范围）
- 不实现 Chat Dock 对话功能（Phase B 范围）
- 不复刻 ClawX 的 Sidebar 左侧导航栏（OpenClaw Office 采用 TopBar 菜单模式，保持 Office 主屏的全屏沉浸感）
- 不引入 Setup 向导
- 不引入 i18n 国际化（保持中文，后续按需添加）
- 不引入 shadcn/ui 组件库（保持现有 Tailwind 手写组件风格一致）

## Decisions

### D1: 路由方案——React Router v7 + HashRouter

**选择：** 使用 `react-router-dom` v7 的 `HashRouter`（hash 模式）。

**理由：**

- Office 是纯前端 SPA，无服务端渲染，HashRouter 不需要 Web Server 配置 fallback
- 与 ClawX 使用的 `BrowserRouter` 不同，但 Web 端 HashRouter 更适合静态部署
- 路由定义复用 ClawX 的路径结构：`/`（Office）、`/dashboard`、`/channels`、`/skills`、`/cron`、`/settings`

**替代方案：** BrowserRouter——需要 Vite dev server 配置 historyApiFallback，且部署时需 Web Server 支持。考虑到 Office 可能通过 `file://` 或简单 HTTP 服务部署，HashRouter 更通用。

### D2: 布局策略——Office 全屏 vs 管控页面 Content 布局

**选择：** 两种布局模式共存，通过路由区分：

- `/`（Office 路由）：使用现有 `AppShell` 全屏布局（TopBar + 2D/3D + 右侧 Sidebar + ActionBar）
- `/dashboard`、`/channels` 等管控路由：使用新的 `ConsoleLayout` 布局（TopBar + 内容区域，无右侧 Sidebar）

**理由：** Office 视图需要全屏沉浸展示 2D/3D 场景和右侧 Agent 面板，而管控页面是传统表单/列表 UI，不需要 Office 的右侧面板。两种布局各自独立，避免互相干扰。

**实现：** 在 React Router 中使用 layout route：

```
<Route element={<AppShell />}>         → Office 全屏布局
  <Route path="/" element={<OfficeView />} />
</Route>
<Route element={<ConsoleLayout />}>    → 管控页面布局
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/channels" element={<Channels />} />
  ...
</Route>
```

TopBar 在两种布局中复用，但根据当前路由显示不同的上下文信息（Office 模式显示 Agent 指标，Console 模式显示页面标题和面包屑）。

### D3: TopBar「控制台」菜单入口

**选择：** 在 TopBar 右侧区域（连接状态指示灯左侧）添加「控制台」下拉菜单按钮。

**设计：**

- 按钮样式：图标（`LayoutDashboard` from lucide-react）+ "控制台" 文字
- 下拉菜单项：Dashboard、Channels、Skills、Cron、Settings，每项带图标
- 当前路由命中时高亮对应菜单项
- 在 Office 视图时菜单默认收起；在管控页面时，菜单按钮仍可见用于页面间切换
- 管控页面中额外显示「返回 Office」的快捷入口

**理由：** 不采用 ClawX 的左侧 Sidebar 导航，因为：

1. Office 2D/3D 视图需要最大化横向空间，左侧 Sidebar 会压缩场景区域
2. TopBar 菜单是轻量级导航，不遮挡主内容
3. 保持 Office 作为主入口的设计意图——管控页面是"辅助功能"，不与 Office 抢主位

### D4: Gateway Adapter 接口层

**选择：** 定义 `GatewayAdapter` 接口，包含按领域分组的方法签名，提供 `MockAdapter` 和 `WsAdapter` 两种实现。

**接口设计（按领域分组）：**

```typescript
interface GatewayAdapter {
  // 连接管理
  connect(): Promise<void>;
  disconnect(): void;
  onEvent(handler: (event: string, payload: unknown) => void): () => void;

  // Chat
  chatHistory(sessionKey?: string): Promise<ChatMessage[]>;
  chatSend(params: ChatSendParams): Promise<void>;
  chatAbort(runId: string): Promise<void>;

  // Sessions
  sessionsList(): Promise<SessionInfo[]>;
  sessionsPreview(sessionKey: string): Promise<SessionPreview>;

  // Channels
  channelsStatus(): Promise<ChannelInfo[]>;

  // Skills
  skillsStatus(): Promise<SkillInfo[]>;

  // Cron
  cronList(): Promise<CronTask[]>;
  cronAdd(task: CronTaskInput): Promise<CronTask>;
  cronUpdate(id: string, patch: Partial<CronTaskInput>): Promise<CronTask>;
  cronRemove(id: string): Promise<void>;
  cronRun(id: string): Promise<void>;

  // Agents & Tools (已有能力)
  agentsList(): Promise<AgentsListResponse>;
  toolsCatalog(): Promise<ToolCatalog>;
  usageStatus(): Promise<UsageInfo>;
}
```

**理由：**

- 方法名与 Gateway `server-methods-list.ts` 保持一一对应，后续切换为真实 Gateway 时无缝替换
- MockAdapter 返回静态/随机数据，支持离线开发
- WsAdapter 复用现有 `rpc-client.ts` 的 `callRpc` 方法
- 接口集中定义在 `src/gateway/adapter.ts`，实现分别在 `src/gateway/mock-adapter.ts` 和 `src/gateway/ws-adapter.ts`

**Provider 选择：** 通过 `VITE_MOCK=true` 环境变量控制。在 `src/gateway/adapter-provider.ts` 中根据环境变量导出相应实现。

### D5: Store 架构——按领域拆分，保持 office-store 不变

**选择：** 新增独立的 Store 文件，不修改 `office-store.ts` 的核心逻辑。

**Store 列表：**
| Store 文件 | 职责 | 依赖 Adapter 方法 |
|-----------|------|-----------------|
| `console-stores/dashboard-store.ts` | 系统概览状态 | `channelsStatus`, `skillsStatus`, `usageStatus` |
| `console-stores/channels-store.ts` | 渠道管理状态 | `channelsStatus` |
| `console-stores/skills-store.ts` | 技能管理状态 | `skillsStatus` |
| `console-stores/cron-store.ts` | 定时任务状态 | `cronList`, `cronAdd`, `cronUpdate`, `cronRemove`, `cronRun` |
| `console-stores/settings-store.ts` | 应用设置状态 | 本地持久化为主 |
| `console-stores/chat-dock-store.ts` | 底部对话状态（Phase B 填充） | `chatHistory`, `chatSend`, `chatAbort` |

**理由：**

- `office-store` 已经 426 行，继续堆积会超出 500 行限制
- 各管控页面职责独立，不需要共享同一个 store
- Store 统一放在 `src/store/console-stores/` 子目录下，避免与 `office-store.ts` 混杂

### D6: Domain Mapping 层

**选择：** 在 `src/lib/view-models.ts` 中定义 ViewModel 类型和转换函数。

**原则：**

- Gateway payload（如 `channelsStatus` 返回值）→ UI ViewModel（如 `ChannelCardVM`）的纯函数转换
- 组件只消费 ViewModel，不直接使用 Gateway payload
- ViewModel 类型放在 `src/lib/view-models.ts`，转换函数放在同文件
- Phase A 先定义类型骨架，Phase C 实际填充转换逻辑

### D7: 管控页面占位组件

**选择：** 在 `src/components/pages/` 目录下为每个管控页面创建骨架组件。

**组件结构统一为：**

- 页面标题（h1）
- 简要功能描述
- 空态提示（"即将上线 / 等待 Gateway 连接"）
- 预留 store 绑定入口

**目录结构：**

```
src/components/pages/
├── DashboardPage.tsx
├── ChannelsPage.tsx
├── SkillsPage.tsx
├── CronPage.tsx
└── SettingsPage.tsx
```

## Risks / Trade-offs

**[R1] 路由引入可能影响现有 URL 分享/书签** → Office 是 `/#/`（HashRouter），管控页面是 `/#/dashboard` 等。对现有用户无影响（之前没有路由），但后续如需改回 BrowserRouter 需要迁移。

**[R2] 两种布局模式的 TopBar 状态切换复杂度** → TopBar 需要根据当前路由切换显示内容。使用 `useLocation` 判断当前是否在 Office 路由，条件渲染不同的上下文区域。复杂度可控。

**[R3] Mock Adapter 数据与真实 Gateway 响应格式不一致** → 确保 Mock Adapter 返回的数据结构严格匹配 Gateway 方法的返回类型。在 Adapter 接口层定义 TypeScript 类型约束，编译期捕获不一致。

**[R4] 新增依赖 react-router-dom 增加 bundle 体积** → react-router-dom v7 tree-shaking 良好，仅引入使用的 API（HashRouter、Route、Link、useNavigate、useLocation）。预估增加 ~15KB gzip，可接受。

**[R5] 管控页面与 Office 切换时 3D 场景重新加载** → 路由切换会 unmount OfficeView 组件。3D 场景（React Three Fiber）重新挂载需要重建 WebGL 上下文。解决方案：在 AppShell 中使用 `display: none` 隐藏而非 unmount，或在后续优化中引入场景缓存。Phase A 先接受重载成本，Phase B 再优化。
