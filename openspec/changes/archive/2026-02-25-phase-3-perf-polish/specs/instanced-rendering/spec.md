## ADDED Requirements

### Requirement: Agent > 20 时启用 InstancedMesh 渲染

当场景中 Agent 数量超过 20 时，系统 SHALL 使用 THREE.InstancedMesh 批量渲染 Agent 的身体和头部，减少 draw call。

#### Scenario: 30 个 Agent 的批量渲染

- **WHEN** 场景中有 30 个 Agent
- **THEN** 身体 SHALL 通过单个 InstancedMesh（CapsuleGeometry）渲染 30 个 instance，头部通过另一个 InstancedMesh（SphereGeometry）渲染 30 个 instance

#### Scenario: 15 个 Agent 的独立渲染

- **WHEN** 场景中有 15 个 Agent
- **THEN** 系统 SHALL 使用独立的 AgentCharacter 组件逐个渲染（保持当前行为）

### Requirement: InstancedMesh 颜色和位置同步

每个 Agent instance 的颜色 SHALL 与其 status 对应的颜色一致，位置 SHALL 与 agent.position 同步。颜色和位置变化 SHALL 仅在 Agent 状态/位置实际变化时更新。

#### Scenario: Agent 状态变化时颜色更新

- **WHEN** Agent-A 从 idle 变为 thinking
- **THEN** 对应 instance 的颜色 SHALL 从 idle 色变为 thinking 色

### Requirement: 状态指示器独立渲染

ThinkingIndicator、ErrorIndicator、SkillHologram 等状态特效组件 SHALL 仍然独立渲染，不纳入 InstancedMesh。

#### Scenario: InstancedMesh 模式下特效正常

- **WHEN** InstancedMesh 模式下 Agent-A 处于 thinking 状态
- **THEN** ThinkingIndicator SHALL 在 Agent-A 位置正常渲染
