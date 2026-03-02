## MODIFIED Requirements

### Requirement: 图表组件懒加载

MetricsPanel 中的 TokenLineChart、CostPieChart、NetworkGraph、ActivityHeatmap SHALL 使用 `React.lazy` 懒加载，仅在对应 Tab 被选中时加载。

#### Scenario: 切换到趋势 Tab 触发加载

- **WHEN** 用户首次点击 "趋势" Tab
- **THEN** TokenLineChart 组件 SHALL 被懒加载，加载期间显示 loading spinner

#### Scenario: 2D 模式不加载 Three.js

- **WHEN** 用户始终停留在 2D 视图模式
- **THEN** Vite bundle 中 THREE/R3F 相关代码 SHALL 不被加载到浏览器
