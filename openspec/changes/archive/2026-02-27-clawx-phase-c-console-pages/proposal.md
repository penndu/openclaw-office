## Why

Phase A（架构底座）和 Phase B（Chat Dock）已完成并归档，四个管控页面（Dashboard / Channels / Skills / Cron）目前仍为"Coming Soon"占位组件。按照 `docs/ClawX-界面复刻实施规划.md` Phase C 的要求，需要将这四个页面从占位升级为**完整可用**的管控界面，实现对 OpenClaw Gateway 核心资源的可视化管理能力。

当前阻塞项：用户无法在 Web 端查看 Gateway 运行状态、管理渠道连接、操作技能启停与配置、以及创建/管理定时任务——这些都是日常运维的基本需求。

## What Changes

**Dashboard 页面**

- 新增 Gateway 状态卡、渠道汇总卡、技能汇总卡、用量概览卡、运行时间卡
- 新增快捷导航入口（跳转 Channels / Skills / Cron / Settings）
- 新增"非运行态"告警提示条
- 接入 `channels.status`、`skills.status`、`usage.status` 三个 RPC 数据源

**Channels 页面**

- 新增渠道统计条（总数 / 已连接 / 错误）
- 新增已配置渠道列表（卡片展示 + 状态标识 + 登出/删除操作）
- 新增可用渠道类型网格（点击进入配置流程）
- 新增渠道配置弹窗（动态表单字段、密文显隐切换、表单验证）
- 新增 WhatsApp QR 配对流程 UI（qr → scanning → success / error / cancel 状态机）
- 扩展 Gateway Adapter 接口：新增 `channelsLogout()`、`webLoginStart()`、`webLoginWait()`

**Skills 页面**

- 新增 Installed / Marketplace 双 Tab 视图
- 新增技能卡片组件（启用/禁用开关、安装/卸载按钮、配置入口）
- 新增技能详情/配置弹窗（info 面板 + apiKey/env 配置表单 + 依赖状态展示）
- 新增来源筛选（built-in / marketplace / all）
- 实现 core skill 禁用保护（内置核心技能不可禁用或卸载）
- 扩展 Gateway Adapter 接口：新增 `skillsInstall()`、`skillsUpdate()`
- 参考 `ClawX/src/pages/Skills/index.tsx` 重构 Marketplace 视图：独立的市场发现区、安全提示、搜索框、已安装识别、安装态与更贴近 ClawX 的卡片布局
- 对齐 ClawX 的技能配置交互：详情弹窗拆分 Info / Config 语义、配置保存后刷新列表、强化来源与依赖信息展示
- 明确当前 Web/Gateway 约束：不引入 ClawX 的 Electron IPC 专属能力（如 `clawhub:search`、`clawhub:uninstall`、打开本地技能目录），但在当前 Gateway 能力范围内最大化复刻其界面结构与交互风格

**Cron 页面**

- 新增任务统计条（总数 / 活跃 / 暂停 / 失败）
- 新增任务列表（卡片展示 + 启停开关 + 编辑/删除/立即执行按钮）
- 新增创建/编辑弹窗（预设 cron 快选 + 自定义 cron 表达式 + 消息内容 + 投递渠道选择）
- 新增任务运行历史面板
- 处理 Gateway `cron` 实时事件更新任务状态

**横向基础设施**

- 扩展 `adapter-types.ts`：对齐 Gateway 真实返回类型（`ChannelsStatusResult`、`SkillStatusEntry`、`CronJob`、`UsageSummary`）
- 扩展 `GatewayAdapter` 接口与 Mock/WS 双实现
- 扩展 `view-models.ts`：新增 DashboardCardVM 等 ViewModel 映射
- 补充 `console.json` 中英文翻译 key（所有新增文案走 i18n）
- 构建通用 UI 基础组件：StatusBadge、EmptyState、LoadingState、ErrorState、ConfirmDialog

## Capabilities

### New Capabilities

- `dashboard-page`: Dashboard 完整界面——状态卡、汇总统计、快捷入口、告警条
- `channels-page`: Channels 完整界面——渠道列表、可用渠道网格、配置弹窗、WhatsApp QR 流程
- `skills-page`: Skills 完整界面——双 Tab 视图、技能卡片、详情/配置弹窗、来源筛选、core 保护
- `skills-page`: Skills 页面进一步参考 ClawX —— 已安装视图与市场视图职责分离，市场页采用发现式布局与独立安装交互
- `cron-page`: Cron 完整界面——任务列表、统计条、创建/编辑弹窗、运行历史
- `console-shared-ui`: 管控页面通用 UI 组件——StatusBadge、EmptyState、LoadingState、ErrorState、ConfirmDialog
- `adapter-phase-c`: Gateway Adapter 扩展——新增 channels/skills 管理方法、类型对齐、Mock 实现

### Modified Capabilities

（无已有 spec 需要修改，Phase A/B 的 spec 已归档且本次不改变其接口契约）

## Impact

**新增/修改文件预估**

- `src/gateway/adapter-types.ts` — 扩展类型定义，对齐 Gateway 真实 payload
- `src/gateway/adapter.ts` — 新增 6+ 方法签名
- `src/gateway/mock-adapter.ts` — 新增方法 Mock 实现 + 丰富 Mock 数据
- `src/gateway/ws-adapter.ts` — 新增方法 RPC 调用
- `src/store/console-stores/*.ts` — 扩展 4 个 store 的 state 和 actions
- `src/lib/view-models.ts` — 新增 Dashboard / 扩展 Channel/Skill/Cron ViewModel 映射
- `src/components/pages/*.tsx` — 4 个页面重写为完整功能
- `src/components/console/*.tsx` — 新增 ~15 个管控页面专用子组件
- `src/components/shared/*.tsx` — 新增 ~5 个通用 UI 组件
- `src/i18n/locales/{zh,en}/console.json` — 大幅扩展翻译 key

**依赖变更**

- 无新增 npm 依赖（复用现有 Tailwind + Lucide 图标库 + react-router-dom）

**风险点**

- `adapter-types.ts` 类型扩展需确保向后兼容，Mock → Gateway 切换无缝
- channels.status 真实返回格式与当前简化的 `ChannelInfo` 差异较大，需 domain mapping 层适配
- 大量新增翻译 key 需中英同步维护
