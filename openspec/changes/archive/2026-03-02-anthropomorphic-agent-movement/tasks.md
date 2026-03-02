## 1. 类型定义与数据结构

- [x] 1.1 在 `gateway/types.ts` 中新增 `MovementState` 类型（`path: Point[]`, `progress: number`, `duration: number`, `startTime: number`, `fromZone: Zone`, `toZone: Zone`）
- [x] 1.2 在 `VisualAgent` 类型中新增 `movement: MovementState | null`（默认 `null`）和 `isPlaceholder: boolean`（默认 `false`）字段
- [x] 1.3 在 `OfficeStore` 接口中新增 `startMovement`、`tickMovement`、`completeMovement`、`prefillLoungePlaceholders` action

## 2. 运动引擎核心模块

- [x] 2.1 创建 `src/lib/movement-animator.ts`，实现走廊节点图定义：`corridorCenter`、四个 zone 的 `doorPoint`
- [x] 2.2 实现 `planWalkPath(from, to, fromZone, toZone): Point[]`，生成经走廊的 waypoint 路径
- [x] 2.3 实现 `calculateWalkDuration(path): number`，基于 `WALK_SPEED_SVG=120` 和 `MIN_WALK_DURATION=1.5` 计算时长
- [x] 2.4 实现 `interpolatePathPosition(path, progress): Point`，沿路径插值返回当前位置
- [x] 2.5 编写 `movement-animator.test.ts` 单元测试：路径生成（同 zone、相邻、对角）、时长计算、插值精度

## 3. Store 层动画集成

- [x] 3.1 在 `office-store.ts` 中实现 `startMovement(agentId, toZone)` action：调用 `planWalkPath` 生成路径，设置 `agent.movement`
- [x] 3.2 在 `office-store.ts` 中实现 `tickMovement(agentId, deltaTime)` action：更新 `movement.progress`，通过 `interpolatePathPosition` 更新 `agent.position`
- [x] 3.3 在 `office-store.ts` 中实现 `completeMovement(agentId)` action：清除 `movement`，设置最终 `zone` 和 `position`
- [x] 3.4 将 `migrateAgentToHotDesk` 改为调用 `startMovement(agentId, "hotDesk")`
- [x] 3.5 将 `migrateAgentToLounge` 改为调用 `startMovement(agentId, "lounge")`
- [x] 3.6 将 `moveToMeeting` 改为调用 `startMovement(agentId, "meeting")`（保存 originalPosition 后）
- [x] 3.7 将 `returnFromMeeting` 改为调用 `startMovement`，目标为 originalPosition 所在的 zone

## 4. 休息区预填充

- [x] 4.1 在 `office-store.ts` 中实现 `prefillLoungePlaceholders(count)` action：创建 N 个 placeholder VisualAgent
- [x] 4.2 在 `initAgents` 末尾调用 `prefillLoungePlaceholders(maxSubAgents)`
- [x] 4.3 修改 `addSubAgent`：查找第一个可用 placeholder 激活为真实 Agent，并调用 `startMovement` 到 hotDesk
- [x] 4.4 修改 `removeSubAgent`：如果该 Agent 由 placeholder 激活，恢复 placeholder 状态
- [x] 4.5 修改 `computeMetrics`：排除 `isPlaceholder === true` 的 Agent

## 5. 2D 行走动画渲染

- [x] 5.1 修改 `AgentAvatar.tsx`：当 `agent.movement !== null` 时，使用 `requestAnimationFrame` 驱动位置更新
- [x] 5.2 实现 2D 行走弹跳效果：振幅 2px、频率 8Hz 的正弦上下偏移
- [x] 5.3 实现 2D 出发站起效果：progress < 0.1 时 scale 从 0.9 → 1.0
- [x] 5.4 实现 2D 到达落座效果：progress > 0.9 时 scale 从 1.0 → 0.95 → 1.0
- [x] 5.5 实现行走中状态环样式：蓝色虚线 `strokeDasharray="4 3"`
- [x] 5.6 修改 `FloorPlan.tsx`：placeholder Agent 以 opacity: 0.3 + 虚线状态环渲染
- [x] 5.7 确保行走中 Agent 在走廊区域不被 zone 层遮挡（渲染层级调整）

## 6. 3D 行走动画渲染

- [x] 6.1 修改 `AgentCharacter.tsx`：当 `agent.movement !== null` 时降低 lerp 因子至 `Math.min(2.5 * delta, 0.1)`
- [x] 6.2 实现 3D 行走身体摆动：左右旋转 ±0.08 弧度、频率 8Hz
- [x] 6.3 实现 3D 行走弹跳：`Math.abs(Math.sin(t * 8)) * 0.03` 垂直偏移
- [x] 6.4 行走结束后恢复正常呼吸动画（原有 `Math.sin(t * 2) * 0.02`）
- [x] 6.5 placeholder Agent 在 3D 中使用 `transparent: true, opacity: 0.25` 渲染

## 7. 会议室动画集成

- [x] 7.1 修改 `applyMeetingGathering`：改为调用 `startMovement` 而非直接 `moveToMeeting`
- [x] 7.2 修改 `returnFromMeeting` 的调用方：改为 `startMovement` 行走回原 zone
- [x] 7.3 避免行走中重复触发：`movement.toZone === "meeting"` 时跳过
- [x] 7.4 确保行走中 Agent 的 ConnectionLine 端点跟随插值位置

## 8. Mock 模式 sub-agent 模拟

- [x] 8.1 在 `mock-adapter.ts` 中创建 `SubAgentSimulator` 类（定时器、状态机）
- [x] 8.2 实现 mock sub-agent 创建循环：连接后 5s 开始，每 3~8s 创建一个
- [x] 8.3 实现 mock sub-agent 工作流程：thinking → tool_calling → speaking → idle
- [x] 8.4 实现 mock sub-agent 结束：idle 8~15s 后发出 lifecycle.end 事件
- [x] 8.5 实现 mock agentToAgent 通信模拟：20s 后开始，每 15~30s 一组
- [x] 8.6 实现并发限制（最多 3 个活跃 mock sub-agent）和断开连接时清理

## 9. Unconfirmed Agent 状态机（根本方案）

- [x] 9.1 `VisualAgent` 新增 `confirmed: boolean` 字段，`AgentZone` 新增 `"corridor"` 类型
- [x] 9.2 `processAgentEvent` 遇到未知 agentId 时，创建 `confirmed: false, zone: "corridor"` 的暂存 agent
- [x] 9.3 新增 `confirmAgent(agentId, role)` action：超时 5s 后自动确认为主 agent → 走路到 desk
- [x] 9.4 `addSubAgent` 中检测 unconfirmed agent 并确认为 sub-agent → 从 lounge placeholder 激活 → 走路到 hotDesk
- [x] 9.5 `removeSubAgent` 清理 `runIdMap`/`sessionKeyMap`/`removedAgentIds`，防止 stale 事件重建 ghost agent
- [x] 9.6 `movement-animator.ts` 支持 `corridor` zone 的 door point 和路径规划
- [x] 9.7 2D `FloorPlan.tsx` 新增 corridorAgents 渲染层；`AgentAvatar.tsx` 对 unconfirmed agent 半透明显示
- [x] 9.8 3D `AgentCharacter.tsx` 对 unconfirmed agent 以 0.35 opacity 渲染
- [x] 9.9 `metrics-reducer.ts` 排除 unconfirmed agent
- [x] 9.10 修复 `SessionSwitcher.tsx` 的 `sessions is not iterable` 预存在问题

## 10. 测试与验证

- [x] 10.1 编写 `movement-animator.test.ts` 完整测试套件
- [x] 10.2 更新 `office-store-subagent.test.ts`：适配新的 movement 动画和 placeholder 逻辑
- [x] 10.3 更新 `meeting-manager.test.ts`：适配动画驱动的会议聚集
- [x] 10.4 更新 `office-store.test.ts`：unknown runId 创建 unconfirmed agent 在 corridor zone
- [x] 10.5 所有 mock VisualAgent 对象添加 `confirmed: true` 字段
- [x] 10.6 全量测试套件 42 files / 321 tests 全部通过
- [x] 10.7 在 mock 模式下浏览器验证：sub-agent 从休息区走向热工位的完整动画
- [x] 10.8 在 mock 模式下浏览器验证：Agent 走向会议室并围桌落座的动画
- [x] 10.9 切换 2D/3D 模式验证智能体列表稳定（16 agents，无 ghost agent 累积）
