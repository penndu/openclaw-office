## ADDED Requirements

### Requirement: Agent 成本占比饼图

系统 SHALL 使用 Recharts PieChart 展示各 Agent 的 token 成本占比。每个扇区代表一个 Agent，面积反映其 token 消耗比例。

#### Scenario: 有成本数据时渲染饼图

- **WHEN** agentCosts 中有数据
- **THEN** 饼图 SHALL 按 Agent 占比渲染各扇区

#### Scenario: 无成本数据时显示占位

- **WHEN** agentCosts 为空
- **THEN** 饼图区域 SHALL 显示"暂无成本数据"

### Requirement: 饼图颜色和标签

每个扇区颜色 SHALL 使用该 Agent 的 generateAvatar3dColor 返回的颜色。饼图中心 SHALL 显示总成本数值。

#### Scenario: 颜色对应 Agent

- **WHEN** Agent-A 的 avatar 颜色为 #3b82f6
- **THEN** 其饼图扇区 SHALL 使用 #3b82f6 色

### Requirement: 饼图悬停交互

鼠标悬停在扇区上时 SHALL 显示 tooltip：Agent 名称、token 数量、占比百分比。

#### Scenario: 悬停扇区

- **WHEN** 鼠标悬停在 Agent-A 的扇区上
- **THEN** tooltip SHALL 显示 "Agent-A: 15,000 tokens (35%)"
