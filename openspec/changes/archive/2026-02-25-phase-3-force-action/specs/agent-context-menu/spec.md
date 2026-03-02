## ADDED Requirements

### Requirement: 右键/长按 Agent 弹出上下文菜单

在 3D 模式下右键点击 Agent 角色、在 2D 模式下右键点击 Agent 圆点时，系统 SHALL 在鼠标位置弹出上下文菜单。菜单 SHALL 包含以下操作项：暂停 Agent (Pause)、恢复 Agent (Resume)、终止 Agent (Kill)、发送消息 (Send Message)、查看会话 (View Session)。

#### Scenario: 3D 模式右键弹出菜单

- **WHEN** 用户在 3D 视图中右键点击一个 Agent 角色
- **THEN** 系统 SHALL 在鼠标位置弹出上下文菜单，显示所有操作项

#### Scenario: 2D 模式右键弹出菜单

- **WHEN** 用户在 2D 视图中右键点击一个 Agent 圆点
- **THEN** 系统 SHALL 在鼠标位置弹出上下文菜单，显示所有操作项

#### Scenario: 点击菜单外部关闭

- **WHEN** 上下文菜单已显示，用户点击菜单外部区域
- **THEN** 上下文菜单 SHALL 立即关闭

### Requirement: 菜单项根据 Agent 状态动态调整

上下文菜单 SHALL 根据 Agent 当前状态动态显示/隐藏菜单项：Pause 仅在 Agent 运行中（working/thinking/tool_calling/speaking）时可用，Resume 仅在 Agent 暂停时可用。

#### Scenario: 运行中 Agent 的菜单

- **WHEN** 右键点击一个 status 为 "thinking" 的 Agent
- **THEN** 菜单 SHALL 显示 Pause（可用）和 Resume（灰色不可用）

#### Scenario: 空闲 Agent 的菜单

- **WHEN** 右键点击一个 status 为 "idle" 的 Agent
- **THEN** Pause 和 Resume SHALL 均为灰色不可用，Send Message 和 View Session SHALL 可用

### Requirement: 选择菜单项触发对应操作

点击 Pause/Resume/Kill SHALL 触发对应的 Force Action RPC。点击 Send Message SHALL 打开 ForceActionDialog 的发送消息模式。点击 View Session SHALL 选中该 Agent 并打开详情面板。

#### Scenario: 点击 Kill 菜单项

- **WHEN** 用户点击上下文菜单中的 "Kill" 项
- **THEN** 系统 SHALL 打开 Kill 确认弹窗
