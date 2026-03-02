# main-layout Specification

## Purpose

TBD - created by archiving change clawx-phase-a-architecture. Update Purpose after archive.

## Requirements

### Requirement: ConsoleLayout 管控页面布局

系统 SHALL 提供 `ConsoleLayout` 布局组件，用于管控页面（Dashboard/Channels/Skills/Cron/Settings）的统一布局。

#### Scenario: ConsoleLayout 结构

- **WHEN** 用户访问任何管控页面路由
- **THEN** `ConsoleLayout` SHALL 渲染以下结构：TopBar（复用现有组件）在顶部，下方为左侧边栏导航 + 右侧内容区域的水平布局

#### Scenario: ConsoleLayout 左侧边栏

- **WHEN** 管控页面渲染
- **THEN** ConsoleLayout SHALL 在左侧渲染固定宽度的侧边栏（`w-52`），包含 Dashboard/Channels/Skills/Cron/Settings 五个导航项，各项带 Lucide 图标，当前活动项高亮显示

#### Scenario: ConsoleLayout 不包含 Office 专属组件

- **WHEN** 管控页面渲染
- **THEN** ConsoleLayout SHALL NOT 包含 Office 的右侧 Sidebar（Agent 面板）、ActionBar（底部操作栏）和 2D/3D 视图

#### Scenario: ConsoleLayout 内容区域样式

- **WHEN** 管控页面内容渲染
- **THEN** 右侧内容区域 SHALL 具有适当的内边距（`p-6`）、最大宽度约束（防止超宽屏内容过于拉伸）和垂直滚动支持

### Requirement: TopBar 双模式适配

系统 SHALL 使 TopBar 根据当前路由上下文显示不同内容。

#### Scenario: Office 模式下 TopBar

- **WHEN** 当前路由为 `/`（Office 视图）
- **THEN** TopBar SHALL 显示：应用标题 "OpenClaw Office"、2D/3D 视图切换、主题切换、Agent 活跃指标（活跃/总数、Tokens）、「控制台」菜单、连接状态

#### Scenario: Console 模式下 TopBar

- **WHEN** 当前路由为管控页面（`/dashboard`、`/channels` 等）
- **THEN** TopBar SHALL 显示：左侧为当前页面标题、右侧为「← Office」返回按钮和连接状态。SHALL NOT 显示 2D/3D 切换、Agent 指标和下拉菜单（子功能导航已移至 ConsoleLayout 左侧边栏）

### Requirement: 管控页面骨架组件

系统 SHALL 为每个管控页面提供占位骨架组件，确保路由可访问。

#### Scenario: Dashboard 骨架页面

- **WHEN** 用户导航到 `/dashboard`
- **THEN** 系统 SHALL 渲染 Dashboard 骨架页面，包含页面标题 "Dashboard"、功能描述文本和空态提示

#### Scenario: Channels 骨架页面

- **WHEN** 用户导航到 `/channels`
- **THEN** 系统 SHALL 渲染 Channels 骨架页面，包含页面标题 "Channels"、功能描述文本和空态提示

#### Scenario: Skills 骨架页面

- **WHEN** 用户导航到 `/skills`
- **THEN** 系统 SHALL 渲染 Skills 骨架页面，包含页面标题 "Skills"、功能描述文本和空态提示

#### Scenario: Cron 骨架页面

- **WHEN** 用户导航到 `/cron`
- **THEN** 系统 SHALL 渲染 Cron 骨架页面，包含页面标题 "Cron Tasks"、功能描述文本和空态提示

#### Scenario: Settings 骨架页面

- **WHEN** 用户导航到 `/settings`
- **THEN** 系统 SHALL 渲染 Settings 骨架页面，包含页面标题 "Settings"、功能描述文本和空态提示
