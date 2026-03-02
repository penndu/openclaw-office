## ADDED Requirements

### Requirement: Dashboard 页面布局与数据加载

DashboardPage SHALL 在挂载时自动调用 `useDashboardStore.refresh()` 获取数据，展示三种状态：

1. **加载中**：显示 `LoadingState` 组件
2. **错误**：显示 `ErrorState` 组件（含重试按钮）
3. **正常**：显示完整的 Dashboard 内容

页面布局 SHALL 采用响应式网格：

- 顶部：告警条（仅在有异常时显示）
- 第一行：4 个统计卡片（渠道连接数、技能启用数、Provider 用量概览、系统运行时间）
- 第二行：快捷导航入口（跳转 Channels / Skills / Cron / Settings）
- 第三行：已连接渠道概览 + 活跃技能概览

#### Scenario: 首次挂载加载数据

- **WHEN** DashboardPage 首次挂载
- **THEN** 显示 LoadingState
- **THEN** 自动调用 `refresh()` 获取 channels、skills、usage 数据
- **THEN** 数据加载完成后显示 Dashboard 内容

#### Scenario: 加载失败显示错误态

- **WHEN** `refresh()` 调用抛出错误
- **THEN** 显示 ErrorState 含错误信息和重试按钮
- **WHEN** 用户点击重试
- **THEN** 重新调用 `refresh()`

### Requirement: 统计卡片展示

Dashboard SHALL 显示以下统计卡片：

1. **渠道连接卡** — 显示"已连接 / 总数"（如 "2 / 3"），绿色已连接数 + 灰色总数
2. **技能启用卡** — 显示"已启用 / 总数"（如 "4 / 6"），启用数 + 总数
3. **Provider 用量卡** — 显示首个 provider 的用量百分比 + 进度条，如"Anthropic: 45%"
4. **运行时间卡** — 显示 Gateway 连接时长（从 WebSocket 连接成功开始计时），格式 "Xh Ym"

每个卡片 SHALL 含标题（i18n）、数值和适当图标。

#### Scenario: 统计卡片正确显示数据

- **WHEN** channels 有 2 个 connected、1 个 disconnected
- **THEN** 渠道连接卡显示 "2 / 3"
- **WHEN** skills 有 4 个 enabled、2 个 disabled
- **THEN** 技能启用卡显示 "4 / 6"

#### Scenario: 无数据时卡片显示零值

- **WHEN** channels 为空数组
- **THEN** 渠道连接卡显示 "0 / 0"

### Requirement: 告警条

Dashboard SHALL 在以下情况显示告警条：

1. **Gateway 未连接** — 橙色告警"Gateway 未连接，数据可能不是最新"
2. **渠道有错误** — 红色告警"N 个渠道连接异常"（N 为 status === "error" 的数量）
3. **无告警** — 不显示告警条

告警条 SHALL 固定在页面顶部，含图标 + 文字 + 可选操作链接。

#### Scenario: Gateway 断开时显示告警

- **WHEN** WebSocket 连接状态为 disconnected
- **THEN** 页面顶部显示橙色告警条 "Gateway 未连接，数据可能不是最新"

#### Scenario: 渠道有错误时显示告警

- **WHEN** 2 个渠道 status 为 "error"
- **THEN** 显示红色告警条 "2 个渠道连接异常"

#### Scenario: 一切正常不显示告警

- **WHEN** Gateway 已连接且无渠道错误
- **THEN** 不显示告警条

### Requirement: 快捷导航入口

Dashboard SHALL 显示导航卡片网格（4 列），每个卡片含图标 + 标题 + 简要描述，点击跳转对应页面。

导航目标：Channels（`/channels`）、Skills（`/skills`）、Cron（`/cron`）、Settings（`/settings`）

#### Scenario: 点击快捷入口跳转

- **WHEN** 用户点击 "Channels" 导航卡
- **THEN** 路由导航到 `/channels`

### Requirement: 已连接渠道与活跃技能概览

Dashboard 底部 SHALL 显示两个概览区域：

1. **已连接渠道** — 水平排列渠道图标 + 名称 + 状态标签（使用 StatusBadge），仅显示 status 为 connected 的渠道。为空时显示"暂无已连接渠道"。
2. **活跃技能** — 水平排列技能图标 + 名称，仅显示 enabled 为 true 的技能。为空时显示"暂无已启用技能"。

#### Scenario: 展示已连接渠道

- **WHEN** 有 2 个 connected 渠道（Telegram、Discord）
- **THEN** 概览区域显示 Telegram 和 Discord 的图标和名称

#### Scenario: 无已连接渠道

- **WHEN** 所有渠道 status 均非 connected
- **THEN** 显示"暂无已连接渠道"空态

### Requirement: Dashboard Store 扩展

`useDashboardStore` SHALL 扩展为：

- 新增 `usage: UsageInfo | null` 状态字段
- `refresh()` SHALL 并行获取 channels、skills、usage 三项数据
- 新增 `connectedCount` / `errorCount` 计算逻辑（可在组件层或 store 层实现）

#### Scenario: refresh 并行加载三项数据

- **WHEN** 调用 `refresh()`
- **THEN** 同时发起 `channelsStatus()`、`skillsStatus()`、`usageStatus()` 请求
- **THEN** 全部完成后更新 store 状态

#### Scenario: 部分请求失败不阻塞

- **WHEN** `usageStatus()` 失败但 channels 和 skills 成功
- **THEN** store 更新 channels 和 skills，usage 保持 null，error 记录 usage 错误
