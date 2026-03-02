## ADDED Requirements

### Requirement: Gateway Adapter 新增渠道管理方法

`GatewayAdapter` 接口 SHALL 新增以下方法，用于渠道管理操作：

- `channelsLogout(channel: string, accountId?: string): Promise<{ cleared: boolean }>` — 登出指定渠道账户
- `webLoginStart(force?: boolean): Promise<{ qrDataUrl?: string; message: string }>` — 启动 WhatsApp QR 扫码配对
- `webLoginWait(): Promise<{ connected: boolean; message: string }>` — 等待 QR 扫码配对结果

#### Scenario: WsAdapter 调用 channels.logout RPC

- **WHEN** 调用 `channelsLogout("whatsapp", "wa-001")`
- **THEN** WsAdapter 发送 RPC `channels.logout` 参数 `{ channel: "whatsapp", accountId: "wa-001" }`
- **THEN** 返回 `{ cleared: true }` 或抛出错误

#### Scenario: MockAdapter channelsLogout 返回成功

- **WHEN** 在 Mock 模式下调用 `channelsLogout("telegram", "bot1")`
- **THEN** 返回 `{ cleared: true }`

#### Scenario: WsAdapter webLoginStart 发起 QR 配对

- **WHEN** 调用 `webLoginStart(true)`
- **THEN** WsAdapter 发送 RPC `web.login.start` 参数 `{ force: true }`
- **THEN** 返回包含 `qrDataUrl`（data URL 格式的 QR 图片）的对象

#### Scenario: MockAdapter webLoginStart 返回模拟 QR

- **WHEN** 在 Mock 模式下调用 `webLoginStart()`
- **THEN** 返回 `{ qrDataUrl: "data:image/png;base64,...", message: "Scan QR code" }`

### Requirement: Gateway Adapter 新增技能管理方法

`GatewayAdapter` 接口 SHALL 新增以下方法：

- `skillsInstall(name: string, installId: string): Promise<{ ok: boolean; message: string }>` — 安装技能
- `skillsUpdate(skillKey: string, patch: { enabled?: boolean; apiKey?: string; env?: Record<string, string> }): Promise<{ ok: boolean }>` — 更新技能配置

#### Scenario: WsAdapter 调用 skills.install RPC

- **WHEN** 调用 `skillsInstall("playwright", "brew")`
- **THEN** WsAdapter 发送 RPC `skills.install` 参数 `{ name: "playwright", installId: "brew" }`
- **THEN** 返回 `{ ok: true, message: "Installed successfully" }` 或 `{ ok: false, message: "..." }`

#### Scenario: WsAdapter 调用 skills.update RPC

- **WHEN** 调用 `skillsUpdate("web-search", { enabled: false })`
- **THEN** WsAdapter 发送 RPC `skills.update` 参数 `{ skillKey: "web-search", enabled: false }`
- **THEN** 返回 `{ ok: true }`

#### Scenario: MockAdapter skillsInstall 模拟成功

- **WHEN** 在 Mock 模式下调用 `skillsInstall("image-gen", "node")`
- **THEN** 返回 `{ ok: true, message: "Mock install completed" }`

### Requirement: ChannelInfo 类型扩展以对齐 Gateway 真实返回

`adapter-types.ts` 中的 `ChannelInfo` 类型 SHALL 扩展以下字段以对齐 Gateway `ChannelAccountSnapshot`：

```
interface ChannelInfo {
  id: string;
  type: ChannelType;
  name: string;
  status: ChannelStatus;
  accountId?: string;
  error?: string;
  // 新增字段
  configured?: boolean;
  linked?: boolean;
  running?: boolean;
  lastConnectedAt?: number | null;
  lastMessageAt?: number | null;
  reconnectAttempts?: number;
  mode?: string;
}
```

`ws-adapter.ts` 中的 `channelsStatus()` SHALL 将 Gateway 返回的 `ChannelsStatusResult`（含 `channelAccounts` 嵌套结构）展平为 `ChannelInfo[]` 数组。

#### Scenario: WsAdapter 正确映射 channels.status 返回

- **WHEN** Gateway 返回 `{ channelAccounts: { telegram: [{ accountId: "bot1", connected: true, name: "MyBot" }] } }`
- **THEN** `channelsStatus()` 返回 `[{ id: "telegram:bot1", type: "telegram", name: "MyBot", status: "connected", accountId: "bot1", configured: true, linked: true, running: true }]`

#### Scenario: 无账户的渠道不生成 ChannelInfo

- **WHEN** Gateway 返回 `{ channelAccounts: { signal: [] } }`
- **THEN** `channelsStatus()` 结果中不包含 signal 类型的条目

### Requirement: SkillInfo 类型扩展以对齐 Gateway SkillStatusEntry

`SkillInfo` 类型 SHALL 扩展以下字段：

```
interface SkillInfo {
  // 已有字段保持不变
  id: string; slug: string; name: string; description: string;
  enabled: boolean; icon: string; version: string;
  author?: string; isCore?: boolean; isBundled?: boolean;
  config?: Record<string, unknown>;
  // 新增字段
  source?: string;
  homepage?: string;
  primaryEnv?: string;
  always?: boolean;
  eligible?: boolean;
  blockedByAllowlist?: boolean;
  requirements?: { bins?: string[]; env?: string[] };
  missing?: { bins?: string[]; env?: string[] };
  installOptions?: Array<{ id: string; kind: string; label: string }>;
  configChecks?: Array<{ path: string; satisfied: boolean }>;
}
```

#### Scenario: WsAdapter 映射 SkillStatusEntry 为 SkillInfo

- **WHEN** Gateway 返回 `SkillStatusEntry` 含 `{ skillKey: "web-search", name: "Web Search", disabled: false, bundled: true, emoji: "🔍", source: "core", install: [...], configChecks: [...] }`
- **THEN** `skillsStatus()` 返回 `SkillInfo` 含 `{ id: "web-search", slug: "web-search", enabled: true, isBundled: true, icon: "🔍", source: "core", installOptions: [...], configChecks: [...] }`

### Requirement: CronTask 类型对齐 Gateway CronJob

`CronTask` 类型 SHALL 重构以对齐 Gateway 真实 `CronJob` 结构：

```
interface CronTask {
  id: string;
  name: string;
  description?: string;
  schedule: CronSchedule;
  enabled: boolean;
  createdAtMs: number;
  updatedAtMs: number;
  agentId?: string;
  sessionKey?: string;
  sessionTarget: "main" | "isolated";
  wakeMode: "next-heartbeat" | "now";
  payload: CronPayload;
  delivery?: CronDelivery;
  state: CronJobState;
}
```

其中 `CronPayload`、`CronDelivery`、`CronJobState` SHALL 与 Gateway 类型一致。

`CronTaskInput` SHALL 同步重构以匹配 `CronJobCreate` 格式。

#### Scenario: WsAdapter 映射 cron.list 返回

- **WHEN** Gateway `cron.list` 返回 `{ jobs: [...], total: 5, hasMore: false }`
- **THEN** `cronList()` 返回 `CronTask[]` 数组（取 `jobs` 字段）

#### Scenario: CronTask.state 包含运行时信息

- **WHEN** 某 CronJob 含 `state: { nextRunAtMs: 1740000000000, lastRunAtMs: 1739990000000, lastRunStatus: "ok" }`
- **THEN** 映射后的 CronTask.state 保留这些字段

### Requirement: UsageInfo 类型对齐 Gateway UsageSummary

`UsageInfo` 类型 SHALL 重构为：

```
interface UsageInfo {
  updatedAt: number;
  providers: Array<{
    provider: string;
    displayName: string;
    plan?: string;
    windows: Array<{ label: string; usedPercent: number; resetAt?: number }>;
    error?: string;
  }>;
}
```

#### Scenario: WsAdapter 映射 usage.status 返回

- **WHEN** Gateway 返回 `{ updatedAt: 1740000000, providers: [{ provider: "anthropic", displayName: "Anthropic", windows: [{ label: "daily", usedPercent: 45 }] }] }`
- **THEN** `usageStatus()` 返回同构的 `UsageInfo` 对象

### Requirement: MockAdapter 完善 Phase C Mock 数据

MockAdapter SHALL 为所有新增方法提供合理的模拟数据：

- `channelsStatus()` 返回至少 4 种不同类型/状态的渠道，含 1 个 error 状态
- `skillsStatus()` 返回至少 6 个技能（含 3 个 core bundled + 2 个 marketplace + 1 个 disabled）
- `cronList()` 返回至少 3 个任务（含 1 个 enabled + 1 个 disabled + 1 个有 lastRunStatus: "error"）
- `usageStatus()` 返回至少 2 个 provider 的用量数据
- `skillsInstall()` / `skillsUpdate()` / `channelsLogout()` / `webLoginStart()` / `webLoginWait()` 返回模拟成功响应

#### Scenario: Mock 模式下 Dashboard 可获取完整数据

- **WHEN** DashboardPage 挂载时调用 `refresh()`
- **THEN** 获取到 channels（4 条）、skills（6 条）、usage（2 个 provider）的模拟数据

#### Scenario: Mock 模式下 webLoginStart 返回 QR 数据

- **WHEN** 调用 `webLoginStart()`
- **THEN** 返回含 `qrDataUrl`（合法的 data URL）和 `message` 的对象
