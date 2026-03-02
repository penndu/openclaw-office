## MODIFIED Requirements

### Requirement: SVG 办公室平面图

系统 SHALL 渲染一个 SVG 办公室平面图，使用 `viewBox="0 0 1200 700"` 固定坐标系，包含四个可辨识的功能区域，并增加阴影、圆角和渐变等视觉细节。休息区 SHALL 支持显示空闲 sub-agent 头像（含占位 placeholder），Agent 在 zone 间移动时 SHALL 呈现沿走廊的行走动画。

#### Scenario: 四区域布局渲染

- **WHEN** FloorPlan 组件加载
- **THEN** 系统 SHALL 渲染四个区域：Desk Zone（固定工位区，左上）、Meeting Zone（会议区，右上）、Hot Desk Zone（热工位区，左下）、Lounge Zone（休息区，右下），每个区域 SHALL 有不同的渐变底色、圆角（rx=16）和轻微的阴影效果（feDropShadow）。

#### Scenario: 区域标签可读

- **WHEN** 平面图渲染完成
- **THEN** 每个区域 SHALL 显示中文区域名称（固定工位区 / 会议区 / 热工位区 / 休息区），标签使用半透明毛玻璃背景（或对应的 SVG 滤镜）确保在不同底色上可读，并增加视觉层次感。

#### Scenario: 热工位区工位预渲染

- **WHEN** 系统获取到 maxSubAgents 配置
- **THEN** 热工位区 SHALL 预渲染 `maxSubAgents` 个工位（空桌椅），使用 4 列横向优先布局

#### Scenario: 休息区显示占位和空闲 sub-agent

- **WHEN** 存在 zone 为 `"lounge"` 的 Agent（包括 `isPlaceholder === true` 的占位 Agent）
- **THEN** FloorPlan SHALL 在休息区的锚点位置渲染这些 Agent 的头像；placeholder Agent 以半透明（opacity: 0.3）渲染

#### Scenario: Agent 行走动画渲染

- **WHEN** Agent 的 `movement !== null`
- **THEN** FloorPlan SHALL 使用 `requestAnimationFrame` 驱动 AgentAvatar 沿 `movement.path` 平滑移动，而非使用 CSS transition；移动时有上下弹跳效果

#### Scenario: 会议区动态显示通信 Agent

- **WHEN** `applyMeetingGathering` 触发 Agent 行走到会议区
- **THEN** Agent SHALL 沿走廊路径行走到会议区，到达后在会议座位位置渲染

### Requirement: 休息区 Agent 渲染层

FloorPlan SHALL 在休息区装饰层之上增加一个 Agent 渲染层，显示 zone 为 `"lounge"` 的所有 Agent（含 placeholder 占位 Agent）。

#### Scenario: 休息区 Agent 头像渲染

- **WHEN** 休息区有空闲 sub-agent 或 placeholder Agent
- **THEN** 系统 SHALL 渲染带状态色的 AgentAvatar 组件；idle 真实 Agent 绿色，placeholder Agent 半透明灰色

#### Scenario: 休息区 Agent 数量动态变化

- **WHEN** Agent 从休息区开始行走向热工位区
- **THEN** 该 Agent 的头像 SHALL 从休息区锚点出发，沿路径走出休息区，穿过走廊，进入热工位区

## ADDED Requirements

### Requirement: 行走中 Agent 走廊渲染

FloorPlan SHALL 在走廊区域渲染正在行走中的 Agent 头像。

#### Scenario: 走廊中的移动 Agent

- **WHEN** Agent 正在行走且当前插值位置位于走廊区域
- **THEN** AgentAvatar SHALL 在走廊位置渲染，不被任何 zone 层遮挡

#### Scenario: 多个 Agent 同时行走

- **WHEN** 多个 Agent 同时在走廊行走
- **THEN** 所有行走中 Agent SHALL 同时渲染，可以短暂重叠（不做碰撞避让）
