# gateway-adapter Specification

## Purpose

TBD - created by archiving change clawx-phase-a-architecture. Update Purpose after archive.

## Requirements

### Requirement: GatewayAdapter 统一接口

系统 SHALL 定义 `GatewayAdapter` TypeScript 接口，包含与 OpenClaw Gateway 方法一一对应的类型安全方法签名。

#### Scenario: 接口方法覆盖所有 Gateway 领域

- **WHEN** GatewayAdapter 接口定义完成
- **THEN** 接口 SHALL 包含以下领域的方法签名：
  - 连接管理：`connect()`, `disconnect()`, `onEvent()`
  - Chat：`chatHistory()`, `chatSend()`, `chatAbort()`
  - Sessions：`sessionsList()`, `sessionsPreview()`
  - Channels：`channelsStatus()`
  - Skills：`skillsStatus()`
  - Cron：`cronList()`, `cronAdd()`, `cronUpdate()`, `cronRemove()`, `cronRun()`
  - Agents：`agentsList()`
  - Tools：`toolsCatalog()`
  - Usage：`usageStatus()`

#### Scenario: 所有方法均有 TypeScript 类型约束

- **WHEN** 调用 GatewayAdapter 的任何方法
- **THEN** 入参和返回值 SHALL 具有明确的 TypeScript 类型定义，不使用 `any` 或 `unknown` 作为方法级返回类型

### Requirement: MockAdapter 实现

系统 SHALL 提供 `MockAdapter` 类，实现 `GatewayAdapter` 接口，返回模拟数据用于离线开发。

#### Scenario: MockAdapter 返回合理的模拟数据

- **WHEN** 调用 MockAdapter 的 `channelsStatus()` 方法
- **THEN** SHALL 返回包含 2-3 个模拟渠道的数组，每个渠道具有 id、name、type、status 等字段

#### Scenario: MockAdapter 的 cronList 返回数据

- **WHEN** 调用 MockAdapter 的 `cronList()` 方法
- **THEN** SHALL 返回包含 1-2 个模拟定时任务的数组

#### Scenario: MockAdapter 的事件订阅

- **WHEN** 调用 MockAdapter 的 `onEvent()` 方法
- **THEN** SHALL 返回取消订阅函数，MockAdapter MAY 定期发送模拟事件（如心跳）

### Requirement: WsAdapter 实现

系统 SHALL 提供 `WsAdapter` 类，实现 `GatewayAdapter` 接口，通过现有 WebSocket 客户端与真实 Gateway 通信。

#### Scenario: WsAdapter 复用现有 ws-client

- **WHEN** 创建 WsAdapter 实例
- **THEN** SHALL 接受现有 `GatewayWsClient` 实例作为构造参数，复用其连接和 RPC 能力

#### Scenario: WsAdapter 的 RPC 调用映射

- **WHEN** 调用 WsAdapter 的 `channelsStatus()` 方法
- **THEN** SHALL 内部调用 `rpcClient.callRpc("channels.status")` 并返回类型化的结果

### Requirement: Adapter Provider 切换

系统 SHALL 根据环境变量自动选择 Adapter 实现。

#### Scenario: VITE_MOCK=true 时使用 MockAdapter

- **WHEN** 环境变量 `VITE_MOCK` 设为 `"true"`
- **THEN** `getAdapter()` SHALL 返回 MockAdapter 实例

#### Scenario: 默认使用 WsAdapter

- **WHEN** 环境变量 `VITE_MOCK` 未设置或为 `"false"`
- **THEN** `getAdapter()` SHALL 返回 WsAdapter 实例
