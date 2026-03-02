## MODIFIED Requirements

### Requirement: MetricsPanel 增加图表 Tab 切换

MetricsPanel SHALL 在现有 4 卡片下方增加 Tab 切换区域，包含以下 Tab：

- **概览(Overview)**：成本饼图
- **趋势(Trends)**：Token 消耗折线图
- **拓扑(Network)**：Agent 关系拓扑图
- **活跃(Activity)**：活跃度热力图

#### Scenario: 默认显示概览 Tab

- **WHEN** MetricsPanel 首次渲染
- **THEN** SHALL 默认选中"概览" Tab，显示成本饼图

#### Scenario: 切换 Tab

- **WHEN** 用户点击"趋势" Tab
- **THEN** 面板内容 SHALL 切换为 Token 消耗折线图

#### Scenario: Tab 按需渲染

- **WHEN** Tab 切换
- **THEN** 仅当前选中 Tab 的组件 SHALL 被渲染（其他 Tab 组件不挂载）
