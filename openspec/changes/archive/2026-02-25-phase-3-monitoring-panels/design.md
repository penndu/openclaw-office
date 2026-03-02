## Context

当前 `recharts` 已安装但未使用。MetricsPanel 展示 4 个指标卡片，数据来自 `store.globalMetrics`，其中 `totalTokens` 和 `tokenRate` 始终为 0。Store 中已有 `links: CollaborationLink[]` 数据（含 source/target/strength），可直接作为 NetworkGraph 的数据源。EventTimeline 记录了事件历史，可作为活跃度热力图的数据基础。

设计稿图4 右侧面板包含 Global Overview（饼图）、Activity Heatmap（热力图矩阵）、Network Graph（力导向图）和 Recent Events（时间线），布局为垂直堆叠。

## Goals / Non-Goals

**Goals:**

- 打通 `usage.status` RPC 数据链路，让 totalTokens/tokenRate 从真实数据填充
- 实现 Token 消耗折线图（30 分钟窗口，最多 30 个数据点，多 Agent 线条）
- 实现 Agent 协作拓扑图（基于 store.links，简单的力导向 SVG 布局）
- 实现活跃度热力图（基于 eventHistory 聚合）
- 实现成本饼图（基于 `usage.cost` RPC 或本地 token 聚合）

**Non-Goals:**

- 不引入 d3-force 全库（使用简化的弹簧布局算法或静态圆形布局）
- 不做图表导出/截图功能
- 不做自定义时间范围选择（固定 30 分钟窗口）

## Decisions

### D1: Token 数据获取 — Usage RPC 轮询

**选择**: 新建 `useUsagePoller` hook，每 60 秒调用 `usage.status` RPC。

**做法**:

- 返回 `{ tokens: { input, output, total }, byAgent: Record<agentId, { input, output }> }`
- 将每次返回写入 store 的 `tokenHistory` 环形缓冲区（最多 30 条记录，1 分钟间隔）
- `usage.cost` 用于成本饼图，同样 60 秒轮询
- 断线时暂停，重连后恢复
- Mock 模式下 mock-provider 返回随机递增的 token 数据

### D2: NetworkGraph 布局 — 简化的圆形布局

**选择**: 不引入 d3-force 完整库，使用简化的圆形布局 + Recharts 无法实现力导向图，改用纯 SVG。

**替代方案**:

- d3-force → 依赖体积大，且复杂度高
- @nivo/network → 新增依赖

**做法**:

- 使用纯 React + SVG 实现
- Agent 节点均匀分布在圆形上（圆形布局），节点大小反映 toolCallCount
- 边（协作连线）连接有 CollaborationLink 的节点对，线宽 = strength × 3
- 节点颜色 = STATUS_COLORS[agent.status]
- 节点 hover 高亮关联边
- 可拖拽交互（简单的 mousedown/move 实现节点位移）

### D3: 活跃度热力图 — 基于 eventHistory 聚合

**选择**: 从 store.eventHistory 聚合每 Agent 每小时的事件数。

**做法**:

- 行 = 活跃 Agent（最多 10 个）
- 列 = 最近 24 小时（每小时一格，最多 24 列）
- 格子颜色: 0 事件=浅灰, 1-5=浅绿, 5-10=中绿, 10+=深绿
- 使用简单的 SVG rect 矩阵实现（不用 Recharts）
- 悬停格子显示 tooltip（Agent 名称、时间段、事件数）

### D4: MetricsPanel 增强 — Tab 切换布局

**选择**: 在现有 4 卡片下方增加 Tab 切换区域，Tab 包含: 概览(Overview) | 趋势(Trends) | 拓扑(Network) | 活跃(Activity)。

**做法**:

- Overview tab: 成本饼图 + 现有 4 卡片
- Trends tab: Token 消耗折线图
- Network tab: Agent 关系拓扑图
- Activity tab: 活跃热力图
- Tab 使用简单的 state 切换，各 tab 内容按需渲染

## Risks / Trade-offs

- **[RPC 数据不可用]** → Gateway 可能不支持 `usage.status`/`usage.cost`。缓解: RPC 失败时使用本地 token 聚合作 fallback
- **[大量 Agent 图表性能]** → 50 个 Agent 的折线图或拓扑图可能卡顿。缓解: 折线图仅显示 Top 5 Agent + 总量线，拓扑图最多显示 20 个节点
- **[eventHistory 不持久]** → 页面刷新后热力图数据清空。缓解: 可接受，标注"自本次会话开始"
