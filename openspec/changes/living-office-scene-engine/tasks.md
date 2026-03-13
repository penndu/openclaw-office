## 1. 主题与基础设施

- [x] 1.1 创建 `src/components/living-office/theme/living-office-vars.css`，定义所有 `--lo-*` CSS 变量（颜色、阴影、模糊参数）
- [x] 1.2 创建 `src/components/living-office/types.ts`，定义 Living Office 专用类型（ZoneConfig、DeskConfig、DeskStatus 等）
- [x] 1.3 在 Tailwind 配置中注册 Living Office 主题 CSS 文件的引入

## 2. 场景渲染引擎

- [x] 2.1 创建 `scene/OfficeFloor.tsx`——等距地板组件（深蓝渐变 + repeating-linear-gradient 网格纹理）
- [x] 2.2 创建 `scene/CityGrid.tsx`——背景网格组件（60×60px 微透明网格）
- [x] 2.3 创建 `scene/AmbientParticles.tsx`——环境星尘粒子组件（30-40 个 CSS 动画漂浮光点）
- [x] 2.4 创建 `scene/OfficeStage.tsx`——3D 透视容器组件（perspective 1200px + rotateX/rotateZ 等距变换），组合地板+网格+粒子
- [x] 2.5 添加响应式媒体查询（≤1400px 时缩放 + 布局调整）

## 3. 分区布局系统

- [x] 3.1 创建 `zones/ZonePanel.tsx`——通用分区背景面板组件（Glass Morphism 样式 + translateZ 层级）
- [x] 3.2 创建 `zones/ZoneLabel.tsx`——分区标签组件（大写字母 + 胶囊背景 + translateZ 浮动）
- [x] 3.3 定义 `ZONE_CONFIG` 配置对象，包含六个分区的 id、label、position、size
- [x] 3.4 创建 `zones/GatewayZone.tsx`、`zones/StaffZone.tsx`、`zones/OpsZone.tsx`、`zones/CronZone.tsx`、`zones/ProjectZone.tsx`、`zones/MemoryZone.tsx` 六个分区组件

## 4. 工位组件

- [x] 4.1 创建 `workspace/StatusRing.tsx`——状态指示环组件（idle/busy/blocked 三色 + 发光阴影）
- [x] 4.2 创建 `workspace/DeskBubble.tsx`——工位气泡提示组件（淡入浮出 + 2.6s 自动消失）
- [x] 4.3 创建 `workspace/Desk.tsx`——2.5D 工位组件（桌面 + 显示器 + 状态环 + 名称/元标签 + 气泡）
- [x] 4.4 添加 Heartbeat 巡检脉冲 CSS 动画（::after 伪元素扩散光环）
- [x] 4.5 定义 `DESK_CONFIG` 配置对象，包含 5 个工位的 id、agentName、role、position

## 5. 面板组件

- [x] 5.1 创建 `panels/GlassPanel.tsx`——Glass Morphism 基础面板（半透明渐变 + backdrop-filter blur + 圆角投影）
- [x] 5.2 创建 `panels/GatewayCore.tsx`——Gateway 核心面板（标题 + 时钟 + 三总线 + 扫描波动画）
- [x] 5.3 创建 `panels/CronBoard.tsx`——Cron 广播牌面板（任务列表 + mini-row 样式）
- [x] 5.4 创建 `panels/BroadcastBeacon.tsx`——广播波纹信标（橙色圆点 + 双层扩散波纹动画）
- [x] 5.5 创建 `panels/OpsBoard.tsx`——运营行为板面板（组织行为规则列表）
- [x] 5.6 创建 `panels/ProjectRoom.tsx`——临时项目室面板（协作任务列表/占位文本）
- [x] 5.7 创建 `panels/MemoryWall.tsx`——共享记忆墙面板（最近 2-3 条记忆条目）

## 6. 主视图与路由集成

- [x] 6.1 创建 `LivingOfficeView.tsx`——主视图入口组件，组合 OfficeStage + 所有分区 + 工位 + 面板
- [x] 6.2 在 `App.tsx` 中新增 `/living-office` 路由，使用 `AppShell` 布局包裹 `LivingOfficeView`
- [x] 6.3 验证新路由可正常访问，场景渲染效果与示例原型一致

## 7. 测试

- [x] 7.1 为 `GlassPanel`、`Desk`、`StatusRing` 编写基础渲染测试
- [x] 7.2 为 `DeskBubble` 编写显示/自动隐藏交互测试
- [x] 7.3 验证 TypeScript 类型检查通过（`pnpm typecheck`）
- [x] 7.4 验证 Lint 检查通过（`pnpm lint`）
