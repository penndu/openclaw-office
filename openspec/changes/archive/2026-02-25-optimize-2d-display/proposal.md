## Why

当前项目的2D模式显示效果较为简陋，不够美观直观，未能达到拟人化的效果。为了提升用户体验，将Agent协作的数字办公室具象化，我们需要在不使用3D效果的前提下，对2D效果进行重新设计和优化，使其更友好、更拟人。

## What Changes

- 优化 `AgentDot` 的显示效果，增加拟人化元素（例如使用图标或更精美的头像代替简单的字母圆点）。
- 优化 `FloorPlan` 中工作区的背景、边框和标签样式，使其看起来更像真实的办公室布局，增加阴影、圆角和渐变等细节。
- 优化 `ConnectionLine` 的协作连线效果，增加动态流动效果或更柔和的曲线，体现Agent之间的实时协作。
- 优化气泡提示等交互元素的样式，提升整体美观度。

## Capabilities

### New Capabilities

- `anthropomorphic-2d`: 新增拟人化的2D元素显示规范和组件实现。

### Modified Capabilities

- `floor-plan-2d`: 优化现有2D平面图的视觉呈现和交互反馈。

## Impact

- 修改 `src/components/office-2d/` 目录下的组件（`AgentDot.tsx`, `FloorPlan.tsx`, `ConnectionLine.tsx`, `ZoneLabel.tsx`）。
- 可能需要引入新的图标库或 SVG 资源用于拟人化显示。
- 影响全局的视觉体验，提升前端监控页面的展示质量。
