## Context

OpenClaw Office 使用十字走廊将办公室分为四个象限：左上=固定工位区（desk）、右上=会议区（meeting）、左下=热工位区（hotDesk）、右下=休息区（lounge）。走廊宽 28px，SVG 画布 1200×700。

前一轮提案已经搭建了 zone 数据架构（VisualAgent.zone、lounge/meeting zone 字段、`calculateLoungePositions`、`detectMeetingGroups`），但 **zone 迁移是瞬时坐标跳变**，缺乏拟人化行走动画。用户期望看到"数字员工站起来，沿走廊走到工位/会议室"的效果。

用户配置：4 主 Agent（main/coder/ai-researcher/ecommerce），subagents.maxConcurrent=12，agentToAgent 启用且 allow 列表为这 4 个 Agent。

## Goals / Non-Goals

**Goals:**
- 实现 waypoint 路径系统：Agent 从任意 zone 到目标 zone，沿走廊生成中间路径点
- 2D SVG 中 Agent 头像沿路径平滑行走，步速约 120px/s，即使实际事件瞬间完成也保证 ≥1.5 秒可见动画
- 3D 中 Agent 胶囊体同步行走，步行时有轻微身体摆动
- 休息区初始化时预填充 maxSubAgents 个半透明占位 Agent，真实 sub-agent 创建时激活并走向热工位
- 会议区：agentToAgent 通信触发后，参与 Agent 走向会议室围桌落座；会议结束走回原位
- Mock 模式模拟完整 sub-agent 生命周期（创建→休息区→走向热工位→工作→走回休息区），以便无 Gateway 时演示

**Non-Goals:**
- 不实现复杂寻路算法（A* 等），用固定的走廊中线 waypoint 即可
- 不制作精细骨骼动画/行走循环帧动画，用弹跳和摆动模拟即可
- 不改变现有 Agent 状态机和事件处理逻辑
- 不改动 Gateway RPC 协议

## Decisions

### 1. Waypoint 路径生成策略

**选择**：基于走廊中线的固定 waypoint 图。

办公室十字走廊有一个中心交叉点 `(corridorCenterX, corridorCenterY)`。每个 zone 到走廊有一个"门口"点。路径规划：`起点 → 起点 zone 门口 → 走廊节点(s) → 终点 zone 门口 → 终点`。

走廊节点图（SVG 坐标）：
```
corridorCenterX = OFFICE.x + (OFFICE.width - corridorWidth) / 2 + corridorWidth / 2
corridorCenterY = OFFICE.y + (OFFICE.height - corridorWidth) / 2 + corridorWidth / 2
```

每个 zone 的门口点位于该 zone 靠走廊侧的中点。路径只需要经过 1-3 个走廊节点（走到门口→沿走廊→到目标门口），无需 A* 寻路。

**备选方案**：直线移动（不经走廊）→ 会穿墙，视觉不合理。A* 网格寻路 → 过于复杂。

### 2. 动画驱动方式

**选择**：store 中只存 `movementState: { path: Point[], progress: number, speed: number } | null`；2D 用 `requestAnimationFrame` 驱动 progress 递增并插值位置；3D 用 `useFrame` 驱动。

不用 React state 逐帧触发 re-render，而是在 AgentAvatar 组件内维护 local ref 直接更新 SVG transform，避免每帧 React 渲染开销。

**备选方案**：CSS transition（SVG transform transition 对 translate 支持有限）→ 无法走弯路。GSAP 动画库 → 新增依赖，且难以与 React Three Fiber 联动。

### 3. 休息区预填充

**选择**：`initAgents` 后立即在 store 中创建 maxSubAgents 个 placeholder VisualAgent，`isPlaceholder: true`，半透明渲染在休息区。真实 sub-agent 到达时激活对应 placeholder 并触发行走动画。

占位 Agent 不参与 metrics 计算和事件处理。渲染时用 opacity: 0.3 + 虚线 status ring 区分。

### 4. 步速与最低动画时长

**选择**：SVG 坐标系步速 120px/s（`WALK_SPEED_SVG = 120`），3D 步速自动换算。每次行走动画至少 1.5 秒（`MIN_WALK_DURATION = 1.5`）。如果路径太短导致不足 1.5 秒，则降低步速至 `pathLength / 1.5`。

### 5. 行走视觉效果

**2D**：
- Agent 头像沿路径匀速移动
- 移动过程中 avatar 有轻微上下弹跳（`bobAmplitude = 2px, bobFreq = 8Hz`）
- 出发时有 0.3s "站起" scale 动画（从 0.9 → 1.0）
- 到达时有 0.3s "落座" scale 动画（从 1.0 → 0.95 → 1.0）
- 移动中状态环变为蓝色虚线（表示"行走中"）

**3D**：
- 降低 lerp 因子至 `Math.min(2.5 * delta, 0.1)` 使移动可见
- 行走时 body group 有左右轻摆（`Math.sin(t * 8) * 0.08 rad`）
- 行走时有上下弹跳（`Math.abs(Math.sin(t * 8)) * 0.03`）

### 6. 会议室聚集改进

保留现有的 `detectMeetingGroups` + `applyMeetingGathering` 逻辑，但 `moveToMeeting` 改为触发行走动画而非瞬时坐标变化。`returnFromMeeting` 同理。

### 7. Mock Sub-agent 模拟

在 `mock-adapter.ts` 中增加 `SubAgentSimulator` 类，连接成功后 5s 开始周期循环：
- 每隔 3-8s 随机创建一个 sub-agent（spawn 事件）
- sub-agent 经历：idle(lounge) → thinking(走向热工位) → tool_calling → speaking → idle(走回休息区) → removed
- 同时最多模拟 3 个活跃 sub-agent

## Risks / Trade-offs

| 风险 | 缓解 |
|------|------|
| 大量 Agent 同时行走可能导致动画卡顿 | waypoint 路径计算 O(1)，动画用 ref 直接更新 DOM 不走 React 渲染 |
| 路径在走廊交叉处可能碰撞（多个 Agent 同时经过） | 不做碰撞避让（过于复杂），接受短暂重叠 |
| 行走动画期间 Agent 状态可能变化 | movement 动画可以被新的 zone 迁移取消并重新规划 |
| placeholder Agent 占用内存 | 最多 12 个，开销可忽略 |
| 3D lerp 降速后可能与 2D 动画时长不一致 | 3D 也使用 waypoint + progress 系统保持同步 |
