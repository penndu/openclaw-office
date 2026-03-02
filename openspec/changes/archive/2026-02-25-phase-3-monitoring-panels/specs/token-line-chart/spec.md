## ADDED Requirements

### Requirement: Token 消耗折线图展示 30 分钟历史

系统 SHALL 使用 Recharts LineChart 展示最近 30 分钟的 token 消耗趋势。X 轴为时间（1 分钟粒度），Y 轴为 tokens/min。

#### Scenario: 有数据时渲染折线图

- **WHEN** tokenHistory 中有至少 2 个数据点
- **THEN** LineChart SHALL 渲染时间轴折线图，显示总量趋势线

#### Scenario: 无数据时显示占位

- **WHEN** tokenHistory 为空
- **THEN** 图表区域 SHALL 显示"暂无数据，等待 usage 数据…"占位文字

### Requirement: 多 Agent 分线展示

折线图 SHALL 显示总量线（粗实线）和 Top 5 活跃 Agent 的独立折线（细虚线，颜色为 Agent 对应的 STATUS_COLORS）。

#### Scenario: 区分总量和各 Agent 线

- **WHEN** 有 3 个 Agent 的 token 数据
- **THEN** 图表 SHALL 显示 1 条总量粗实线 + 3 条 Agent 细虚线

### Requirement: 图表 tooltip

鼠标悬停在折线图数据点上时，SHALL 显示该时间点的具体数值（总 tokens、各 Agent tokens）。

#### Scenario: 悬停查看数值

- **WHEN** 鼠标悬停在某个时间点上
- **THEN** tooltip SHALL 显示时间、总 tokens、各 Agent 名称及其 tokens
