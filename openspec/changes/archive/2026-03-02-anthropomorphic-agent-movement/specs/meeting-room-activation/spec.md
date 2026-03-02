## MODIFIED Requirements

### Requirement: agentToAgent 通信触发会议区聚集

系统 SHALL 在检测到 agentToAgent 通信时，自动将参与通信的 Agent 通过行走动画移入会议区，通信线在会议区渲染。

#### Scenario: CollaborationLink 触发会议行走

- **WHEN** 两个或更多 Agent 之间的 CollaborationLink strength 超过 0.3 且 `agentToAgentConfig.enabled === true`
- **THEN** 系统 SHALL 对这些 Agent 启动 `startMovement(agentId, "meeting")`，而非直接调用 `moveToMeeting` 瞬时改变坐标

#### Scenario: 仅允许配置中的 Agent 触发会议

- **WHEN** Agent A 和 Agent B 之间有 CollaborationLink
- **AND** Agent A 或 Agent B 不在 `agentToAgentConfig.allow` 列表中
- **THEN** 系统 SHALL NOT 将它们移入会议区，通信线保留在原 zone 渲染

#### Scenario: agentToAgent 未启用时不激活会议区

- **WHEN** `agentToAgentConfig.enabled === false`
- **THEN** 系统 SHALL NOT 触发任何会议区聚集，CollaborationLink 在 Agent 原 zone 渲染

### Requirement: 会议结束后 Agent 行走返回原 zone

系统 SHALL 在通信结束后，通过行走动画将 Agent 从会议区返回到其原始 zone 和 position。

#### Scenario: 通信结束行走返回

- **WHEN** 会议组的所有 CollaborationLink strength 降至 0.3 以下或链接过期（60 秒超时）
- **THEN** 系统 SHALL 对会议区 Agent 启动行走动画，从会议区走回 `originalPosition` 所在的 zone

#### Scenario: 并发会议支持

- **WHEN** 同时存在多组 agentToAgent 通信
- **THEN** 系统 SHALL 支持最多 3 个并发会议组（`MAX_CONCURRENT_MEETINGS`），每组使用不同的会议桌位置

### Requirement: 会议区通信线渲染

系统 SHALL 在会议区渲染参与通信的 Agent 之间的 ConnectionLine。

#### Scenario: 行走中 Agent 的通信线

- **WHEN** Agent 正在行走前往会议区（`movement !== null` 且 `toZone === "meeting"`）
- **THEN** ConnectionLine 的端点坐标 SHALL 使用 Agent 当前的插值位置（行走中位置），通信线跟随 Agent 移动

#### Scenario: 已落座 Agent 的通信线

- **WHEN** Agent 已到达会议区（`zone === "meeting"` 且 `movement === null`）
- **THEN** ConnectionLine 的端点坐标 SHALL 使用 Agent 在会议区的固定 position

#### Scenario: 会议区 Agent 头像和气泡

- **WHEN** Agent 在会议区
- **THEN** AgentAvatar SHALL 在会议座位位置渲染，SpeechBubble SHALL 跟随会议区位置显示

### Requirement: 自动触发频率控制

系统 SHALL 控制 `applyMeetingGathering` 的调用频率，避免性能问题。

#### Scenario: 无变化时跳过

- **WHEN** `detectMeetingGroups` 的结果与上次相同
- **THEN** 系统 SHALL 跳过 `applyMeetingGathering` 调用

#### Scenario: 最大触发频率

- **WHEN** CollaborationLink 高频更新
- **THEN** `applyMeetingGathering` SHALL 不超过每秒 2 次调用（throttle 500ms）

### Requirement: 行走中不重复触发会议

系统 SHALL 避免在 Agent 正在行走前往会议区途中重复触发行走。

#### Scenario: 已在行走中的 Agent

- **WHEN** Agent 已有 `movement` 且 `movement.toZone === "meeting"`
- **THEN** `applyMeetingGathering` SHALL NOT 对该 Agent 重复调用 `startMovement`
