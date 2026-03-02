## Why

OpenClaw Office 当前是单页面应用，仅有 2D/3D 办公室视图和右侧监控面板。但 ClawX（Electron 桌面版）已具备完整的多页面工作台能力——Dashboard、Channels、Skills、Cron、Settings 等控制台页面，以及底部 Chat 对话能力。为了让 Office 从"只读监控"升级为"可视化 + 可操作的管控工作台"，需要引入路由系统、全局布局框架、Gateway Adapter 抽象层和新的 Store 骨架，作为后续各功能页面实现的架构底座。

此外，当前 TopBar 缺少页面导航入口，用户无法发现和切换到控制台功能页面。Phase A 将在 TopBar 添加「控制台」菜单入口，提供 Dashboard、Channels、Skills、Cron、Settings 的导航能力，同时保持 Office 办公室视图作为主入口不变。

## What Changes

- **引入 React Router**：添加 `react-router-dom` 依赖，建立前端路由系统，支持 Office（主页）和管控页面（Dashboard/Channels/Skills/Cron/Settings）的切换
- **重构全局布局**：新建 `MainLayout` 组件，适配"Office 主屏 + 管控页面"双模式布局；Office 页保持现有 AppShell 全屏结构，管控页面使用 Sidebar + Content 布局
- **TopBar 添加「控制台」菜单**：在现有 TopBar 右侧区域增加「控制台」下拉菜单，提供 Dashboard、Channels、Skills、Cron、Settings 的快捷导航入口
- **建立 Gateway Adapter 接口层**：定义与 OpenClaw Gateway 方法同名的 TypeScript 接口（chat、sessions、channels、skills、cron 等），提供 `mock` 与 `gateway`（WebSocket）两种实现，使前端不依赖 Electron IPC 即可运行
- **建立新增 Zustand Stores 骨架**：创建 `chat-dock-store`、`dashboard-store`、`channels-store-ui`、`skills-store-ui`、`cron-store-ui`、`settings-store-ui` 骨架，定义状态接口和初始 actions
- **建立 Domain Mapping 层**：创建 ViewModel 转换工具，页面组件消费 ViewModel 而非原始 Gateway payload
- **创建管控页面占位组件**：为 Dashboard、Channels、Skills、Cron、Settings 创建骨架页面组件（含标题、空态提示），确保所有路由可访问

## Capabilities

### New Capabilities

- `console-routing`: 前端路由系统与页面导航能力——React Router 集成、路由定义、TopBar「控制台」菜单入口、页面切换与 URL 同步
- `main-layout`: 全局布局框架——Office 全屏模式与管控页面 Sidebar 模式的统一布局切换
- `gateway-adapter`: Gateway 通信适配层——统一 RPC/Event 接口定义，mock 与真实 WebSocket 两种 provider 实现，使前端脱离 Electron 可独立运行
- `console-stores`: 管控页面 Store 骨架——chat-dock、dashboard、channels、skills、cron、settings 各 store 的状态定义与初始 actions
- `domain-mapping`: 领域模型映射层——将 Gateway 原始 payload 转换为 UI ViewModel，页面禁止直接消费原始数据

### Modified Capabilities

- `gateway-connection`: 现有 ws-client 需适配新的 Adapter 接口，将 WebSocket 通信能力包装为 Adapter 的 gateway 实现
- `office-store`: 需增加 `currentPage` 状态字段用于追踪当前活动页面（Office / 管控页面），并与路由状态同步

## Impact

- **新增依赖**：`react-router-dom`
- **文件变更范围**：
  - `src/App.tsx` — 重构为 Router + 路由定义
  - `src/main.tsx` — 包裹 BrowserRouter
  - `src/components/layout/TopBar.tsx` — 添加「控制台」菜单入口
  - `src/components/layout/AppShell.tsx` — 适配路由模式
  - `src/gateway/` — 新增 adapter 接口与 mock provider
  - `src/store/` — 新增多个 store 骨架文件
  - `src/components/pages/` — 新增各管控页面骨架组件
  - `src/lib/` — 新增 domain-mapping 工具
- **不破坏现有功能**：Office 2D/3D 视图、Agent 监控、WebSocket 连接等现有能力保持不变
- **架构红线**：
  - 页面组件内禁止直接访问 `window.electron.ipcRenderer`
  - 不引入 Setup 向导逻辑
  - Office 始终是默认主页（`/` 路由）
