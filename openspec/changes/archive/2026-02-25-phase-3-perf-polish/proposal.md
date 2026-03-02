## Why

Phase 3 前三个 Milestone 增加了后处理特效、Force Action 交互、监控图表等较多功能，在大量 Agent 场景（50+）下可能出现性能问题。同时，当前 2D 模式仍通过 OfficeView 组件间接关联 3D 代码路径（虽已 lazy-load Scene3D，但图表组件 Recharts 等未按需加载），移动端适配也完全缺失。作为 Phase 3 的收尾，需要进行性能优化、响应式适配、文档完善和 E2E 测试覆盖，确保 v1.0 发布品质。

## What Changes

- **InstancedMesh 优化**：当 Agent 数量 > 20 时，使用 InstancedMesh 批量渲染角色身体，减少 draw call
- **LOD（Level of Detail）系统**：基于相机距离自动切换渲染精度——近距完整角色+特效、中距简化角色+状态点、远距仅状态色点
- **代码分割优化**：Recharts 图表组件懒加载、确保 2D 模式完全不加载 Three.js bundle
- **响应式适配**：小屏幕（<768px）自动切换 2D 模式、侧栏折叠为底部抽屉、面板适配移动端
- **文档完善**：更新 README.md 最终版使用说明、部署指南
- **E2E 测试**：覆盖关键用户流程的端到端测试

## Capabilities

### New Capabilities

- `instanced-rendering`: InstancedMesh 批量渲染优化（Agent > 20 时自动启用）
- `lod-system`: 基于相机距离的多级渲染精度切换
- `responsive-layout`: 小屏幕响应式适配（自动 2D + 底部抽屉布局）
- `e2e-tests`: 关键流程 E2E 测试集

### Modified Capabilities

- `panel-system`: 图表组件懒加载优化

## Impact

- **修改文件**:
  - `src/components/office-3d/AgentCharacter.tsx` — InstancedMesh 优化 + LOD 实现
  - `src/components/office-3d/Scene3D.tsx` — LOD 计算逻辑
  - `src/App.tsx` — 响应式适配逻辑
  - `src/components/layout/AppShell.tsx` — 移动端底部抽屉布局
  - `src/components/layout/Sidebar.tsx` — 小屏幕折叠行为
  - `src/components/panels/MetricsPanel.tsx` — 图表懒加载
  - `README.md` — 最终版文档
- **新增文件**:
  - `src/components/office-3d/InstancedAgents.tsx`
  - `src/hooks/useResponsive.ts`
  - `src/__tests__/e2e/` — E2E 测试文件
- **测试**: E2E 测试覆盖启动、事件渲染、视图切换、Agent 选中、面板展示
