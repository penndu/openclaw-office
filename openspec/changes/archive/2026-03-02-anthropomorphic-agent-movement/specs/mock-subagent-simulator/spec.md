## ADDED Requirements

### Requirement: Mock sub-agent 生命周期模拟

mock-adapter SHALL 在连接成功后自动开始模拟 sub-agent 的创建、工作和结束的完整生命周期循环。

#### Scenario: 模拟启动时机

- **WHEN** mock-adapter 连接成功（`hello-ok`）且延迟 5 秒后
- **THEN** 系统 SHALL 开始自动模拟 sub-agent 创建循环

#### Scenario: 创建 sub-agent

- **WHEN** 模拟循环运行中
- **THEN** 系统 SHALL 每隔 3~8 秒随机创建一个 mock sub-agent，关联到随机的主 Agent，发出 `lifecycle.start` 事件

#### Scenario: sub-agent 工作流程

- **WHEN** mock sub-agent 被创建
- **THEN** 系统 SHALL 按顺序模拟以下状态变化（每状态持续 2~5 秒）：`thinking` → `tool_calling`（带 tool name） → `speaking`（带 speech bubble） → `idle`

#### Scenario: sub-agent 结束

- **WHEN** mock sub-agent 完成一轮工作（变为 idle）后等待 8~15 秒
- **THEN** 系统 SHALL 发出 `lifecycle.end` 事件，模拟 sub-agent 结束

#### Scenario: 并发限制

- **WHEN** 模拟运行中
- **THEN** 同时活跃（非 idle）的 mock sub-agent 数量 SHALL NOT 超过 3 个

### Requirement: Mock agentToAgent 通信模拟

mock-adapter SHALL 定期模拟 agentToAgent 通信事件。

#### Scenario: 模拟通信触发

- **WHEN** 模拟运行 20 秒后
- **THEN** 系统 SHALL 每隔 15~30 秒创建一组 mock agentToAgent 通信事件，使两个或更多主 Agent 之间产生 CollaborationLink

#### Scenario: 通信自然结束

- **WHEN** 一组 mock 通信开始后经过 10~20 秒
- **THEN** 通信事件 SHALL 停止发送，CollaborationLink 自然衰减，会议自动解散

### Requirement: 模拟器配置

mock-adapter 的 sub-agent 模拟器 SHALL 使用 store 中的 `maxSubAgents` 配置来限制 placeholder 数量。

#### Scenario: 使用 store 配置

- **WHEN** 模拟器创建 sub-agent
- **THEN** SHALL 读取 `useOfficeStore.getState().maxSubAgents` 作为 sub-agent 池总数上限

#### Scenario: 模拟器清理

- **WHEN** mock-adapter 断开连接
- **THEN** 模拟器 SHALL 清理所有定时器，停止创建新的 mock sub-agent
