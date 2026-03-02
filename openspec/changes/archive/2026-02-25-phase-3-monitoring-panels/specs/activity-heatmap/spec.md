## ADDED Requirements

### Requirement: Agent 活跃度热力图

系统 SHALL 渲染日历格子形式的热力图。行为 Agent（最多 10 个活跃 Agent），列为时间段（最近 24 小时，每小时一格）。

#### Scenario: 有事件数据时渲染热力图

- **WHEN** eventHistory 中有事件记录
- **THEN** 热力图 SHALL 按 Agent × 时间段 渲染颜色格子

#### Scenario: 无事件数据时显示占位

- **WHEN** eventHistory 为空
- **THEN** 热力图区域 SHALL 显示"暂无活跃数据"

### Requirement: 颜色强度映射

格子颜色 SHALL 根据该 Agent 在该小时内的事件数映射：0 事件=浅灰(#f3f4f6)、1-5 事件=浅绿(#bbf7d0)、5-10 事件=中绿(#4ade80)、10+ 事件=深绿(#16a34a)。

#### Scenario: 高活跃度格子

- **WHEN** Agent-A 在 14:00-15:00 有 12 个事件
- **THEN** 对应格子 SHALL 显示深绿色(#16a34a)

### Requirement: 格子 tooltip

鼠标悬停在格子上时 SHALL 显示 tooltip：Agent 名称、时间段、事件数量。

#### Scenario: 悬停查看详情

- **WHEN** 鼠标悬停在某个格子上
- **THEN** tooltip SHALL 显示 "Agent-A | 14:00-15:00 | 12 events"
