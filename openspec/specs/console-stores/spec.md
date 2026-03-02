# console-stores Specification

## Purpose

TBD - created by archiving change clawx-phase-a-architecture. Update Purpose after archive.

## Requirements

### Requirement: Dashboard Store 骨架

系统 SHALL 创建 `dashboard-store.ts`，管理 Dashboard 页面的状态。

#### Scenario: Dashboard Store 状态定义

- **WHEN** Dashboard Store 初始化
- **THEN** Store SHALL 包含以下状态字段：`gatewayStatus`（连接状态）、`channelsSummary`（渠道概览数组）、`skillsSummary`（技能概览数组）、`uptime`（运行时间秒数）、`isLoading`（加载状态）、`error`（错误信息）

#### Scenario: Dashboard Store 刷新 action

- **WHEN** 调用 `refresh()` action
- **THEN** Store SHALL 通过 GatewayAdapter 获取 channelsStatus、skillsStatus 和 usageStatus 数据，更新相应状态字段

### Requirement: Channels Store 骨架

系统 SHALL 创建 `channels-store.ts`，管理 Channels 页面的状态。

#### Scenario: Channels Store 状态定义

- **WHEN** Channels Store 初始化
- **THEN** Store SHALL 包含：`channels`（渠道列表数组）、`isLoading`、`error`

#### Scenario: Channels Store fetch action

- **WHEN** 调用 `fetchChannels()` action
- **THEN** Store SHALL 通过 GatewayAdapter 的 `channelsStatus()` 获取数据并更新 `channels`

### Requirement: Skills Store 骨架

系统 SHALL 创建 `skills-store.ts`，管理 Skills 页面的状态。

#### Scenario: Skills Store 状态定义

- **WHEN** Skills Store 初始化
- **THEN** Store SHALL 包含：`skills`（技能列表数组）、`isLoading`、`error`

#### Scenario: Skills Store fetch action

- **WHEN** 调用 `fetchSkills()` action
- **THEN** Store SHALL 通过 GatewayAdapter 的 `skillsStatus()` 获取数据并更新 `skills`

### Requirement: Cron Store 骨架

系统 SHALL 创建 `cron-store.ts`，管理 Cron 页面的状态。

#### Scenario: Cron Store 状态定义

- **WHEN** Cron Store 初始化
- **THEN** Store SHALL 包含：`tasks`（定时任务列表数组）、`isLoading`、`error`

#### Scenario: Cron Store CRUD actions

- **WHEN** Cron Store 初始化
- **THEN** Store SHALL 定义以下 actions 签名：`fetchTasks()`、`addTask(input)`、`updateTask(id, patch)`、`removeTask(id)`、`runTask(id)`

### Requirement: Settings Store 骨架

系统 SHALL 创建 `settings-store.ts`，管理 Settings 页面的状态。

#### Scenario: Settings Store 状态定义

- **WHEN** Settings Store 初始化
- **THEN** Store SHALL 包含：`theme`（主题模式）、`language`（界面语言）；初始值 SHALL 从 localStorage 读取，变更时 SHALL 自动持久化

#### Scenario: Settings Store 主题切换

- **WHEN** 调用 `setTheme(theme)` action
- **THEN** Store SHALL 更新 `theme` 字段并将新值写入 localStorage

### Requirement: Chat Dock Store 骨架

系统 SHALL 创建 `chat-dock-store.ts`，预留底部对话 Dock 的状态管理（Phase B 填充实现）。

#### Scenario: Chat Dock Store 状态定义

- **WHEN** Chat Dock Store 初始化
- **THEN** Store SHALL 包含：`messages`（消息列表数组，初始为空）、`isStreaming`（是否正在流式接收）、`currentSessionKey`（当前会话标识）、`dockExpanded`（Dock 是否展开）

#### Scenario: Chat Dock Store 初始 actions

- **WHEN** Chat Dock Store 初始化
- **THEN** Store SHALL 定义以下 actions 签名（Phase A 仅定义签名，不实现业务逻辑）：`sendMessage(text)`、`abort()`、`toggleDock()`、`switchSession(key)`

### Requirement: Store 文件组织

所有管控页面 Store SHALL 放在 `src/store/console-stores/` 子目录下，与现有 `office-store.ts` 分离。

#### Scenario: Store 目录结构

- **WHEN** Phase A 实施完成
- **THEN** `src/store/console-stores/` 目录下 SHALL 包含：`dashboard-store.ts`、`channels-store.ts`、`skills-store.ts`、`cron-store.ts`、`settings-store.ts`、`chat-dock-store.ts`
