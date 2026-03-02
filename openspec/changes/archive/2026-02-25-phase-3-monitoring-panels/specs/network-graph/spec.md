## ADDED Requirements

### Requirement: Agent 关系拓扑图

系统 SHALL 渲染 SVG 力导向图展示 Agent 间的协作关系。节点代表 Agent，边代表 CollaborationLink。

#### Scenario: 有协作关系时渲染拓扑图

- **WHEN** store.links 中有 CollaborationLink 数据
- **THEN** 拓扑图 SHALL 渲染节点和连线

#### Scenario: 无协作关系时显示孤立节点

- **WHEN** store.links 为空但有 Agent
- **THEN** 拓扑图 SHALL 仅渲染 Agent 节点（无连线）

### Requirement: 节点视觉映射

节点大小 SHALL 反映 Agent 的 toolCallCount（最小半径 8px，最大 24px）。节点颜色 SHALL 使用 STATUS_COLORS[agent.status]。节点 SHALL 显示 Agent 名称标签。

#### Scenario: 活跃 Agent 节点更大

- **WHEN** Agent-A 的 toolCallCount=20，Agent-B 的 toolCallCount=2
- **THEN** Agent-A 的节点 SHALL 明显大于 Agent-B

### Requirement: 边视觉映射

边的粗细 SHALL 反映 CollaborationLink 的 strength（线宽 = strength × 3px，最小 1px）。边的颜色 SHALL 为半透明灰色。

#### Scenario: 高强度协作连线更粗

- **WHEN** Agent-A 和 Agent-B 的 link strength=0.8
- **THEN** 连线宽度 SHALL 约为 2.4px

### Requirement: 节点交互

鼠标悬停在节点上时 SHALL 高亮该节点及其关联边。最多显示 20 个节点（按 toolCallCount 排序取 Top 20）。

#### Scenario: 悬停高亮

- **WHEN** 鼠标悬停在 Agent-A 节点上
- **THEN** Agent-A 的节点 SHALL 放大 1.2 倍，其关联边 SHALL 变为高亮色
