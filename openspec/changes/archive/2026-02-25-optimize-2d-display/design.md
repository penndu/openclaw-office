## Context

当前 `src/components/office-2d/` 目录下的 2D 视图使用了基础的 SVG 元素（如纯色矩形、圆形）来表示办公区域和 Agent。这种呈现方式虽然功能上满足了状态展示，但在视觉上缺乏吸引力，无法传达“数字办公室”的隐喻和拟人化特征。

## Goals / Non-Goals

**Goals:**

- 提升 2D 办公区域的视觉质感（增加阴影、圆角、渐变、边框细节）。
- 优化 Agent 的展示，使用更拟人化的图标或更丰富的 SVG 组合代替简单的字母圆点。
- 优化连线动画，使其更具流动感和科技感。
- 保持与现有状态管理（Zustand）和数据结构的兼容。

**Non-Goals:**

- 不引入 3D 渲染（保持在 2D SVG/HTML 范围内）。
- 不改变现有的 WebSocket 数据结构和 Gateway 协议。
- 不修改面板（Panels）的整体布局。

## Decisions

1. **SVG 样式升级**: 使用 SVG 的 `<defs>` 定义渐变（Gradients）和滤镜（Filters，如阴影 `feDropShadow`），应用于办公区域的背景，使其具有轻微的立体感和质感。
2. **拟人化 Agent**: 引入 `lucide-react` 中的图标（如 `Bot`, `User`, `Cpu` 等）作为 Agent 的形象，或者使用更精美的 SVG 组合代替单一的 `<circle>`。将状态颜色（绿/黄/红）应用在图标的背景光晕或边框上。
3. **动态连线**: 使用 SVG 的 `stroke-dasharray` 和 `stroke-dashoffset` 配合 CSS 动画，实现连线上的流动虚线效果，模拟数据流传输。
4. **悬浮提示优化**: 优化 Agent 悬浮时的提示框，增加毛玻璃效果（`backdrop-filter`）和更柔和的阴影。

## Risks / Trade-offs

- **性能风险**: 过多的 SVG 滤镜（如阴影）和动画可能导致渲染性能下降。
  - **Mitigation**: 限制阴影的模糊半径，仅对关键元素（如选中的 Agent 或活跃的连线）启用复杂动画。
- **兼容性风险**: 某些旧版浏览器对 SVG 滤镜支持不佳。
  - **Mitigation**: 提供优雅降级，确保在滤镜失效时仍有清晰的纯色备用方案。
