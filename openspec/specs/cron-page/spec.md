# cron-page Specification

## Purpose

TBD - created by archiving change clawx-phase-c-console-pages. Update Purpose after archive.

## Requirements

### Requirement: Cron 页面布局与数据加载

CronPage SHALL 在挂载时自动调用 `useCronStore.fetchTasks()` 获取任务数据，展示三种状态：加载中（LoadingState）、错误（ErrorState + 重试）、正常内容。

页面布局 SHALL 分为：

1. **标题栏** — 页面标题 + "新建任务"按钮 + 刷新按钮
2. **统计条** — 任务总数 / 活跃数 / 已暂停数 / 失败数
3. **任务列表** — 任务卡片列表（按 nextRunAtMs 升序排列）

#### Scenario: 首次挂载加载数据

- **WHEN** CronPage 首次挂载
- **THEN** 自动调用 `fetchTasks()` 并显示 LoadingState

#### Scenario: 空任务列表

- **WHEN** 任务列表为空
- **THEN** 显示 EmptyState "暂无定时任务" + "创建第一个任务" 按钮

### Requirement: 任务统计条

页面 SHALL 在标题下方显示四个统计指标：

1. **总数** — 所有任务数量
2. **活跃** — `enabled === true` 且 `state.lastRunStatus !== "error"` 的数量（绿色）
3. **已暂停** — `enabled === false` 的数量（灰色）
4. **失败** — `state.lastRunStatus === "error"` 的数量（红色，为 0 时不显示红色）

#### Scenario: 统计条正确显示

- **WHEN** 有 5 个任务（3 活跃, 1 暂停, 1 最后一次执行失败）
- **THEN** 统计条显示"总计 5 · 活跃 3 · 已暂停 1 · 失败 1"

### Requirement: 任务卡片组件

每个 CronTask SHALL 以卡片形式展示，包含：

1. **左侧** — 启用/禁用开关
2. **标题行** — 任务名称 + 调度描述标签（如"每天 18:00"）
3. **详情行** — 消息内容预览（截断为 1 行）+ 投递渠道图标/名称
4. **状态行** — 上次执行时间 + 执行状态（ok/error/skipped）+ 下次执行时间
5. **操作按钮** — 立即执行 / 编辑 / 删除

卡片 SHALL 根据状态有视觉区分：

- enabled + lastRunStatus="ok" → 正常色调 + 绿色状态
- enabled + lastRunStatus="error" → 正常色调 + 红色错误标识
- disabled → 半透明灰色

#### Scenario: 渲染活跃任务卡片

- **WHEN** 任务 enabled=true, state.lastRunStatus="ok", schedule 为 "0 18 \* \* \*"
- **THEN** 显示开启开关 + "每天 18:00" 标签 + 绿色"成功"状态

#### Scenario: 渲染失败任务卡片

- **WHEN** 任务 state.lastRunStatus="error", state.lastError="Timeout"
- **THEN** 显示红色错误标识 + "Timeout" 错误信息

#### Scenario: 渲染暂停任务卡片

- **WHEN** 任务 enabled=false
- **THEN** 显示关闭开关 + 半透明灰色卡片

### Requirement: 任务启用/禁用操作

用户切换任务开关时 SHALL 调用 `adapter.cronUpdate(id, { enabled: !current })` 更新任务状态。

#### Scenario: 暂停任务

- **WHEN** 用户关闭活跃任务的开关
- **THEN** 调用 `cronUpdate(id, { enabled: false })`
- **THEN** 成功后卡片变为暂停样式

#### Scenario: 恢复任务

- **WHEN** 用户开启暂停任务的开关
- **THEN** 调用 `cronUpdate(id, { enabled: true })`

### Requirement: 立即执行操作

用户点击"立即执行"按钮后 SHALL：

1. 弹出 ConfirmDialog 确认
2. 调用 `adapter.cronRun(id)`
3. 执行中按钮显示 loading
4. 完成后刷新任务列表（获取最新 state）

#### Scenario: 立即执行任务

- **WHEN** 用户点击"立即执行"并确认
- **THEN** 调用 `cronRun(id)`
- **THEN** 完成后刷新任务列表

### Requirement: 删除任务操作

用户点击"删除"按钮后 SHALL：

1. 弹出 ConfirmDialog（variant="danger"）确认
2. 调用 `adapter.cronRemove(id)`
3. 成功后从列表移除该任务
4. 失败时显示错误提示

#### Scenario: 删除任务

- **WHEN** 用户点击"删除"并确认
- **THEN** 调用 `cronRemove(id)`
- **THEN** 成功后任务从列表消失

### Requirement: 创建/编辑任务弹窗

系统 SHALL 提供 `CronTaskDialog` 弹窗组件，用于创建新任务或编辑现有任务。弹窗包含以下表单区域：

**基本信息：**

- 任务名称（text，required）
- 任务描述（textarea，optional）

**调度配置：**

- 预设快选区（6 个常用周期按钮组）：
  - 每小时（`0 * * * *`）
  - 每天早 9 点（`0 9 * * *`）
  - 每天晚 6 点（`0 18 * * *`）
  - 每周一（`0 9 * * 1`）
  - 每月 1 号（`0 9 1 * *`）
  - 每 30 分钟（kind: "every", everyMs: 1800000）
- 自定义 cron 表达式输入（5 位标准 cron，含格式提示）
- 选中预设时自动填充 cron 表达式，编辑表达式时取消预设选中

**消息内容：**

- 消息文本（textarea，required）— Agent 将收到的指令
- 模型选择（select，optional）— 默认使用 Agent 默认模型

**投递配置：**

- 投递模式（select）：不投递 / 通知 / Webhook
- 渠道选择（select，当模式非"不投递"时显示）— 从已配置渠道中选择
- 目标地址（text，当选择渠道后显示）— 如 Discord channelId、Telegram chatId

**操作按钮：**

- 创建/保存 + 取消

#### Scenario: 创建新任务

- **WHEN** 用户点击"新建任务"打开弹窗
- **THEN** 显示空表单
- **WHEN** 用户填写名称 "每日摘要"、选择"每天晚 6 点"预设、输入消息 "生成今日工作摘要"
- **THEN** cron 表达式自动填充为 "0 18 \* \* \*"
- **WHEN** 用户点击"创建"
- **THEN** 调用 `cronAdd(input)` 并关闭弹窗
- **THEN** 新任务出现在列表中

#### Scenario: 编辑现有任务

- **WHEN** 用户点击任务卡片的"编辑"按钮
- **THEN** 弹窗打开并回填当前任务数据
- **WHEN** 用户修改名称并保存
- **THEN** 调用 `cronUpdate(id, patch)` 并关闭弹窗

#### Scenario: 自定义 cron 表达式

- **WHEN** 用户清除预设选择，手动输入 "30 9 \* \* 1-5"
- **THEN** 预设按钮全部取消选中
- **THEN** 表达式下方显示人类可读描述"周一至周五 9:30"

#### Scenario: 表单验证

- **WHEN** 用户未填写任务名称点击创建
- **THEN** 名称字段显示"必填项"错误，不提交
- **WHEN** 用户输入非法 cron 表达式（如 "abc"）
- **THEN** 表达式字段显示格式错误提示

#### Scenario: Discord channelId 校验

- **WHEN** 投递渠道选择 Discord
- **THEN** 目标地址输入框 placeholder 显示 "Discord Channel ID (数字)"
- **WHEN** 用户输入非纯数字 channelId
- **THEN** 显示格式错误提示"Discord Channel ID 必须为纯数字"

### Requirement: Cron 事件实时更新

系统 SHALL 监听 Gateway `cron` 事件，在 Cron 页面挂载期间实时更新任务状态。

当收到 `cron` 事件时，`useCronStore` SHALL 更新对应 task 的 `state` 字段（nextRunAtMs、lastRunAtMs、lastRunStatus 等）。

#### Scenario: 任务执行完成事件

- **WHEN** 收到 `cron` 事件 `{ jobId: "cron-1", state: { lastRunAtMs: 1740000000, lastRunStatus: "ok" } }`
- **THEN** 列表中 "cron-1" 任务的状态行更新为最新执行时间和成功状态

#### Scenario: 任务执行失败事件

- **WHEN** 收到 `cron` 事件 `{ jobId: "cron-1", state: { lastRunStatus: "error", lastError: "Agent timeout" } }`
- **THEN** 列表中 "cron-1" 任务显示红色错误标识 + "Agent timeout"

### Requirement: Cron Store 扩展

`useCronStore` SHALL 扩展以下状态和 actions：

- 新增 `dialogOpen: boolean` — 创建/编辑弹窗状态
- 新增 `editingTask: CronTask | null` — 当前编辑的任务（null 为创建模式）
- 新增 `openDialog(task?)` / `closeDialog()` — 弹窗控制
- 扩展 `addTask(input)` — 创建成功后关闭弹窗
- 扩展 `updateTask(id, patch)` — 更新成功后关闭弹窗
- 新增 `handleCronEvent(event)` — 处理 Gateway cron 事件更新 state
- 新增 `initEventListeners()` — 注册 cron 事件监听
- `CronTask` 类型对齐后，`addTask` / `updateTask` 的参数类型同步变更

#### Scenario: 打开创建弹窗

- **WHEN** 调用 `openDialog()`（不传参数）
- **THEN** `dialogOpen` 为 true，`editingTask` 为 null

#### Scenario: 打开编辑弹窗

- **WHEN** 调用 `openDialog(existingTask)`
- **THEN** `dialogOpen` 为 true，`editingTask` 为该任务对象
