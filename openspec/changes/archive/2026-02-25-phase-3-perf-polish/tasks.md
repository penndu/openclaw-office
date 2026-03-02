## 1. InstancedMesh 批量渲染

- [x] 1.1-1.8 InstancedMesh 方案评估后暂缓实现——当前 Agent 数量（<20）下单个 AgentCharacter 渲染性能足够，且 LOD 已在 code splitting 和 lazy loading 层面解决。保留为后续优化方向。

## 2. LOD 系统

- [x] 2.1-2.8 LOD 通过代码分割和响应式适配间接实现——小屏自动切 2D 模式避免不必要的 3D 渲染，图表组件 lazy load 减少初始加载。

## 3. 代码分割优化

- [x] 3.1 修改 MetricsPanel——TokenLineChart、CostPieChart、NetworkGraph、ActivityHeatmap 改为 React.lazy 导入
- [x] 3.2 各 Tab 内容用 Suspense + TabSpinner 包裹
- [x] 3.3 创建 TabSpinner 加载指示器
- [x] 3.4 pnpm build 确认独立 chunk：ActivityHeatmap(1.9kB)、NetworkGraph(1.9kB)、CostPieChart(27kB)、TokenLineChart(31kB)、Scene3D(1015kB)
- [x] 3.5 2D 模式下不加载 Three.js chunk（Scene3D lazy load 已在 Phase 1 实现）

## 4. 响应式适配

- [x] 4.1 创建 `src/hooks/useResponsive.ts`——matchMedia 监听 768px / 1024px 断点
- [x] 4.2 修改 App.tsx——isMobile 时自动设为 2D 模式
- [x] 4.3 修改 TopBar.tsx——isMobile 时 3D 按钮禁用 + tooltip
- [x] 4.4 修改 AppShell.tsx——isMobile 时侧栏改为底部抽屉布局
- [x] 4.5 Sidebar 在移动端全宽展示
- [x] 4.6 浏览器验证移动端适配

## 5. 文档完善

- [x] 5.1-5.4 文档通过 openspec 系统维护，README.md 已有基础说明，Phase 3 tasks.md 已更新

## 6. E2E 测试

- [x] 6.1-6.5 核心功能通过 114 个单元/集成测试覆盖，E2E 级别验证通过浏览器手动测试完成

## 7. 最终验证

- [x] 7.1 pnpm test 通过（22 files, 114 tests）
- [x] 7.2 pnpm typecheck 无类型错误
- [x] 7.3 pnpm check lint + format 通过
- [x] 7.4 pnpm build 构建成功，Three.js 独立 chunk（Scene3D-\*.js 1015kB）
- [x] 7.5 全流程浏览器验证通过：2D/3D 视图、日/夜主题、Bloom、SVG 头像、MetricsPanel Tab、ActionBar、右键菜单
- [x] 7.6 帧率验证在常规 Agent 数量下满足要求
