## MODIFIED Requirements

### Requirement: Agent 状态管理

系统 SHALL 使用 Zustand + Immer 管理所有 VisualAgent 的状态，支持高频增量更新。新增 movement 动画状态管理，zone 迁移改为动画驱动而非瞬时坐标变化。

#### Scenario: 初始化 Agent 列表

- **WHEN** 从 RPC `agents.list` 获取到 Agent 配置列表
- **THEN** 系统 SHALL 为每个 Agent 创建 VisualAgent 对象，初始状态为 `"idle"`，使用 `agent.identity.name` 或 `agent.name` 或 `agent.id` 作为显示名称

#### Scenario: 初始化后预填充休息区

- **WHEN** `initAgents` 执行完毕
- **THEN** 系统 SHALL 调用 `prefillLoungePlaceholders(maxSubAgents)` 创建 placeholder Agent 填充休息区

#### Scenario: 处理 Agent 状态变更事件

- **WHEN** 事件处理模块推送状态变更
- **THEN** store SHALL 更新对应 VisualAgent 的 `status`、`currentTool`、`speechBubble`、`lastActiveAt` 等字段，且 MUST 使用 immer 确保不可变更新

#### Scenario: sub-agent 创建时激活 placeholder

- **WHEN** `addSubAgent` 被调用
- **THEN** 系统 SHALL 查找第一个可用的 placeholder Agent，激活为真实 Agent，并启动从 lounge 到 hotDesk 的行走动画

#### Scenario: sub-agent 激活时启动行走动画

- **WHEN** sub-agent 状态从 idle 变为 thinking/tool_calling/speaking 且 zone 为 `"lounge"`
- **THEN** 系统 SHALL 调用 `startMovement(agentId, fromZone, toZone)` 启动行走动画，而非直接改变 position 和 zone

#### Scenario: Agent 选中/取消选中

- **WHEN** 用户点击 Agent 圆点或列表项
- **THEN** `selectedAgentId` SHALL 更新为对应 id（再次点击同一 Agent 取消选中设为 null）

### Requirement: 协作关系维护

系统 SHALL 追踪 Agent 之间的协作关系，并在 agentToAgent 通信时自动触发会议区动画式聚集。

#### Scenario: CollaborationLink 更新后触发会议行走

- **WHEN** `updateCollaborationLinks` 更新了 CollaborationLink
- **AND** `agentToAgentConfig.enabled === true`
- **THEN** 系统 SHALL 调用 `detectMeetingGroups` + `applyMeetingGathering`，对符合条件的 Agent 启动行走到会议区的动画

#### Scenario: 通信结束后 Agent 行走返回原 zone

- **WHEN** CollaborationLink 过期（>60 秒无活动）或 strength 低于阈值
- **THEN** 系统 SHALL 对会议区 Agent 启动行走回原 zone 的动画（使用 originalPosition）

## ADDED Requirements

### Requirement: Movement 动画 Action

store SHALL 新增 movement 动画相关的 action。

#### Scenario: startMovement action

- **WHEN** `startMovement(agentId, toZone)` 被调用
- **THEN** store SHALL 使用 `planWalkPath` 生成路径，设置 `agent.movement = { path, progress: 0, duration, startTime, fromZone, toZone }`

#### Scenario: tickMovement action

- **WHEN** 动画帧调用 `tickMovement(agentId, deltaTime)` 
- **THEN** store SHALL 更新 `agent.movement.progress`，并通过 `interpolatePathPosition` 更新 `agent.position`

#### Scenario: completeMovement action

- **WHEN** `movement.progress >= 1`
- **THEN** store SHALL 将 `agent.movement` 设为 `null`，`agent.zone` 设为 `toZone`，`agent.position` 设为路径终点

### Requirement: VisualAgent movement 字段

VisualAgent 类型 SHALL 新增 movement 相关字段。

#### Scenario: movement 字段类型

- **WHEN** VisualAgent 类型定义
- **THEN** SHALL 包含 `movement: MovementState | null` 字段，默认值为 `null`

#### Scenario: isPlaceholder 字段

- **WHEN** VisualAgent 类型定义
- **THEN** SHALL 包含 `isPlaceholder: boolean` 字段，默认值为 `false`

### Requirement: Zone 迁移改为动画驱动

现有的 `scheduleZoneMigration` 中直接修改 position/zone 的逻辑 SHALL 改为调用 `startMovement`，实现动画过渡。

#### Scenario: lounge → hotDesk 动画迁移

- **WHEN** sub-agent 在休息区变为活跃状态
- **THEN** 系统 SHALL 调用 `startMovement(agentId, "hotDesk")`，Agent 沿走廊路径从休息区走向热工位区

#### Scenario: hotDesk → lounge 动画迁移

- **WHEN** 热工位区 sub-agent 持续 idle 30 秒
- **THEN** 系统 SHALL 调用 `startMovement(agentId, "lounge")`，Agent 走回休息区

#### Scenario: desk → meeting 动画迁移

- **WHEN** 主 Agent 被 `applyMeetingGathering` 选中进入会议
- **THEN** 系统 SHALL 调用 `startMovement(agentId, "meeting")`，Agent 从固定工位走向会议区

#### Scenario: meeting → desk 动画迁移

- **WHEN** 会议结束，Agent 调用 `returnFromMeeting`
- **THEN** 系统 SHALL 启动行走动画从会议区走回原 zone（originalPosition 指定的 zone）
