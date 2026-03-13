## Why

当前 Office 视图采用 2D SVG 平面图 + 3D R3F 双模式渲染，存在以下核心问题：

1. **2D 模式过于扁平**——纯 SVG 平面图无法传递"办公室空间感"，Agent 像棋子而非员工，缺乏沉浸式的组织运转感知
2. **3D 模式过于沉重**——R3F/Three.js 体系带来巨大的包体积和渲染开销，且等距视角下 3D 的深度优势无法充分展现
3. **两套渲染系统并存维护成本高**——2D→3D 坐标映射、双重组件体系、双份测试覆盖
4. **缺乏"公司活性"表达**——现有实现把 Agent 当成状态指示灯，而非"在一个活着的办公室里工作的员工"

产品蓝图已验证 2.5D CSS Transform + DOM 渲染方案可以在深色科技美学下实现等距视角办公室，兼具空间感和轻量化优势。本提案构建 2.5D 场景渲染引擎和基础空间布局，作为整个 Living Office 重写的地基。

## What Changes

- **新增 2.5D 场景渲染引擎**：基于 CSS `perspective` + `rotateX/rotateZ` 的等距视角渲染系统，替代 SVG 平面图和 R3F 3D 场景
- **新增办公室空间分区组件**：Gateway 中控大厅、正式员工工区（Staff Floor）、运营行为板（Operations Board）、Cron 广播区、临时项目室、共享记忆墙，每个分区为独立 React 组件
- **新增地板/网格/环境系统**：等距地板砖纹理、城市网格背景、深色科技办公室氛围光效、星尘粒子环境
- **新增工位组件**：2.5D 透视工位（桌面、显示器、状态指示环），支持 idle/busy/blocked/heartbeat 四种状态视觉表达
- **新增 Gateway 核心组件**：中控台面板（Provider Mesh / Event Spine / Dispatch Queue 总线可视化）、事务传送带动画、扫描波光效
- **新增面板子组件**：Cron 广播牌、运营行为板、临时项目室面板、共享记忆墙面板——均为 Glass Morphism 风格
- **旧 2D/3D 实现保留不动**，新实现注册到独立路由入口，待验收后再切换

## Capabilities

### New Capabilities
- `scene-2d5-renderer`: 2.5D 等距视角场景渲染引擎——CSS perspective 变换、地板/网格/环境系统、深色科技美学主题
- `office-zone-layout`: 办公室空间分区与布局系统——六大功能区（Gateway/Staff/Ops/Cron/Project/Memory）的位置、尺寸、层级管理
- `workspace-components`: 工位与设施组件库——2.5D 工位、Gateway 核心面板、Cron 广播牌、运营行为板、项目室、记忆墙等 Glass Morphism 面板组件

### Modified Capabilities

（本子提案不修改现有能力，新旧并存）

## Impact

- **新增文件**：`src/components/living-office/` 目录下约 15-20 个组件文件
- **新增样式**：Tailwind CSS 4 自定义主题扩展（Living Office 色板、Glass Morphism 工具类）
- **不影响现有代码**：旧 `office-2d/`、`office-3d/` 保持不变
- **依赖**：无新增外部依赖，纯 React + CSS Transform 实现
- **包体积**：预期移除 R3F/drei 后显著缩减，本阶段先新增后再评估
