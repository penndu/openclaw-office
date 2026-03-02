## ADDED Requirements

### Requirement: 拟人化 Agent 图标展示

系统 SHALL 在 2D 视图中使用拟人化的图标（如 Bot, User 等）或精美的 SVG 组合来展示 Agent，取代原有的简单字母圆点。

#### Scenario: 渲染拟人化图标

- **WHEN** AgentDot 组件加载时
- **THEN** 系统 SHALL 根据 Agent 的属性（如名称或类型）渲染对应的拟人化图标，图标需包含在具有状态颜色光晕或边框的圆形背景中。

### Requirement: 悬浮提示框视觉优化

系统 SHALL 优化 Agent 悬浮提示框的视觉效果，增加毛玻璃背景和柔和阴影。

#### Scenario: 悬浮提示框展示

- **WHEN** 鼠标悬停在 Agent 图标上
- **THEN** 系统 SHALL 展示带有 `backdrop-filter: blur` 和 `box-shadow` 的提示框，提升视觉层次感。
