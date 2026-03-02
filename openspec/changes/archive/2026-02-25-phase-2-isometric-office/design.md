## Context

Phase 1 已交付完整的 2D SVG 办公室可视化。当前代码状态：

- **gateway 层**完全就绪：ws-client（认证/重连）、rpc-client（agents.list/usage.status）、event-parser（lifecycle/tool/assistant/error 四种 stream 解析）
- **store 层**完全就绪：Zustand + Immer，VisualAgent CRUD，事件批处理，协作链接维护，viewMode 字段已定义但未在 UI 使用
- **2D 渲染层**完全就绪：FloorPlan（SVG 1200×700）、AgentDot（状态色彩圆点）、ConnectionLine（虚线）、SpeechBubble（HTML overlay）
- **面板系统**完全就绪：Sidebar（搜索/过滤）、AgentDetailPanel、MetricsPanel、EventTimeline

Phase 2 需要在不破坏 2D 功能的前提下，增量引入 3D 渲染层。关键约束：

- `VisualAgent.position` 当前为 `{ x: number; y: number }`（2D SVG 坐标系），3D 渲染需要坐标映射
- `position-allocator.ts` 返回 2D 坐标，3D 场景需要 `(x, 0, z)` 映射
- Gateway 不广播 subagent_spawned/subagent_ended 事件（源码确认），Sub-Agent 检测必须通过 RPC `sessions.list` 轮询
- package.json 尚未包含 three / @react-three/fiber / @react-three/drei 依赖

## Goals / Non-Goals

**Goals:**

1. 实现 isometric 2.5D 办公室场景，Agent 以拟人化"小人"角色呈现，有状态动画（呼吸/思考/工具/说话/错误）
2. 实现 2D↔3D 视图无缝切换，两种模式共享同一个 Zustand store 和事件处理链路
3. 实现 Sub-Agent 生命周期可视化，包括派生动画、消亡动画、父子连线
4. 实现会议区协作聚集——协作中的 Agent 自动围坐到会议桌旁
5. 为所有新增 3D 组件和 Sub-Agent 逻辑建立测试覆盖

**Non-Goals:**

- 不引入 GLTF 模型（Phase 3，本阶段使用 BoxGeometry / CapsuleGeometry）
- 不实现后处理特效（Bloom / SSAO 属 Phase 3）
- 不实现 Force Action 实际功能（底部操作栏 Phase 2 仅做 UI 壳）
- 不实现日/夜模式切换（Phase 3）
- 不修改 Gateway 源码

## Decisions

### D1: 3D 场景 — React Three Fiber + Perspective Isometric + 可交互旋转

**决策**：使用 R3F `<Canvas>` + PerspectiveCamera（fov=45），初始位置 `[12, 10, 12]` lookAt 场景中心，通过 drei `<OrbitControls>` **允许旋转**、平移、缩放。限制垂直旋转角度（minPolarAngle=π/6, maxPolarAngle=π/3）防止视角过于极端。

**理由**：

- 透视相机 + 受限旋转提供更真实的建筑感，用户可自由探索办公室
- 限制极角范围保持 isometric 风格的俯视感，不会翻转到底部
- 参考设计稿（图2/图5）均为可自由旋转的 3D 建筑视角
- 原方案禁止旋转导致用户无法查看被遮挡的区域

**备选考虑**：

- OrthographicCamera + 禁旋转：过于扁平，无法体现建筑感，与设计稿差距大（已淘汰）
- CSS 3D Transform 伪等距：无法实现真正的 3D 灯光/阴影，角色动画受限

### D2: 坐标系统 — 2D 坐标为主，3D 层做线性映射

**决策**：`VisualAgent.position` 保持 `{ x, y }` 的 2D 坐标系（与 Phase 1 兼容），3D 场景通过 `position2dTo3d(pos)` 映射函数转换：`{ x: pos.x * SCALE, y: 0, z: pos.y * SCALE }`。SCALE = 0.01（将 SVG 1200×700 映射到 Three.js 12×7 世界单位）。

**理由**：

- 不破坏 2D 渲染——position 字段和 allocator 完全不变
- 3D 只是 2D 坐标的投影，两个视图显示同样的空间关系
- 映射函数简单可靠，无需维护两套坐标系

### D3: 办公室建筑结构 — 仿真多房间布局

**决策**：参考设计稿（图1/图2/图5），办公室呈现为带有墙壁、地板、隔间的 isometric 建筑。主要结构：

- **地板**：深色带微光质感，各功能区域用不同颜色地面区分
- **墙壁**：半透明或开放式墙壁（高度约 2 世界单位），边缘有轮廓线，模拟"剖面图"效果
- **窗户**：墙面上的发光矩形，增加空间感
- **隔间/分区**：用低矮半透明墙分隔不同功能区
- **楼梯**：连接不同功能区的装饰性楼梯（纯视觉元素）

建筑整体尺寸约 16×12 世界单位，场景中心在 `[8, 0, 6]`。

**理由**：

- 设计稿明确要求"真实办公室建筑感"，不是简单的平面分区
- 墙壁和窗户提供深度感和空间包裹感，使 Agent 像在真实办公室中工作
- 半透明/开放式设计保证所有区域可见，不会被完全遮挡

### D3b: Agent 角色几何体 — CapsuleGeometry + SphereGeometry

**决策**：每个 Agent 角色由两个 Mesh 组成：

- 身体：`CapsuleGeometry(radius=0.15, length=0.4)` — 胶囊体
- 头部：`SphereGeometry(radius=0.12)` — 球体，position `[0, 0.5, 0]`（身体顶部上方）

角色高度约 0.7 世界单位，桌面高度 0.4 单位，形成"坐在桌前"的视觉比例。

**理由**：

- 胶囊体+球头是最简洁的拟人化方案，无需外部模型
- Phase 3 可平滑替换为 GLTF 人物模型，只需改 geometry 不改 logic
- 材质使用 `MeshStandardMaterial`，支持灯光阴影

### D4: 状态动画 — useFrame 实现，6 种视觉差异化

**决策**：

| 状态           | 动画实现                                             | 视觉效果               |
| -------------- | ---------------------------------------------------- | ---------------------- |
| `idle`         | `body.position.y += sin(time * 2) * 0.02`            | 轻微上下浮动（呼吸感） |
| `thinking`     | 头顶 `TorusGeometry` 以 `rotation.z += dt * 3` 旋转  | 加载圈转动             |
| `tool_calling` | 面前 `PlaneGeometry(0.5,0.35)` 半透明材质 + 轻微浮动 | 虚拟屏幕               |
| `speaking`     | drei `<Html>` 组件在头顶渲染 SpeechBubble            | Markdown 气泡          |
| `error`        | 头顶 `OctahedronGeometry(0.1)` 红色 + 缓慢旋转       | 红色警示菱形           |
| `spawning`     | 3 个同心 `RingGeometry` 旋转 + 缩放脉冲              | 传送门光环             |

**理由**：

- 每种状态在 3D 空间中有鲜明的视觉辨识度，即使在缩小视角下也能一眼区分
- `useFrame` 是 R3F 推荐的逐帧动画方案，性能好
- speaking 用 HTML overlay（drei `<Html>`）而非 3D text，因为 Markdown 渲染需要 DOM

### D5: Sub-Agent 检测 — RPC 轮询 sessions.list

**决策**：每 3 秒调用 `sessions.list` RPC，对比前后两次结果的 diff 检测 Sub-Agent 的新增和消亡。新出现的 session 且 `requesterSessionKey` 指向已知 Agent 的，标记为 Sub-Agent。

**理由**：

- Gateway 源码确认 `subagent_spawned` / `subagent_ended` 仅作为 plugin hook 在进程内触发，不通过 WebSocket 广播给客户端
- RPC 轮询是文档明确推荐的降级方案
- 3 秒间隔在检测延迟和 Gateway 负载之间取得平衡

**备选考虑**：

- Agent 事件流推断：lifecycle start 事件含 runId，可尝试从 sessionKey 推断父子关系，但信息不完整（缺少 task/label/endedReason）
- 修改 Gateway 广播：需要改动主项目，Phase 2 不做

### D6: Sub-Agent 外观 — 半透明蓝色 + 缩放脉冲

**决策**：Sub-Agent 角色使用 `MeshStandardMaterial({ transparent: true, opacity: 0.6, color: "#60a5fa" })`，并附加 `scale` 脉冲动画（`1.0 + sin(time * 3) * 0.05`）模拟"边缘发光"效果。

**理由**：

- 半透明+蓝色调使 Sub-Agent 在视觉上明确区别于常驻 Agent（不透明+个性化颜色）
- 缩放脉冲比真正的发光 shader 性能开销小得多，Phase 3 可升级

### D7: 会议区聚集 — 保存原位 + 平滑过渡 + 环坐排列

**决策**：当 CollaborationLink 触发会议模式时：

1. 保存参与 Agent 的 `originalPosition`
2. 计算会议桌中心坐标（Meeting Zone 中心）
3. 按 Agent 数量等角分布在圆桌周围（`angle = 2π * i / n, radius = 1.5`）
4. 通过 `useSpring` 或 lerp 实现 position 平滑过渡（800ms）
5. 协作结束后恢复 `originalPosition`（同样平滑过渡）

**理由**：

- 保存原位确保协作结束后 Agent 回到"自己的工位"
- 等角分布围坐效果自然，类似真实会议场景
- 平滑动画让用户理解"Agent 走向会议室"的过程

### D8: 3D 模块懒加载 — React.lazy + Suspense

**决策**：3D 场景组件 `Scene3D` 通过 `React.lazy(() => import('./office-3d/Scene3D'))` 懒加载。2D 模式下不加载 three.js。

**理由**：

- three.js + R3F + drei 合计 ~500KB gzipped，不应阻塞首屏
- 多数用户初次使用 2D 模式，3D 仅在切换时按需加载
- Suspense fallback 显示加载进度，用户体验流畅

### D9: 测试策略 — 分层覆盖 3D 逻辑 + Sub-Agent 状态

**决策**：

- **单元测试**：position-allocator 3D 映射、Sub-Agent diff 检测逻辑、会议区位置计算、avatar-generator 3D 颜色
- **store 测试**：Sub-Agent 增删、会议区 position 保存/恢复、viewMode 切换
- **组件测试**：AgentCharacter 渲染（使用 @react-three/test-renderer 或 snapshot）、SubAgentPanel 列表展示
- **集成测试**：sessions.list 轮询 + Sub-Agent diff → store 更新链路
- 3D Canvas 渲染测试使用 mock canvas（vitest 的 jsdom 不支持 WebGL，需 mock）

## Risks / Trade-offs

**[R1] WebGL 兼容性** → 少数浏览器/设备不支持 WebGL。缓解：检测 WebGL 支持，不支持时自动锁定 2D 模式并禁用切换按钮。

**[R2] 3D 性能 — 50 Agent 场景帧率** → CapsuleGeometry 每个角色约 500-1000 三角面，50 个 Agent 可能影响低端设备帧率。缓解：Phase 2 先不做 InstancedMesh 优化（Phase 3 范围），但使用简单几何体（非 GLTF）控制面数。如果运行时检测 <20fps 则建议用户切回 2D。

**[R3] sessions.list 轮询延迟** → 3 秒轮询间隔意味着 Sub-Agent 出现/消亡最多延迟 3 秒感知。可接受——Sub-Agent 通常运行数十秒到数分钟，3 秒延迟不影响监控体验。

**[R4] 会议区碰撞** → 多组协作同时发生时，Agent 可能在会议区位置重叠。缓解：支持多个会议桌（会议区足够大，可容纳 2-3 组会议），按 sessionKey 分组。

**[R5] Three.js 在 Vitest/jsdom 中不可用** → jsdom 不支持 WebGL context，3D 组件无法在标准 vitest 环境渲染。缓解：3D 组件测试使用 mock canvas + @react-three/test-renderer，或仅测试非渲染逻辑（props、状态映射）。
