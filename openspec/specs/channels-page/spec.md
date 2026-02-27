# channels-page Specification

## Purpose
TBD - created by archiving change clawx-phase-c-console-pages. Update Purpose after archive.
## Requirements
### Requirement: Channels 页面布局与数据加载

ChannelsPage SHALL 在挂载时自动调用 `useChannelsStore.fetchChannels()` 获取渠道数据，展示三种状态：加载中（LoadingState）、错误（ErrorState + 重试）、正常内容。

页面布局 SHALL 分为三个区域：
1. **标题栏** — 页面标题 + 手动刷新按钮
2. **统计条** — 渠道总数 / 已连接数 / 错误数
3. **主体内容** — 已配置渠道列表 + 可用渠道网格

#### Scenario: 首次挂载加载数据
- **WHEN** ChannelsPage 首次挂载
- **THEN** 自动调用 `fetchChannels()` 并在加载中显示 LoadingState
- **THEN** 数据加载完成后渲染渠道列表

#### Scenario: 手动刷新
- **WHEN** 用户点击刷新按钮
- **THEN** 重新调用 `fetchChannels()` 并更新列表

### Requirement: 渠道统计条

页面 SHALL 在标题下方显示统计条，包含三个指标：
- **总数**：所有渠道数量
- **已连接**：status 为 "connected" 的数量（绿色）
- **错误**：status 为 "error" 的数量（红色，为 0 时不显示）

#### Scenario: 统计条正确显示
- **WHEN** 有 5 个渠道（3 connected, 1 disconnected, 1 error）
- **THEN** 统计条显示"总计 5 · 已连接 3 · 错误 1"

### Requirement: 已配置渠道列表

页面 SHALL 以卡片列表展示所有已配置的渠道。每个卡片包含：

1. 渠道图标（emoji 或 Lucide 图标）
2. 渠道名称
3. 渠道类型标签
4. 状态标识（StatusBadge）
5. 最后连接时间（有则显示）
6. 操作按钮：登出（channelsLogout）、查看详情

卡片 SHALL 根据状态有视觉区分：
- connected → 左侧绿色边框
- error → 左侧红色边框 + 错误信息展示
- disconnected → 默认灰色边框

#### Scenario: 渲染已连接渠道卡片
- **WHEN** 有一个 Telegram 渠道 status 为 connected
- **THEN** 显示 Telegram 图标 + 名称 + 绿色 StatusBadge + 登出按钮

#### Scenario: 渲染错误渠道卡片
- **WHEN** 有一个 WhatsApp 渠道 status 为 error，error 字段为 "Session expired"
- **THEN** 显示红色边框 + 错误信息 "Session expired" + 重新连接入口

#### Scenario: 空渠道列表
- **WHEN** 无已配置渠道
- **THEN** 显示 EmptyState "暂无已配置渠道" + "添加渠道"按钮

### Requirement: 登出渠道操作

用户点击渠道卡片的"登出"按钮后，系统 SHALL：

1. SHALL 弹出 ConfirmDialog（variant="danger"）确认
2. 确认后调用 `adapter.channelsLogout(channel, accountId)`
3. 成功后刷新渠道列表
4. 失败时在卡片上显示错误提示

#### Scenario: 登出渠道成功
- **WHEN** 用户点击 Telegram 渠道的"登出"按钮并确认
- **THEN** 调用 `channelsLogout("telegram", "bot1")`
- **THEN** 成功后自动刷新渠道列表

#### Scenario: 登出取消
- **WHEN** 用户点击"登出"后在 ConfirmDialog 中取消
- **THEN** 不执行登出操作

### Requirement: 可用渠道类型网格

页面底部 SHALL 展示所有支持的渠道类型（不论是否已配置），以网格卡片形式排列。每个卡片包含：
- 渠道类型图标
- 渠道类型名称
- "已配置" 徽标（如果该类型已有配置）或"添加"按钮

支持的渠道类型 SHALL 至少包含：Telegram、Discord、WhatsApp、Signal、飞书、iMessage、Matrix、LINE、MS Teams、Google Chat、Mattermost。

#### Scenario: 点击未配置渠道
- **WHEN** 用户点击未配置的 "Signal" 网格卡片
- **THEN** 打开 Signal 渠道配置弹窗

#### Scenario: 点击已配置渠道
- **WHEN** 用户点击已配置的 "Telegram" 网格卡片
- **THEN** 打开 Telegram 渠道编辑弹窗（回填已有配置）

### Requirement: 渠道配置弹窗（动态表单）

系统 SHALL 提供 `ChannelConfigDialog` 弹窗组件，根据渠道类型动态渲染配置表单。

每种渠道类型的字段定义存储在 `src/lib/channel-schemas.ts` 中的 `CHANNEL_SCHEMAS` 映射表。

字段类型支持：
- `text` — 普通文本输入
- `secret` — 密码输入，带显隐切换按钮（默认隐藏）
- `select` — 下拉选择
- `textarea` — 多行文本

每个字段 SHALL 含：`key`、`labelKey`（i18n key）、`type`、`required`、`placeholderKey`（i18n key）。

弹窗 SHALL 包含：
- 渠道类型图标 + 标题
- 动态表单字段
- 验证逻辑（required 字段不可为空）
- 保存 / 取消按钮

**注意**: 本期保存操作仅做 UI 层面的表单验证和提交流程展示（调用 adapter 方法），不写入真实系统配置。

#### Scenario: Telegram 渠道配置
- **WHEN** 打开 Telegram 配置弹窗
- **THEN** 显示 Bot Token（secret 类型，required）字段

#### Scenario: Discord 渠道配置
- **WHEN** 打开 Discord 配置弹窗
- **THEN** 显示 Bot Token（secret，required）、Application ID（text，required）字段

#### Scenario: 密文字段显隐切换
- **WHEN** 用户点击 Bot Token 字段的眼睛图标
- **THEN** 切换输入框 type 在 password 和 text 之间

#### Scenario: 表单验证失败
- **WHEN** 用户未填写 required 字段点击保存
- **THEN** 对应字段显示红色错误提示，不提交

### Requirement: WhatsApp QR 配对流程

当渠道类型为 WhatsApp 时，配置弹窗 SHALL 展示 QR 扫码配对流程，状态机包含：

1. **idle** — 初始状态，显示"开始配对"按钮
2. **loading** — 请求 QR 中，显示 loading
3. **qr** — 显示 QR 码图片（来自 `webLoginStart()` 返回的 `qrDataUrl`），提示用户用手机扫码
4. **scanning** — 等待扫码结果（`webLoginWait()` 进行中），显示"等待扫码..."
5. **success** — 配对成功，显示成功提示 + 关闭按钮
6. **error** — 配对失败，显示错误信息 + 重试按钮
7. **cancel** — 用户取消，回到 idle

#### Scenario: WhatsApp QR 配对完整流程
- **WHEN** 用户在 WhatsApp 配置弹窗中点击"开始配对"
- **THEN** 状态变为 loading，调用 `webLoginStart()`
- **THEN** 收到 QR 数据后显示 QR 码图片
- **THEN** 自动调用 `webLoginWait()` 等待扫码
- **WHEN** 扫码成功
- **THEN** 状态变为 success，显示"配对成功"

#### Scenario: QR 配对超时或失败
- **WHEN** `webLoginWait()` 返回 `{ connected: false }`
- **THEN** 状态变为 error，显示"配对失败" + "重试"按钮

#### Scenario: 用户取消 QR 配对
- **WHEN** 用户在 QR 显示期间点击"取消"
- **THEN** 状态回到 idle

### Requirement: Channels Store 扩展

`useChannelsStore` SHALL 扩展以下状态和 actions：

- 新增 `selectedChannel: ChannelInfo | null` — 当前选中的渠道（用于编辑弹窗）
- 新增 `configDialogOpen: boolean` — 配置弹窗打开状态
- 新增 `configDialogChannelType: ChannelType | null` — 当前配置弹窗的渠道类型
- 新增 `qrState: "idle" | "loading" | "qr" | "scanning" | "success" | "error" | "cancel"` — QR 配对状态
- 新增 `qrDataUrl: string | null` — QR 码图片数据
- 新增 `logoutChannel(channel, accountId)` — 调用 adapter 登出
- 新增 `openConfigDialog(channelType, existingChannel?)` — 打开配置弹窗
- 新增 `closeConfigDialog()` — 关闭配置弹窗
- 新增 `startQrPairing()` — 启动 QR 配对流程
- 新增 `cancelQrPairing()` — 取消 QR 配对

#### Scenario: 打开配置弹窗设置状态
- **WHEN** 调用 `openConfigDialog("telegram")`
- **THEN** `configDialogOpen` 为 true，`configDialogChannelType` 为 "telegram"

#### Scenario: QR 配对状态流转
- **WHEN** 调用 `startQrPairing()`
- **THEN** `qrState` 从 "idle" → "loading" → "qr"（收到 QR 数据后）→ "scanning" → "success" 或 "error"

