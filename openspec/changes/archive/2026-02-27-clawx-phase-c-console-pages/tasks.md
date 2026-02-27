## 1. 类型对齐与 Gateway Adapter 扩展

- [x] 1.1 扩展 `src/gateway/adapter-types.ts`：更新 `ChannelInfo` 接口，新增 `configured`、`linked`、`running`、`lastConnectedAt`、`lastMessageAt`、`reconnectAttempts`、`mode` 字段
- [x] 1.2 扩展 `src/gateway/adapter-types.ts`：更新 `SkillInfo` 接口，新增 `source`、`homepage`、`primaryEnv`、`always`、`eligible`、`blockedByAllowlist`、`requirements`、`missing`、`installOptions`、`configChecks` 字段
- [x] 1.3 重构 `src/gateway/adapter-types.ts`：`CronTask` 对齐 Gateway `CronJob` 结构——`schedule` 强制为 `CronSchedule` 联合类型、新增 `createdAtMs`/`updatedAtMs`（替代 `createdAt`/`updatedAt` 字符串）、新增 `description`、`agentId`、`sessionKey`、`sessionTarget`、`wakeMode`、`payload`（`CronPayload` 联合类型）、`delivery`（`CronDelivery`）、`state`（`CronJobState`），删除旧 `message`/`target`/`lastRun`/`nextRun` 字段
- [x] 1.4 重构 `src/gateway/adapter-types.ts`：`CronTaskInput` 对齐 Gateway `CronJobCreate` 格式（`name`、`schedule: CronSchedule`、`sessionTarget`、`wakeMode`、`payload: CronPayload`、可选 `description`/`enabled`/`delivery`/`agentId`/`sessionKey`）
- [x] 1.5 重构 `src/gateway/adapter-types.ts`：`UsageInfo` 对齐 Gateway `UsageSummary`（`updatedAt`、`providers` 数组含 `provider`/`displayName`/`plan`/`windows`/`error`）
- [x] 1.6 扩展 `src/gateway/adapter.ts`：新增 `channelsLogout(channel: string, accountId?: string)` 方法签名
- [x] 1.7 扩展 `src/gateway/adapter.ts`：新增 `webLoginStart(force?: boolean)` 和 `webLoginWait()` 方法签名
- [x] 1.8 扩展 `src/gateway/adapter.ts`：新增 `skillsInstall(name: string, installId: string)` 和 `skillsUpdate(skillKey: string, patch)` 方法签名
- [x] 1.9 实现 `src/gateway/ws-adapter.ts`：`channelsStatus()` 映射 Gateway `ChannelsStatusResult`（展平 `channelAccounts` 嵌套结构为 `ChannelInfo[]`）
- [x] 1.10 实现 `src/gateway/ws-adapter.ts`：`skillsStatus()` 映射 Gateway `SkillStatusEntry[]` 为 `SkillInfo[]`（`disabled` → `enabled` 反转、`skillKey` → `id`/`slug`、`emoji` → `icon`、`install` → `installOptions`）
- [x] 1.11 实现 `src/gateway/ws-adapter.ts`：`cronList()` 映射 Gateway `CronListPageResult`（取 `jobs` 字段）
- [x] 1.12 实现 `src/gateway/ws-adapter.ts`：`usageStatus()` 映射 Gateway `UsageSummary`
- [x] 1.13 实现 `src/gateway/ws-adapter.ts`：`channelsLogout()`、`webLoginStart()`、`webLoginWait()`、`skillsInstall()`、`skillsUpdate()` 五个新 RPC 方法
- [x] 1.14 更新 `src/gateway/mock-adapter.ts`：`channelsStatus()` 返回至少 4 种类型/状态的渠道（含 1 个 error），使用扩展后的 `ChannelInfo` 字段
- [x] 1.15 更新 `src/gateway/mock-adapter.ts`：`skillsStatus()` 返回至少 6 个技能（3 core bundled + 2 marketplace + 1 disabled），使用扩展后的 `SkillInfo` 字段
- [x] 1.16 更新 `src/gateway/mock-adapter.ts`：`cronList()` 返回至少 3 个任务（使用对齐后的 `CronTask` 结构，含 enabled/disabled/error 三种状态）
- [x] 1.17 更新 `src/gateway/mock-adapter.ts`：`usageStatus()` 返回对齐后的 `UsageInfo` 结构（至少 2 个 provider）
- [x] 1.18 实现 `src/gateway/mock-adapter.ts`：`channelsLogout()`、`webLoginStart()`、`webLoginWait()`、`skillsInstall()`、`skillsUpdate()` Mock 实现
- [x] 1.19 更新 `src/lib/view-models.ts`：`toCronTaskCardVM()` 适配新 `CronTask` 结构（`state.lastRunAtMs` / `state.nextRunAtMs` / `state.lastRunStatus`）
- [x] 1.20 编写 `src/gateway/__tests__/adapter-phase-c.test.ts`：MockAdapter 新方法返回值验证 + WsAdapter RPC 方法名映射验证

## 2. 通用 UI 组件

- [x] 2.1 创建 `src/components/console/shared/StatusBadge.tsx`：接受 `status` prop，渲染状态圆点 + i18n 翻译标签，预定义 connected/disconnected/connecting/error/active/paused/ok/failed 等状态颜色映射
- [x] 2.2 创建 `src/components/console/shared/EmptyState.tsx`：接受 `icon`/`title`/`description?`/`action?` prop，渲染居中空态布局
- [x] 2.3 创建 `src/components/console/shared/LoadingState.tsx`：接受 `message?` prop，渲染居中 loading spinner + 可选文字
- [x] 2.4 创建 `src/components/console/shared/ErrorState.tsx`：接受 `message`/`onRetry?` prop，渲染红色错误提示 + 可选重试按钮
- [x] 2.5 创建 `src/components/console/shared/ConfirmDialog.tsx`：接受 `open`/`title`/`description`/`confirmLabel`/`onConfirm`/`onCancel`/`variant?` prop，danger variant 确认按钮为红色，支持 ESC 关闭
- [x] 2.6 更新 `src/i18n/locales/zh/common.json`：新增 `status` 组（connected/disconnected/connecting/error/active/paused/ok/failed/running/pending/disabled）和 `actions` 组（confirm/cancel/retry/save/delete/close/refresh/create/edit）
- [x] 2.7 更新 `src/i18n/locales/en/common.json`：同步新增上述翻译 key

## 3. Dashboard 页面

- [x] 3.1 扩展 `src/store/console-stores/dashboard-store.ts`：新增 `usage: UsageInfo | null` 状态字段，`refresh()` 并行获取 channels + skills + usage（usage 失败不阻塞其他数据）
- [x] 3.2 创建 `src/components/console/dashboard/StatCard.tsx`：统计卡片组件——图标 + 标题（i18n）+ 数值 + 可选进度条
- [x] 3.3 创建 `src/components/console/dashboard/AlertBanner.tsx`：告警条组件——variant（warning/error）+ 图标 + 文字 + 可选操作链接
- [x] 3.4 创建 `src/components/console/dashboard/QuickNavGrid.tsx`：快捷导航网格——4 列网格卡片，每卡片含图标 + 标题 + 描述，点击使用 `useNavigate` 跳转
- [x] 3.5 创建 `src/components/console/dashboard/ChannelOverview.tsx`：已连接渠道概览——水平排列渠道图标 + 名称 + StatusBadge，空态显示提示
- [x] 3.6 创建 `src/components/console/dashboard/SkillOverview.tsx`：活跃技能概览——水平排列技能图标 + 名称，空态显示提示
- [x] 3.7 重写 `src/components/pages/DashboardPage.tsx`：集成以上子组件，挂载时调用 refresh()，实现 loading/error/normal 三态切换
- [x] 3.8 更新 `src/i18n/locales/zh/console.json`：新增 dashboard 区域翻译 key（statCards、alertBanner、quickNav、channelOverview、skillOverview）
- [x] 3.9 更新 `src/i18n/locales/en/console.json`：同步新增 dashboard 翻译 key

## 4. Channels 页面

- [x] 4.1 扩展 `src/store/console-stores/channels-store.ts`：新增 `selectedChannel`、`configDialogOpen`、`configDialogChannelType`、`qrState`、`qrDataUrl` 状态字段和 `logoutChannel()`、`openConfigDialog()`、`closeConfigDialog()`、`startQrPairing()`、`cancelQrPairing()` actions
- [x] 4.2 创建 `src/lib/channel-schemas.ts`：定义 `ChannelFieldDef` 类型和 `CHANNEL_SCHEMAS` 映射表（至少覆盖 Telegram、Discord、WhatsApp、Signal、飞书、iMessage、Matrix、LINE、MS Teams、Google Chat、Mattermost 共 11 种渠道的配置字段）
- [x] 4.3 创建 `src/components/console/channels/ChannelStatsBar.tsx`：统计条组件——总数 / 已连接（绿色）/ 错误（红色）
- [x] 4.4 创建 `src/components/console/channels/ChannelCard.tsx`：渠道卡片组件——图标 + 名称 + 类型 + StatusBadge + 最后连接时间 + 登出按钮，状态不同边框颜色不同
- [x] 4.5 创建 `src/components/console/channels/AvailableChannelGrid.tsx`：可用渠道类型网格——所有支持的渠道类型 + 已配置标识 + 点击打开配置弹窗
- [x] 4.6 创建 `src/components/console/channels/ChannelConfigDialog.tsx`：动态配置弹窗——根据 `CHANNEL_SCHEMAS` 渲染表单字段（text/secret/select/textarea）、密文显隐切换、required 验证、保存/取消按钮
- [x] 4.7 创建 `src/components/console/channels/WhatsAppQrFlow.tsx`：QR 配对组件——idle/loading/qr/scanning/success/error/cancel 七状态 UI，展示 QR 码图片、等待动画、结果反馈
- [x] 4.8 重写 `src/components/pages/ChannelsPage.tsx`：集成以上子组件，挂载时 fetchChannels()，实现 loading/error/normal 三态，渠道列表 + 可用网格 + 配置弹窗 + QR 流程
- [x] 4.9 更新 `src/i18n/locales/zh/console.json`：新增 channels 区域翻译 key（statsBar、channelCard、availableGrid、configDialog、qrFlow、各渠道类型名称和字段标签）
- [x] 4.10 更新 `src/i18n/locales/en/console.json`：同步新增 channels 翻译 key

## 5. Skills 页面

- [x] 5.1 扩展 `src/store/console-stores/skills-store.ts`：新增 `activeTab`、`sourceFilter`、`selectedSkill`、`detailDialogOpen`、`installing` 状态字段和 `setTab()`、`setSourceFilter()`、`openDetail()`、`closeDetail()`、`toggleSkill()`、`installSkill()` actions
- [x] 5.2 创建 `src/components/console/skills/SkillCard.tsx`：技能卡片组件——图标 + 名称 + 描述（截断 2 行）+ 来源标签 + 版本 + 启用开关 + 操作菜单。core skill 开关 disabled + tooltip。missing 依赖黄色警告
- [x] 5.3 创建 `src/components/console/skills/SkillDetailDialog.tsx`：详情/配置弹窗——左侧 info 面板（名称/描述/版本/作者/来源/主页/依赖状态）+ 右侧 config 面板（API Key secret 输入 + env key-value 编辑 + configChecks 展示 + 保存按钮）
- [x] 5.4 创建 `src/components/console/skills/InstallOptionsDialog.tsx`：安装方式选择弹窗——列出多个 installOption（kind + label），用户选择后触发安装
- [x] 5.5 创建 `src/components/console/skills/SkillTabBar.tsx`：Tab 切换组件（Installed / Marketplace）+ 来源筛选下拉（All / Built-in / Marketplace）
- [x] 5.6 重写 `src/components/pages/SkillsPage.tsx`：集成以上子组件，挂载时 fetchSkills()，实现 loading/error/normal 三态，双 Tab + 筛选 + 卡片网格 + 详情弹窗 + 安装流程
- [x] 5.7 更新 `src/i18n/locales/zh/console.json`：新增 skills 区域翻译 key（tabs、sourceFilter、skillCard、detailDialog、installDialog、core 保护提示）
- [x] 5.8 更新 `src/i18n/locales/en/console.json`：同步新增 skills 翻译 key
- [x] 5.9 参考 `ClawX/src/pages/Skills/index.tsx` 重构 Skills 页面：Installed 与 Marketplace 两个 Tab 的布局职责分离，Marketplace 改为独立发现视图（安全提示卡 + 搜索区 + 独立结果卡片）
- [x] 5.10 新增 `src/components/console/skills/MarketplaceSkillCard.tsx`：参考 ClawX 市场卡片实现安装按钮 / 已安装态 / 安装中态 / 作者与版本信息展示
- [x] 5.11 更新 `src/components/console/skills/SkillCard.tsx`：参考 ClawX 已安装卡片布局，补齐排序、来源标识、core/marketplace 语义和操作区结构
- [x] 5.12 更新 `src/components/console/skills/SkillDetailDialog.tsx`：参考 ClawX 详情弹窗的 Info / Config 分区、底部状态栏与保存后刷新交互
- [x] 5.13 更新 `src/store/console-stores/skills-store.ts`：补充 Marketplace 本地搜索、已安装识别、安装态与排序所需的派生逻辑
- [x] 5.14 更新 `src/i18n/locales/zh/console.json`：补充 Skills 页面参考 ClawX 后新增的市场提示、搜索态、空态、按钮与详情分区翻译
- [x] 5.15 更新 `src/i18n/locales/en/console.json`：同步新增上述翻译 key

## 6. Cron 页面

- [x] 6.1 扩展 `src/store/console-stores/cron-store.ts`：新增 `dialogOpen`、`editingTask` 状态字段和 `openDialog()`、`closeDialog()`、`handleCronEvent()`、`initEventListeners()` actions。`addTask()`/`updateTask()` 参数类型同步对齐新 `CronTaskInput`
- [x] 6.2 创建 `src/components/console/cron/CronStatsBar.tsx`：统计条组件——总数 / 活跃（绿色）/ 已暂停（灰色）/ 失败（红色）
- [x] 6.3 创建 `src/components/console/cron/CronTaskCard.tsx`：任务卡片组件——启用开关 + 名称 + 调度描述 + 消息预览 + 投递渠道 + 执行状态行（上次/下次/状态）+ 操作按钮（执行/编辑/删除）
- [x] 6.4 创建 `src/lib/cron-presets.ts`：定义 6 个预设（每小时、每天 9 点、每天 18 点、每周一、每月 1 号、每 30 分钟）含 `label`（i18n key）和 `schedule: CronSchedule`
- [x] 6.5 创建 `src/components/console/cron/CronTaskDialog.tsx`：创建/编辑弹窗——名称 + 描述 + 预设快选 6 按钮 + 自定义 cron 输入 + 人类可读描述展示 + 消息内容 textarea + 投递模式选择 + 渠道/目标选择 + Discord channelId 校验 + 创建/保存/取消
- [x] 6.6 重写 `src/components/pages/CronPage.tsx`：集成以上子组件，挂载时 fetchTasks() + initEventListeners()，实现 loading/error/normal 三态，统计条 + 任务列表 + 创建/编辑弹窗 + 实时事件更新
- [x] 6.7 更新 `src/i18n/locales/zh/console.json`：新增 cron 区域翻译 key（statsBar、taskCard、taskDialog、presets、delivery、validation 提示）
- [x] 6.8 更新 `src/i18n/locales/en/console.json`：同步新增 cron 翻译 key

## 7. ViewModel 映射扩展

- [x] 7.1 在 `src/lib/view-models.ts` 中新增 `DashboardSummaryVM` 类型和 `toDashboardSummaryVM()` 转换函数（connectedChannels、errorChannels、enabledSkills、providerUsage）
- [x] 7.2 更新 `toChannelCardVM()`：适配 ChannelInfo 新增字段（configured、linked、running、lastConnectedAt）
- [x] 7.3 更新 `toSkillCardVM()`：适配 SkillInfo 新增字段（source、installOptions、missing、configChecks）
- [x] 7.4 更新 `toCronTaskCardVM()`：适配 CronTask 新结构（state.lastRunAtMs、state.nextRunAtMs、state.lastRunStatus、payload 提取 message）

## 8. 验收测试

- [x] 8.1 编写 `src/store/__tests__/dashboard-store-phase-c.test.ts`：验证 refresh() 并行加载 channels/skills/usage、部分失败不阻塞、状态更新正确
- [x] 8.2 编写 `src/store/__tests__/channels-store-phase-c.test.ts`：验证 fetchChannels()、logoutChannel()、openConfigDialog()、QR 状态流转
- [x] 8.3 编写 `src/store/__tests__/skills-store-phase-c.test.ts`：验证 fetchSkills()、toggleSkill()、installSkill()、Tab 切换、来源筛选
- [x] 8.4 编写 `src/store/__tests__/cron-store-phase-c.test.ts`：验证 fetchTasks()、addTask()、updateTask()（使用新 CronTaskInput 格式）、handleCronEvent()
- [x] 8.5 执行 `pnpm typecheck` 确认无类型错误（含所有类型重构的兼容性）
- [x] 8.6 执行 `pnpm test` 确认所有测试通过
- [x] 8.7 手动验收——不使用 Mock：按当前实施决策仅连接真实 Gateway，验证页面初次加载 / 刷新 / 重连后的 loading/error/empty 态与 i18n 展示无遗漏
- [x] 8.8 手动验收——真实 Gateway：连接真实 OpenClaw Gateway，验证 Dashboard 数据真实展示、Channels 列表与 Gateway 一致、Skills 列表与 Gateway 一致、Cron 任务创建/编辑/删除/执行正常
- [x] 8.9 手动验收——真实 Gateway：参考 ClawX 逐项验证 Skills 页面（Installed 筛选、Marketplace 搜索与安装态、详情弹窗、核心技能保护）交互与视觉结构
