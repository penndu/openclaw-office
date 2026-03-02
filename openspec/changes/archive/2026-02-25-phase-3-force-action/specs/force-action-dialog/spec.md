## ADDED Requirements

### Requirement: Send Message 弹窗

ForceActionDialog 在 Send Message 模式下 SHALL 显示：目标 Agent 的 SVG 头像和名称、一个多行文本输入框、发送按钮和取消按钮。

#### Scenario: 输入并发送消息

- **WHEN** 用户在 Send Message 弹窗中输入文本 "请检查 API 状态" 并点击发送
- **THEN** 系统 SHALL 通过 RPC 发送消息给目标 Agent，按钮进入 loading 状态，收到响应后关闭弹窗

#### Scenario: 空消息不可发送

- **WHEN** 用户未输入任何文本
- **THEN** 发送按钮 SHALL 为禁用状态

### Requirement: Kill 确认弹窗

ForceActionDialog 在 Kill 模式下 SHALL 显示：目标 Agent 的 SVG 头像和名称、确认文案 "确定要终止 {AgentName} 的当前运行吗？"、确认按钮（红色警示色）和取消按钮。

#### Scenario: 确认终止

- **WHEN** 用户在 Kill 确认弹窗中点击确认按钮
- **THEN** 系统 SHALL 通过 RPC 发送 kill 命令，按钮进入 loading 状态，收到响应后关闭弹窗

#### Scenario: 取消终止

- **WHEN** 用户在 Kill 确认弹窗中点击取消按钮
- **THEN** 弹窗 SHALL 关闭，不发送任何 RPC 请求

### Requirement: RPC 错误反馈

当 Force Action RPC 调用失败或超时时，系统 SHALL 在弹窗中显示错误提示信息，不自动关闭弹窗。

#### Scenario: RPC 超时

- **WHEN** RPC 调用 5 秒内未收到响应
- **THEN** 弹窗 SHALL 显示 "操作超时，Gateway 可能暂不支持此操作" 错误提示，loading 状态恢复

#### Scenario: RPC 返回错误

- **WHEN** RPC 返回 ok=false 的错误响应
- **THEN** 弹窗 SHALL 显示 Gateway 返回的错误信息
