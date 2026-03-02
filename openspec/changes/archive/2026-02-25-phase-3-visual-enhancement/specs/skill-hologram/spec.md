## ADDED Requirements

### Requirement: 全息面板在 tool_calling 时显示

当 Agent 进入 `tool_calling` 状态时，SHALL 在 Agent 面前弹出一个半透明的全息面板。面板 SHALL 位于 Agent 正前方偏移 45° 角，Y 轴 +0.5 的位置。

#### Scenario: Agent 开始调用工具

- **WHEN** Agent 状态变为 tool_calling 且 currentTool 非空
- **THEN** Agent 面前 SHALL 弹出全息面板（scale 0→1, easeOutBack, 300ms 动画）

#### Scenario: Agent 结束工具调用

- **WHEN** Agent 状态从 tool_calling 变为其他状态
- **THEN** 全息面板 SHALL 显示绿色对勾 ✓（500ms），然后缩小消失（scale 1→0, 200ms）

### Requirement: 全息面板显示工具信息

全息面板 SHALL 显示以下信息：工具图标（使用 Unicode/Emoji 映射）、工具名称、无限循环进度条动画（条纹 indeterminate 样式）。

#### Scenario: 显示工具名称和进度

- **WHEN** Agent 正在调用名为 "web_search" 的工具
- **THEN** 全息面板 SHALL 显示搜索图标 🔍、工具名 "web_search"、以及持续动画的进度条

### Requirement: 全息面板视觉风格

全息面板 SHALL 使用半透明蓝色材质（opacity=0.15），面板内容通过 drei `<Html>` 渲染。面板 SHALL 始终面向相机（billboarding）。

#### Scenario: 不同角度查看全息面板

- **WHEN** 用户旋转 3D 场景相机
- **THEN** 全息面板内容 SHALL 始终面向用户可读

### Requirement: 仅在 3D 模式渲染

SkillHologram SHALL 仅在 3D 视图模式下渲染。2D 模式 SHALL 保留现有的工具信息文本展示方式。

#### Scenario: 2D 模式无全息面板

- **WHEN** 用户处于 2D 视图模式
- **THEN** Agent 调用工具时 SHALL 不显示 3D 全息面板，使用现有 2D 工具信息展示
