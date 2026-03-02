## Context

当前 3D 场景中每个 Agent 独立渲染 CapsuleGeometry + SphereGeometry（body + head），50 个 Agent 即 100+ 个 mesh draw call。App.tsx 已对 Scene3D 做了 `React.lazy` 懒加载，但 Recharts 图表组件未懒加载。移动端无任何适配——侧栏固定 280px，面板不可折叠。

Phase 3 性能预算：50 Agent 场景 3D 帧率 ≥ 24fps，2D 模式不加载 Three.js bundle，首屏 LCP < 3s。

## Goals / Non-Goals

**Goals:**

- 50 Agent 场景下 3D 帧率 ≥ 24fps
- 2D 模式 bundle 不包含 Three.js（通过 Vite 代码分割验证）
- 屏幕宽度 < 768px 时自动适配移动端布局
- README.md 包含完整的使用说明和部署指南
- 关键流程有 E2E 测试覆盖

**Non-Goals:**

- 不做 WebWorker offscreen canvas（复杂度过高）
- 不做 PWA/Service Worker
- 不做 SSR（纯客户端 SPA）
- 不做完整的移动端 touch 手势优化（保留基本 tap 交互）

## Decisions

### D1: InstancedMesh — 动态 Agent 批量渲染

**选择**: 当 Agent 数量 > 20 时，使用 THREE.InstancedMesh 合并身体和头部渲染。

**做法**:

- 新建 `InstancedAgents.tsx` 组件
- 一个 InstancedMesh 渲染所有 Agent 的身体（CapsuleGeometry），另一个渲染头部（SphereGeometry）
- 每帧通过 `setMatrixAt` 更新每个 instance 的位置/旋转
- 通过 `setColorAt` 设置每个 instance 的颜色（基于 status/agentId）
- 状态指示器（ThinkingIndicator、ErrorIndicator、SkillHologram）仍独立渲染（数量较少）
- 当 Agent ≤ 20 时，保持当前的独立 AgentCharacter 渲染（减少复杂度）

### D2: LOD 系统 — 基于相机距离的三级渲染

**选择**: 在 Scene3D 中计算相机与场景中心的距离，全局切换 LOD 级别。

**做法**:

- 近距（camera distance < 15）：完整角色 + 气泡 + 特效 + HTML 标签
- 中距（15 ≤ distance < 30）：简化角色（仅身体+头部） + 状态色点（无气泡/HTML overlay）
- 远距（distance ≥ 30）：仅渲染状态色小球（类似 2D 模式的圆点）
- LOD 级别通过 store 或 context 传递给 Agent 组件
- 切换时无动画（即时切换，避免 LOD 过渡带来的额外开销）

### D3: 代码分割 — 图表组件懒加载

**选择**: MetricsPanel 中的图表组件使用 `React.lazy` 加载。

**做法**:

- TokenLineChart、CostPieChart、NetworkGraph、ActivityHeatmap 均使用 lazy import
- 各 Tab 内容用 `<Suspense>` 包裹，fallback 为小型 loading spinner
- Vite build 会自动将 recharts 和图表组件拆分为独立 chunk
- 确认 2D 模式不触发任何 Three.js 或 3D 组件的 import

### D4: 响应式适配 — 断点检测 + 布局切换

**选择**: 新建 `useResponsive` hook，使用 `matchMedia` 监听断点。

**做法**:

- 断点: 768px（sm）、1024px（md）
- < 768px: 自动切换 viewMode 为 "2d"，侧栏变为底部可上滑抽屉（Sheet），面板全宽
- 768px-1024px: 侧栏可折叠（已有 sidebarCollapsed），面板适度压缩
- ≥ 1024px: 当前桌面布局

### D5: E2E 测试 — Vitest + testing-library 模拟关键流程

**选择**: 使用 Vitest 编写模拟 E2E 测试（不引入 Playwright），覆盖关键数据流。

**做法**:

- 测试 App 组件启动 → Mock 模式初始化 → Agent 列表渲染
- 测试 Agent 事件到达 → UI 状态更新
- 测试 viewMode 切换（2D ↔ 3D 组件加载/卸载）
- 测试 Agent 选中 → 详情面板显示
- 不做浏览器级别的 E2E（避免 CI 环境 WebGL 不可用问题）

## Risks / Trade-offs

- **[InstancedMesh 颜色更新性能]** → 每帧更新 50 个 instance color 可能有开销。缓解: 仅在状态变化时更新，而非每帧
- **[LOD 视觉跳变]** → 缩放时角色突然变为色点可能感觉突兀。缓解: 记录此为已知限制，后续可加 crossfade
- **[响应式覆盖不全]** → 不同手机屏幕差异大。缓解: 仅做 768px 断点，覆盖主流平板和手机横屏
- **[E2E 不含真实浏览器]** → 无法测试 WebGL 渲染结果。缓解: 3D 渲染正确性通过手动验证
