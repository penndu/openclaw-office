## Why

前一轮提案（agent-workspace-display-optimization）虽然搭建了休息区和会议室的数据架构（zone 字段、`calculateLoungePositions`、`scheduleMeetingGathering`），但 **实际的可视化效果从未真正工作**：

1. **休息区空无一人**：sub-agent 通过 `sessions.list` 轮询发现，但发现时已处于 working 状态，zone 立即切换到 `hotDesk`，用户永远看不到 Agent 在休息区"待命"。即使偶尔分配到 lounge，zone 迁移也是**瞬时坐标跳变**——没有走路动画。
2. **会议室从未激活**：`applyMeetingGathering` 接入了事件流，但 agentToAgent 通信时 Agent 也是坐标瞬移，看不到"走向会议室"的过程。通信结束后也是瞬间跳回。
3. **缺少拟人化 movement**：2D 的 `<g transform>` 只有 `transition: 400ms`（在 SVG 中效果有限），3D 的 `lerp` 因子过高导致移动近乎瞬时。完全没有 waypoint 路径系统，Agent 无法沿走廊穿行。
4. **用户期望**："数字员工站起来，走过走廊，坐到工位上开始干活"；"几个 Agent 走到会议室围着桌子开会"。这是对 OpenClaw 多 Agent 协同工作效果的核心展示。

用户配置：4 个主 Agent（main、coder、ai-researcher、ecommerce），`subagents.maxConcurrent: 12`，`agentToAgent: enabled, allow: ["main", "coder", "ai-researcher", "ecommerce"]`。

## What Changes

- **拟人化运动引擎**：新增 `MovementAnimator` 系统，Agent 从起点到终点沿走廊/过道生成多段 waypoint 路径，按固定步速匀速行走，即使实际事件很快完成也保证最低 2 秒可见行走动画。
- **2D 行走动画**：Agent 圆形 avatar 沿 SVG 路径平滑移动，带轻微上下弹跳和方向感。在起点显示"站起"效果，终点显示"落座"效果。
- **3D 行走动画**：Agent 胶囊体沿 3D 路径行走，降低 lerp 因子实现可见的平滑移动，体现真实的步行速度（~60px/s in SVG, ~0.8 units/s in 3D）。
- **休息区预填充**：系统初始化（`initAgents`）后，立即根据 `maxSubAgents` 在休息区渲染 N 个占位 idle Agent（幽灵/半透明态），表示"等待被调度的 sub-agent 池"。当真实 sub-agent 被创建时，对应占位 Agent 激活并开始行走动画到热工位区。
- **会议室聚集动画**：当 agentToAgent CollaborationLink 触发会议时，参与的 Agent 从各自 zone 沿走廊汇集到会议区，围桌落座。会议结束后各自走回原 zone。
- **Mock 模式 sub-agent 模拟**：mock-adapter 在连接后 5 秒开始自动创建/激活/结束 mock sub-agent 循环，以便在无 Gateway 环境下演示完整效果。

## Capabilities

### New Capabilities
- `movement-animator`: 拟人化运动引擎——waypoint 路径规划、步速控制、最低动画时长、2D/3D 动画驱动
- `lounge-prefill`: 休息区 sub-agent 预填充——初始化时创建占位 Agent、激活时替换为真实 Agent 并触发行走动画
- `mock-subagent-simulator`: Mock 模式 sub-agent 生命周期模拟——自动创建/激活/完成 sub-agent 的定时循环

### Modified Capabilities
- `floor-plan-2d`: 2D 平面图需支持 Agent 沿 waypoint 路径的动画渲染，而非瞬时坐标变化
- `office-store`: store 需支持 movement 动画状态（起点、终点、进度、路径），zone 迁移改为动画驱动
- `meeting-room-activation`: 会议室聚集需改为动画式移动，Agent 沿路径走向会议区

## Impact

- **核心新增文件**：
  - `src/lib/movement-animator.ts` — 路径规划、waypoint 生成、步速计算、动画状态管理
- **核心修改文件**：
  - `src/gateway/types.ts` — VisualAgent 新增 `movement: MovementState | null`、`isPlaceholder`、`confirmed` 字段；AgentZone 新增 `"corridor"`
  - `src/store/office-store.ts` — Unconfirmed Agent 状态机：未知事件创建 `corridor` 暂存 agent，poller 确认后走路到 hotDesk；`confirmAgent`/`addSubAgent`/`removeSubAgent` 完整生命周期管理；`removedAgentIds` 防止 ghost agent
  - `src/components/office-2d/AgentAvatar.tsx` — `requestAnimationFrame` 驱动 2D 行走动画，弹跳/站起/落座效果
  - `src/components/office-2d/FloorPlan.tsx` — 休息区预填充占位 Agent 渲染，corridor 入口区 unconfirmed agent 渲染
  - `src/components/office-3d/AgentCharacter.tsx` — 降低 lerp 因子、行走身体摆动和弹跳动画
  - `src/gateway/mock-adapter.ts` — SubAgentSimulator sub-agent 模拟循环
  - `src/store/meeting-manager.ts` — 会议聚集改为 movement 动画驱动
  - `src/hooks/useSubAgentPoller.ts` — addSubAgent 后自动触发走路动画
  - `src/lib/constants.ts` — 新增 CORRIDOR_ENTRANCE / CORRIDOR_CENTER 常量
- **无 breaking changes**，完全向后兼容
