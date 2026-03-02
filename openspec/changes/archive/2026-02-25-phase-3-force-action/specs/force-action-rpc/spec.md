## ADDED Requirements

### Requirement: Force Action RPC 方法封装

系统 SHALL 提供以下 RPC 方法封装，每个方法返回 Promise：

- `pauseAgent(agentId: string)` — 暂停指定 Agent 的当前运行
- `resumeAgent(agentId: string)` — 恢复暂停的 Agent
- `killAgent(agentId: string)` — 终止指定 Agent 的当前运行
- `sendMessageToAgent(agentId: string, text: string)` — 向指定 Agent 发送文本指令

#### Scenario: 成功的 RPC 调用

- **WHEN** 调用 `pauseAgent("agent-01")`，Gateway 返回 ok=true 的响应
- **THEN** Promise SHALL resolve，UI 可据此关闭弹窗

#### Scenario: 失败的 RPC 调用

- **WHEN** 调用 `killAgent("agent-02")`，Gateway 返回 ok=false
- **THEN** Promise SHALL reject，包含 Gateway 的错误信息

### Requirement: RPC 超时处理

每个 Force Action RPC 调用 SHALL 有 5 秒超时。超时后 Promise SHALL reject 并包含 "操作超时" 错误信息。

#### Scenario: 超时场景

- **WHEN** 调用 `pauseAgent("agent-01")` 后 5 秒内无响应
- **THEN** Promise SHALL reject，错误信息为 "操作超时，Gateway 可能暂不支持此操作"

### Requirement: 连接状态检查

发送 RPC 前 SHALL 检查 `connectionStatus === "connected"`。如未连接，SHALL 立即 reject 并提示 "未连接到 Gateway"。

#### Scenario: 未连接时操作

- **WHEN** 连接状态为 "disconnected" 时调用 sendMessageToAgent
- **THEN** Promise SHALL 立即 reject，错误信息为 "未连接到 Gateway"
