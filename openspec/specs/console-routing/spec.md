# console-routing Specification

## Purpose

TBD - created by archiving change clawx-phase-a-architecture. Update Purpose after archive.

## Requirements

### Requirement: React Router 路由系统

系统 SHALL 使用 `react-router-dom` 的 `HashRouter` 建立前端路由系统，支持 Office（主页）与管控页面的 URL 路由切换。

#### Scenario: 应用启动时加载 Office 主页

- **WHEN** 用户首次打开应用（URL 为 `/#/` 或无 hash）
- **THEN** 系统 SHALL 渲染 Office 视图（2D/3D 办公室），路由路径为 `/`

#### Scenario: 通过 URL 直接访问管控页面

- **WHEN** 用户通过 URL hash 直接访问 `/#/dashboard`、`/#/channels`、`/#/skills`、`/#/cron` 或 `/#/settings`
- **THEN** 系统 SHALL 渲染对应的管控页面组件

#### Scenario: 访问不存在的路由

- **WHEN** 用户访问未定义的路由路径
- **THEN** 系统 SHALL 自动重定向到 Office 主页（`/`）

### Requirement: 路由定义结构

系统 SHALL 定义以下路由层级，使用 layout route 区分 Office 布局与管控页面布局。

#### Scenario: Office 路由使用 AppShell 布局

- **WHEN** 当前路由为 `/`
- **THEN** 系统 SHALL 使用现有 `AppShell` 组件作为布局容器，渲染 `OfficeView`（含 TopBar、右侧 Sidebar、ActionBar）

#### Scenario: 管控页面路由使用 ConsoleLayout 布局

- **WHEN** 当前路由为 `/dashboard`、`/channels`、`/skills`、`/cron` 或 `/settings`
- **THEN** 系统 SHALL 使用 `ConsoleLayout` 组件作为布局容器，渲染 TopBar + 内容区域（无 Office 右侧 Sidebar）

### Requirement: TopBar「控制台」导航按钮

系统 SHALL 在 TopBar 组件中提供「控制台」直达按钮，作为进入管控页面的入口。

#### Scenario: Office 页面中的控制台按钮

- **WHEN** 当前路由为 `/`（Office 视图）
- **THEN** TopBar SHALL 在右侧区域（连接状态指示灯左侧）显示一个「控制台」按钮，使用 `LayoutDashboard` 图标
- **AND** 点击按钮 SHALL 直接导航到 `/dashboard`（控制台默认页面），不弹出下拉菜单

#### Scenario: 控制台页面中的返回 Office 按钮

- **WHEN** 当前路由为管控页面（`/dashboard`、`/channels` 等）
- **THEN** TopBar 右侧 SHALL 将「控制台」按钮替换为「← Office」返回按钮，点击 SHALL 导航到 `/`

### Requirement: ConsoleLayout 左侧边栏导航

控制台页面 SHALL 使用左侧边栏导航来切换子功能页面，而非 TopBar 下拉菜单。

#### Scenario: 左侧边栏导航项

- **WHEN** 用户进入任何管控页面
- **THEN** ConsoleLayout SHALL 在左侧展示固定宽度的侧边栏（宽度 `w-52`），包含以下导航项（每项带图标）：
  - Dashboard（`Home` 图标）
  - Channels（`Radio` 图标）
  - Skills（`Puzzle` 图标）
  - Cron Tasks（`Clock` 图标）
  - Settings（`Settings` 图标）

#### Scenario: 侧边栏导航项高亮

- **WHEN** 当前路由匹配某个管控页面路径
- **THEN** 对应的侧边栏导航项 SHALL 显示为高亮/选中状态（蓝色背景 + 蓝色文字）

#### Scenario: 侧边栏导航项切换

- **WHEN** 用户点击侧边栏中的某个导航项
- **THEN** 系统 SHALL 导航到对应的管控页面路由，右侧内容区 SHALL 更新为对应页面组件

### Requirement: 导航不中断 Gateway 连接

路由切换 SHALL NOT 中断现有的 WebSocket Gateway 连接。

#### Scenario: 从 Office 切换到管控页面

- **WHEN** 用户从 Office 视图导航到 Dashboard 页面
- **THEN** WebSocket 连接 SHALL 保持不变，连接状态 SHALL 不发生重连

#### Scenario: 从管控页面返回 Office

- **WHEN** 用户从管控页面返回 Office 视图
- **THEN** Office 视图 SHALL 正常渲染，Agent 状态 SHALL 保持路由切换前的状态
