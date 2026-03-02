## ADDED Requirements

### Requirement: 应用启动 E2E 测试

系统 SHALL 包含测试验证应用在 Mock 模式下正确启动，渲染 Agent 列表和主要 UI 元素。

#### Scenario: Mock 模式启动

- **WHEN** 应用以 Mock 模式启动
- **THEN** 侧栏 SHALL 显示 Agent 列表，主内容区 SHALL 渲染 2D 平面图或 3D 场景

### Requirement: Agent 事件到达 UI 更新测试

系统 SHALL 包含测试验证 Gateway 事件到达后 UI 正确更新 Agent 状态。

#### Scenario: 生命周期事件更新状态

- **WHEN** 收到 Agent lifecycle.start 事件
- **THEN** 对应 Agent 的 status SHALL 变为 "thinking"，Sidebar 中 Agent 条目 SHALL 显示对应状态标识

### Requirement: 视图切换 E2E 测试

系统 SHALL 包含测试验证 2D ↔ 3D 视图切换时组件正确加载/卸载。

#### Scenario: 切换到 3D 模式

- **WHEN** 用户点击 TopBar 中的 3D 按钮
- **THEN** 主内容区 SHALL 从 FloorPlan 切换为 Scene3D（或 Suspense fallback）

### Requirement: Agent 选中 E2E 测试

系统 SHALL 包含测试验证点击 Agent 后详情面板显示正确的 Agent 信息。

#### Scenario: 选中 Agent 显示详情

- **WHEN** 用户点击 Sidebar 中的 Agent 条目
- **THEN** AgentDetailPanel SHALL 显示该 Agent 的名称、状态、工具调用历史等信息
