## Context

Phase A 已建立 `GatewayAdapter` 抽象层（mock / ws 双实现）、Console Stores 骨架、路由系统和 `ConsoleLayout`。Phase B 完成了 Chat Dock 嵌入 Office 视图。四个管控页面（Dashboard / Channels / Skills / Cron）均为占位组件，store 仅有基础 fetch action。

当前系统已具备：
- `adapter-types.ts`：基础类型（ChannelInfo、SkillInfo、CronTask 等），但与 Gateway 真实返回格式存在差距
- `adapter.ts`：GatewayAdapter 接口，仅含 `channelsStatus`、`skillsStatus`、`cronList/Add/Update/Remove/Run`
- `view-models.ts`：基础 ViewModel 映射（ChannelCardVM、SkillCardVM、CronTaskCardVM）
- `console.json`：仅含标题/描述/占位文案

Gateway 真实 API 已确认可用：`channels.status`（返回 `ChannelsStatusResult`，含 `channelAccounts`、`channelOrder`、`channelLabels` 等富结构）、`skills.status`（返回 `SkillStatusReport`，含 `SkillStatusEntry` 完整字段）、`cron.list`（返回分页 `CronListPageResult`，含 `CronJob` 完整状态机）、`usage.status`（返回 `UsageSummary`，含按 provider 分组的用量窗口）。

## Goals / Non-Goals

**Goals:**
- 四个管控页面达到"功能完整、数据真实、交互可用"的生产级水平
- 在 Mock 模式下可完整演示所有功能流程（无 Gateway 也能跑通）
- 连接真实 Gateway 后可无缝切换，UI 行为一致
- 所有用户可见文本走 i18n（中英双语同步）
- 代码单文件不超过 500 行，组件可测试

**Non-Goals:**
- 不实现 Settings 页面（属于 Phase D）
- 不实现真实的渠道 OAuth/Token 配置写入（仅 UI + Adapter 调用）
- 不实现 skill 二进制安装进度条（仅触发安装 + 结果反馈）
- 不做 SSE / 长轮询降级（保持 WebSocket 唯一通道）

## Decisions

### D1: Gateway 类型对齐策略——Domain Mapping 层适配

**决策**: 保留前端简化类型（`ChannelInfo`、`SkillInfo` 等）作为 UI 层契约，在 Adapter 实现层将 Gateway 真实 payload 映射为前端类型。

**理由**: Gateway 返回的 `ChannelsStatusResult` 嵌套层次深（channelAccounts 是按渠道 ID 分组的账户快照数组），直接暴露给 UI 层会导致组件承担复杂数据解析。保持 Adapter 返回简化类型，让 `ws-adapter.ts` 承担映射责任。

**替代方案**: 将 Gateway 原始类型直接透传给 store / 组件。问题：组件逻辑膨胀，测试复杂度高。

### D2: 渠道配置弹窗——动态表单方案

**决策**: 为每种渠道类型定义配置字段 schema（`ChannelConfigSchema`），配置弹窗组件根据 schema 动态生成表单字段。

**理由**: 当前已知 11 种渠道类型，每种的配置字段不同（Telegram 需要 bot token，Discord 需要 bot token + app ID，WhatsApp 需要 QR 扫码，Signal 需要手机号 + CLI 路径等）。静态方案需要 11 个配置组件，维护成本高。

**具体方案**: 
- 定义 `ChannelFieldDef` 类型：`{ key, label, type: "text"|"secret"|"select"|"qr", required, placeholder, validate? }`
- 在 `src/lib/channel-schemas.ts` 中为每种渠道维护字段数组
- 通用 `ChannelConfigDialog` 组件遍历字段数组渲染表单

### D3: Skills 双 Tab 架构

**决策**: Installed Tab 展示 `skills.status` 返回的所有技能；Marketplace Tab 展示非 bundled 的可用技能（从 skills.status 结果中筛选 `bundled === false` 的条目 + 展示安装选项）。

**理由**: Gateway `skills.status` 已统一返回所有技能（含 bundled + managed + marketplace），无需额外 marketplace API。前端通过 `source` 字段区分来源即可。

**替代方案**: 调用独立的 marketplace API。问题：Gateway 无此接口。

### D3.1: Skills Marketplace 参考 ClawX 的“发现页”而非“安装列表”

**决策**: Skills 页面继续保留 Installed / Marketplace 双 Tab，但 Marketplace 视图不再直接复用已安装卡片，而是参考 `ClawX/src/pages/Skills/index.tsx` 改为独立的“市场发现页”布局：

- 顶部安全提示卡
- 市场搜索框与搜索按钮
- 市场结果卡片（独立于已安装卡片样式）
- 卡片内展示安装状态、安装按钮/安装中状态、已安装识别

**理由**: 当前 Office 版 Marketplace 只是把 `!isBundled` 技能复用 Installed 卡片渲染，缺少 ClawX 中“发现、辨识、安装”的心智模型，导致市场区视觉和交互都偏弱，用户很难理解哪些是本地已安装技能、哪些是可安装能力、哪些动作会改变系统状态。

**实现边界**:
- 当前 Web/Gateway 仅有 `skills.status`、`skills.install`、`skills.update`
- **不实现** ClawX Electron IPC 专属能力：`clawhub:search`、`clawhub:uninstall`、打开本地 skills 文件夹
- **采用降级方案**：基于 `skills.status` 中 `!isBundled` 的条目构造“市场候选列表”，支持本地搜索、已安装识别、安装方式选择和安装态展示

### D3.2: Skills 详情弹窗参考 ClawX 的 Info / Config 分区

**决策**: 详情弹窗继续使用 Web 端现有 `dialog` 方案，但结构上参考 ClawX：

- 顶部展示 icon / 名称 / 来源动作
- 中部拆成更清晰的 Info 与 Config 两个逻辑区
- Config 区支持 API Key 与 env 编辑，保存后强制刷新列表
- 底部展示启用状态与开关，保持 core skill 禁用保护

**理由**: 现有详情弹窗已具备基础信息与保存能力，但信息层级不够清楚，与 ClawX 的操作心智不一致。按照 ClawX 的区块划分重构后，技能“了解信息”和“修改配置”两个任务会更清晰。

### D4: Cron 表达式编辑——预设 + 自定义混合

**决策**: 提供 6 个常用预设（每小时 / 每天早 9 点 / 每天晚 6 点 / 每周一 / 每月 1 号 / 每 30 分钟），同时支持自定义 5 位 cron 表达式输入。

**理由**: 多数用户使用常见周期，预设降低门槛；高级用户可切换到自定义输入。

### D4.1: Cron 提交 payload 严格对齐 OpenClaw 父仓协议

**决策**: Cron 表单提交时不再使用简化的 `{ kind: "message" }` 结构。新建消息型任务统一映射为 `{ kind: "agentTurn", message } + sessionTarget: "isolated"`；编辑已有 main-session 任务时保留 `{ kind: "systemEvent", text } + sessionTarget: "main"`。

**理由**: 父仓 `../src/cron/types.ts` 与 `../src/gateway/protocol/schema/cron.ts` 已明确要求 `agentTurn` 只能配合 `isolated`、`systemEvent` 只能配合 `main`。此前 Office 前端的简化 payload 在真实 Gateway 下会导致 `cron.add` / `cron.update` 被校验拒绝，无法完成真实验收。

### D5: 页面数据刷新策略

**决策**: 页面挂载时自动 fetch，提供手动刷新按钮。Cron 页额外监听 Gateway `cron` 事件做实时状态更新。

**理由**: Dashboard/Channels/Skills 数据变化频率低，挂载时单次 fetch + 手动刷新即可。Cron 任务有"正在执行"的实时状态（`runningAtMs`），需要事件驱动更新。

**替代方案**: 所有页面轮询。问题：增加 Gateway 负载，且 WS 事件已可用。

### D6: 通用 UI 组件集

**决策**: 新增 `src/components/console/shared/` 目录，放置 StatusBadge、EmptyState、LoadingState、ErrorState、ConfirmDialog 五个基础组件。

**理由**: 四个页面均需统一的加载/错误/空态展示和状态标识，抽取通用组件避免重复。

### D7: 文件组织——按页面分目录

**决策**: 页面子组件放在 `src/components/console/<page>/` 目录下（如 `console/dashboard/`、`console/channels/`），页面入口文件保持在 `src/components/pages/` 不变。

**理由**: 每个页面预计 3-8 个子组件，放在页面级目录下便于定位和维护。

## Risks / Trade-offs

**[风险] channels.status 真实返回结构复杂** → 在 `ws-adapter.ts` 中实现 `ChannelsStatusResult → ChannelInfo[]` 映射函数，含 accountId 展平和状态推断逻辑。添加单元测试覆盖各种账户状态组合。

**[风险] SkillStatusEntry 字段与 SkillInfo 差异大** → 扩展 `SkillInfo` 类型新增 `requirements`、`missing`、`installOptions`、`configChecks` 等字段。映射逻辑在 adapter 层完成。

**[风险] CronJob 类型与 CronTask 不对齐** → 全面对齐 CronTask 类型至 Gateway `CronJob` 结构（`schedule` 改为 `CronSchedule` 联合类型、`state` 替代零散的 lastRun/nextRun、新增 `payload`/`delivery`）。这是 **BREAKING** 变更，需同步更新 mock-adapter 和 view-models。

**[风险] 大量 i18n key 新增可能中英不同步** → 每个页面实现完成后立即运行对比脚本检查 zh/en key 一致性。

**[风险] 文件数量多（~25 个新增文件）** → 严格按 spec 分批实现，每个 spec 对应一个可独立测试的功能单元。按 adapter-phase-c → console-shared-ui → dashboard → channels → skills → cron 的顺序实施，确保依赖逐层解锁。
