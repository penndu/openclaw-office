## ADDED Requirements

### Requirement: 休息区占位 Agent 预填充

系统 SHALL 在 `initAgents` 完成后，自动在 store 中创建 `maxSubAgents` 个占位 VisualAgent（placeholder），预先填充在休息区。

#### Scenario: 初始化后休息区有占位 Agent

- **WHEN** `initAgents` 执行完毕且 `maxSubAgents === 12`
- **THEN** store 中 SHALL 存在 12 个 `isPlaceholder === true` 的 VisualAgent，zone 为 `"lounge"`，position 为休息区的锚点位置

#### Scenario: 占位 Agent 属性

- **WHEN** 一个 placeholder Agent 被创建
- **THEN** 其属性 SHALL 满足：`id` 为 `"placeholder-N"`（N=0~11），`name` 为 `"待命-N"`，`status` 为 `"idle"`，`isSubAgent === true`，`isPlaceholder === true`

#### Scenario: 占位 Agent 不参与 metrics

- **WHEN** `computeMetrics` 计算全局指标
- **THEN** `isPlaceholder === true` 的 Agent SHALL NOT 计入 `activeAgents` 或 `totalAgents`

### Requirement: 占位 Agent 半透明渲染

占位 Agent 在 2D 和 3D 中 SHALL 以半透明方式渲染，区别于真实 Agent。

#### Scenario: 2D 半透明渲染

- **WHEN** FloorPlan 渲染 `isPlaceholder === true` 的 Agent
- **THEN** AgentAvatar SHALL 以 `opacity: 0.3` 渲染，StatusRing 使用虚线样式（`strokeDasharray="6 3"`），表示"等待被调度"

#### Scenario: 3D 半透明渲染

- **WHEN** 3D 场景渲染 `isPlaceholder === true` 的 Agent
- **THEN** AgentCharacter 的材质 SHALL 使用 `transparent: true, opacity: 0.25`，不参与 hover/click 交互

### Requirement: 真实 sub-agent 激活占位

当真实 sub-agent 被创建时，系统 SHALL 激活一个对应的 placeholder Agent 并触发行走动画。

#### Scenario: sub-agent 创建时激活 placeholder

- **WHEN** `addSubAgent` 被调用创建真实 sub-agent
- **THEN** 系统 SHALL 找到第一个可用的 placeholder Agent，将其属性替换为真实 Agent 信息（id、name、parentAgentId），`isPlaceholder` 设为 `false`

#### Scenario: 激活后触发行走动画

- **WHEN** placeholder 被激活为真实 sub-agent
- **THEN** 系统 SHALL 触发从休息区到热工位区的行走动画（使用 `movement-animator` 的 `planWalkPath`）

#### Scenario: 所有 placeholder 已用完

- **WHEN** `addSubAgent` 被调用但无可用 placeholder
- **THEN** 系统 SHALL 直接在热工位区创建新的 VisualAgent（回退到原有逻辑），不触发行走动画

### Requirement: sub-agent 返回休息区

当 sub-agent 长时间 idle 后，系统 SHALL 触发行走动画让其回到休息区，并恢复为 placeholder 状态。

#### Scenario: idle 30 秒后走回休息区

- **WHEN** 热工位区 sub-agent 持续 idle 超过 30 秒
- **THEN** 系统 SHALL 触发从热工位区到休息区的行走动画

#### Scenario: 到达休息区后恢复 placeholder

- **WHEN** sub-agent 行走到达休息区
- **THEN** 该 Agent SHALL 恢复为 `isPlaceholder === true`（如果是通过 placeholder 激活的），显示半透明效果

#### Scenario: sub-agent 被移除

- **WHEN** `removeSubAgent` 被调用
- **THEN** 对应的 placeholder SHALL 恢复为空闲状态（如果是从 placeholder 激活的），可供下次复用
