## Context

当前 Office 视图由两套独立渲染系统驱动：

- **2D 模式**（`FloorPlan.tsx`）：基于 SVG viewBox 1200×700，包含 5 个 zone（desk/meeting/hotDesk/lounge/corridor）、家具组件、AgentAvatar 状态指示
- **3D 模式**（`Scene3D.tsx`）：基于 React Three Fiber + drei，包含 OfficeLayout3D、AgentCharacter、SpawnPortal 等组件

两套系统共享 `office-store` 状态，但各自有独立的布局逻辑和坐标系。产品蓝图已验证 2.5D CSS Transform 方案可以在单一渲染路径下同时提供空间感和轻量化优势。

示例原型 `openclaw_living_office_preview.html` 使用纯 CSS `perspective: 1200px` + `rotateX(58deg) rotateZ(-28deg)` 实现等距视角，所有元素用 `translateZ()` 分层，视觉效果已经达到产品级别。

## Goals / Non-Goals

**Goals:**

- 构建基于 CSS 3D Transform 的 2.5D 等距渲染引擎，作为 Living Office 的唯一渲染路径
- 实现六大功能分区的空间布局系统，位置、尺寸、层级可配置
- 构建深色科技办公室主题系统（CSS 变量 + Tailwind 扩展）
- 实现工位、Gateway 核心、面板等基础设施组件（Glass Morphism 风格）
- 确保新组件以独立路由挂载，不影响现有 2D/3D 代码

**Non-Goals:**

- 本子提案不包含 Agent 角色系统和动画引擎（由子提案3负责）
- 本子提案不包含感知层/事件聚合逻辑（由子提案2负责）
- 本子提案不包含 HUD/日志/控制台 overlay（由子提案4负责）
- 本子提案不处理 Gateway WebSocket 事件接入（依赖感知层完成后接入）
- 不做镜头飞行/聚焦动画（V2 再考虑）

## Decisions

### D1: 渲染技术选型——CSS 3D Transform 而非 PixiJS/Canvas

**选择**：纯 React + CSS `perspective` / `rotateX` / `rotateZ` / `translateZ`

**理由**：
- 产品蓝图建议 V1 用 HTML/CSS/JS 做原型，V2 再考虑 PixiJS。当前阶段目标是先让场景"活起来"，CSS Transform 已能满足
- 示例原型验证了 CSS 方案的视觉质量——深色科技感、Glass Morphism、等距视角均已达产品级
- DOM 渲染天然支持文本渲染、事件绑定、CSS 动画、i18n，避免 Canvas 文本栅格化和可访问性问题
- 不引入新的重渲染引擎依赖（PixiJS ~150KB），保持技术栈简洁
- 如果未来需要迁移到 PixiJS，空间布局数据和组件接口可以复用

**备选方案**：
- PixiJS：性能更好但引入新依赖，V1 阶段不需要处理上百个并发动画
- Canvas 2D：失去 DOM 事件和 CSS 样式优势
- 保留 R3F：过重，等距场景不需要真 3D

### D2: 等距视角参数

**选择**：`perspective: 1200px; rotateX(58deg) rotateZ(-28deg)`（与示例原型一致）

**理由**：
- 58° X 轴旋转提供合适的俯视角度，让工位和分区都清晰可见
- -28° Z 轴旋转创造经典等距偏移，增加空间层次
- 1200px 透视距离提供适度的深度收敛，不会过于夸张

### D3: 空间坐标系

**选择**：绝对定位 + px 单位，容器尺寸 1380×820，通过 CSS `scale()` 自适应视口

**理由**：
- 与示例原型一致，便于从原型快速迁移
- 绝对定位在等距 3D Transform 下表现可预测
- `translateZ()` 控制层级深度，不依赖 z-index 堆叠
- 响应式通过外层容器缩放实现，内部坐标保持固定

### D4: 组件目录结构

**选择**：`src/components/living-office/` 独立目录

```
src/components/living-office/
├── LivingOfficeView.tsx      # 主视图入口（对应 FloorPlan/Scene3D 的角色）
├── scene/
│   ├── OfficeStage.tsx       # 3D 透视容器 + 地板 + 网格
│   ├── OfficeFloor.tsx       # 等距地板纹理
│   ├── CityGrid.tsx          # 背景网格
│   └── AmbientParticles.tsx  # 环境星尘粒子
├── zones/
│   ├── ZoneLabel.tsx         # 分区标签
│   ├── ZonePanel.tsx         # 通用分区背景面板
│   ├── GatewayZone.tsx       # Gateway 中控大厅区域
│   ├── StaffZone.tsx         # 正式员工工区
│   ├── OpsZone.tsx           # 运营行为板区域
│   ├── CronZone.tsx          # Cron 广播区
│   ├── ProjectZone.tsx       # 临时项目室区域
│   └── MemoryZone.tsx        # 共享记忆墙区域
├── workspace/
│   ├── Desk.tsx              # 2.5D 工位组件
│   ├── DeskBubble.tsx        # 工位气泡提示
│   └── StatusRing.tsx        # 状态指示环
├── panels/
│   ├── GlassPanel.tsx        # Glass Morphism 基础面板
│   ├── GatewayCore.tsx       # Gateway 核心面板（总线可视化）
│   ├── CronBoard.tsx         # Cron 广播牌
│   ├── OpsBoard.tsx          # 运营行为板
│   ├── ProjectRoom.tsx       # 项目室面板
│   ├── MemoryWall.tsx        # 共享记忆墙面板
│   └── BroadcastBeacon.tsx   # 广播波纹信标
├── theme/
│   └── living-office-vars.css  # CSS 变量主题定义
└── types.ts                  # Living Office 专用类型定义
```

**理由**：
- 与现有 `office-2d/` 和 `office-3d/` 并列，不相互干扰
- 按关注点分层（scene/zones/workspace/panels/theme），便于后续子提案扩展（角色系统加到 `characters/`，HUD 加到 `hud/`）

### D5: 主题系统——CSS 变量 + Glass Morphism

**选择**：在 `living-office-vars.css` 中定义 CSS 自定义属性，组件直接引用

```css
:root {
  --lo-bg: #0b1220;
  --lo-panel: rgba(15, 23, 42, 0.7);
  --lo-line: rgba(148, 163, 184, 0.18);
  --lo-text: #e5eefb;
  --lo-muted: #92a4c6;
  --lo-good: #29d391;
  --lo-warn: #f7b955;
  --lo-bad: #ff667a;
  --lo-cyan: #5cc8ff;
  --lo-violet: #8f7dff;
  --lo-glow: 0 0 0 1px rgba(255,255,255,.04), ...;
}
```

**理由**：
- CSS 变量运行时可切换（未来支持亮色模式只需覆盖变量）
- `--lo-` 前缀避免与全局 Tailwind 变量冲突
- Glass Morphism 通过 `backdrop-filter: blur()` + 半透明背景 + 边框光效实现，不需要额外依赖

### D6: 路由集成策略

**选择**：新增 `/living-office` 路由（开发阶段），待验收后替换 `/` 路由

**理由**：
- 新旧并存，随时可以切换对比效果
- `LivingOfficeView` 使用与旧 `OfficeView` 相同的 `AppShell` 布局，确保 Sidebar/TopBar/ChatDock 一致
- 切换只需修改路由映射，零代码入侵

## Risks / Trade-offs

- **[性能风险] CSS 3D Transform 在大量 DOM 元素下可能卡顿** → 通过 `will-change: transform` 和 `contain: layout paint` 提示浏览器创建合成层；分区面板内容按需渲染；V1 控制总 DOM 节点在 200 以内
- **[视觉一致性] 不同浏览器的 perspective 和 backdrop-filter 表现差异** → 目标浏览器为 Chrome/Edge/Safari 最新版；Firefox backdrop-filter 已支持；提供降级方案（无 blur 的纯半透明背景）
- **[坐标映射] 等距坐标下点击和悬停判定困难** → 所有可交互元素使用 `pointer-events: auto`，面板/工位保持独立 DOM 节点（不依赖 SVG hitTest）
- **[技术债] 新旧两套系统并存期间维护成本** → 明确验收标准后及时清理旧代码；新系统完全独立，不共享渲染组件
