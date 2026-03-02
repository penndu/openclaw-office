## Why

当前 MetricsPanel 仅展示 4 个静态卡片（Active Agents、Total Tokens、Collaboration、Token Rate），且 totalTokens 和 tokenRate 始终为 0（未对接 Gateway 的 `usage.status` RPC）。设计稿图4 展示了完整的管理员控制面板：Global Overview 饼图、Activity Heatmap 热力图、Network Graph 拓扑图和 Recent Events 时间线。需要增加时序图表、网络拓扑和热力图等高级监控面板，同时打通 token 消耗数据的实时获取。

## What Changes

- **Token 消耗折线图**：使用 Recharts 绘制最近 30 分钟的 tokens/min 时序折线图，支持总量和各 Agent 分别的消耗，数据通过周期性 RPC 调用 `usage.status` 获取
- **Agent 关系拓扑图（NetworkGraph）**：基于 store.links（CollaborationLink）绘制力导向图，节点为 Agent（大小反映活跃度），边为协作关系（粗细反映 strength），颜色为 Agent 状态色
- **活跃热力图（ActivityHeatmap）**：日历格子形式，行为 Agent、列为时间段（最近 24 小时/小时粒度），颜色深浅反映活跃度
- **成本饼图（CostPieChart）**：各 Agent 的 token 成本占比饼图，悬停显示具体数值
- **Usage RPC 数据管线**：周期性调用 `usage.status` 和 `usage.cost` RPC，将数据写入 store 供图表消费

## Capabilities

### New Capabilities

- `token-line-chart`: Token 消耗实时折线图（30 分钟窗口，1 分钟粒度，多 Agent 分线）
- `network-graph`: Agent 协作关系力导向拓扑图
- `activity-heatmap`: Agent 活跃度热力图（24 小时 × Agent 矩阵）
- `cost-pie-chart`: Agent 成本占比饼图
- `usage-data-pipeline`: 周期性 RPC 轮询 usage.status/usage.cost 并写入 store

### Modified Capabilities

- `office-store`: 新增 tokenHistory、agentCosts、activityData 等数据字段
- `panel-system`: MetricsPanel 增加图表 Tab 切换

## Impact

- **新增依赖**: 无（recharts 已在 package.json）
- **修改文件**:
  - `src/store/office-store.ts` — 新增 token history、cost、activity 数据字段和 actions
  - `src/store/metrics-reducer.ts` — 从 RPC 响应更新 token 指标
  - `src/components/panels/MetricsPanel.tsx` — 增加图表 Tab 切换
  - `src/hooks/useGatewayConnection.ts` — 集成 usage RPC 轮询
- **新增文件**:
  - `src/components/panels/TokenLineChart.tsx`
  - `src/components/panels/NetworkGraph.tsx`
  - `src/components/panels/ActivityHeatmap.tsx`
  - `src/components/panels/CostPieChart.tsx`
  - `src/hooks/useUsagePoller.ts`
- **测试**: usage 轮询数据流测试、图表组件渲染测试
