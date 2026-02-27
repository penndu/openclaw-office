# console-shared-ui Specification

## Purpose
TBD - created by archiving change clawx-phase-c-console-pages. Update Purpose after archive.
## Requirements
### Requirement: StatusBadge 通用状态标识组件

系统 SHALL 提供 `StatusBadge` 组件，接受 `status: string` 和可选 `color: string` prop，渲染为带颜色圆点 + 文字标签的行内元素。

预定义状态映射：
- `connected` / `active` / `ok` → 绿色
- `disconnected` / `paused` / `disabled` → 灰色
- `connecting` / `pending` / `running` → 黄色
- `error` / `failed` → 红色

文字标签 SHALL 通过 i18n 翻译（`common:status.<status>`）。

#### Scenario: 渲染 connected 状态
- **WHEN** 渲染 `<StatusBadge status="connected" />`
- **THEN** 显示绿色圆点 + "已连接" 文字（中文环境）

#### Scenario: 未知状态降级
- **WHEN** 渲染 `<StatusBadge status="unknown_status" />`
- **THEN** 显示灰色圆点 + 原始状态文字

### Requirement: EmptyState 空态展示组件

系统 SHALL 提供 `EmptyState` 组件，接受 `icon`（Lucide 图标组件）、`title`、`description`（可选）、`action`（可选按钮）prop。

渲染为居中布局：图标 + 标题 + 描述文字 + 操作按钮。

#### Scenario: 渲染带操作按钮的空态
- **WHEN** 渲染 `<EmptyState icon={Inbox} title="暂无数据" action={{ label: "刷新", onClick: fn }} />`
- **THEN** 显示 Inbox 图标 + "暂无数据" 标题 + "刷新" 按钮

#### Scenario: 渲染仅标题的空态
- **WHEN** 渲染 `<EmptyState icon={Inbox} title="暂无渠道" />`
- **THEN** 显示 Inbox 图标 + "暂无渠道" 标题，不显示按钮

### Requirement: LoadingState 加载态展示组件

系统 SHALL 提供 `LoadingState` 组件，渲染居中的 loading spinner + 可选文字提示。

#### Scenario: 渲染加载中
- **WHEN** 渲染 `<LoadingState />`
- **THEN** 显示旋转的 loading 动画

#### Scenario: 渲染带提示文字的加载态
- **WHEN** 渲染 `<LoadingState message="加载渠道数据..." />`
- **THEN** 显示 loading 动画 + "加载渠道数据..." 文字

### Requirement: ErrorState 错误态展示组件

系统 SHALL 提供 `ErrorState` 组件，接受 `message: string` 和可选 `onRetry: () => void` prop。

渲染为红色主题的错误提示 + 可选重试按钮。

#### Scenario: 渲染可重试的错误态
- **WHEN** 渲染 `<ErrorState message="网络错误" onRetry={retryFn} />`
- **THEN** 显示红色错误图标 + "网络错误" 文字 + "重试" 按钮
- **WHEN** 用户点击"重试"按钮
- **THEN** 调用 `retryFn`

#### Scenario: 渲染不可重试的错误态
- **WHEN** 渲染 `<ErrorState message="权限不足" />`
- **THEN** 显示红色错误图标 + "权限不足" 文字，不显示重试按钮

### Requirement: ConfirmDialog 确认弹窗组件

系统 SHALL 提供 `ConfirmDialog` 组件，接受 `open`、`title`、`description`、`confirmLabel`、`onConfirm`、`onCancel`、`variant?: "danger" | "default"` prop。

`variant="danger"` 时确认按钮 SHALL 渲染为红色。

#### Scenario: 危险操作确认
- **WHEN** 渲染 `<ConfirmDialog open={true} title="删除渠道" variant="danger" />`
- **THEN** 弹窗显示，确认按钮为红色
- **WHEN** 用户点击确认
- **THEN** 调用 `onConfirm`

#### Scenario: 取消操作
- **WHEN** 用户在弹窗中点击取消或按 ESC
- **THEN** 调用 `onCancel`

### Requirement: 通用 UI 组件 i18n 集成

所有通用组件中的固定文案（如"重试"、"确认"、"取消"等）SHALL 通过 `useTranslation("common")` 获取翻译。

#### Scenario: 中英文切换
- **WHEN** 语言从中文切换为英文
- **THEN** ConfirmDialog 的"确认"/"取消"按钮文字变为"Confirm"/"Cancel"
- **THEN** ErrorState 的"重试"按钮文字变为"Retry"

