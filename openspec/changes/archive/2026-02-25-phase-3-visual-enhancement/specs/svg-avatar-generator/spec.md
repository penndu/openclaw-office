## ADDED Requirements

### Requirement: 基于 agentId 的确定性 SVG 头像生成

系统 SHALL 提供 `generateSvgAvatar(agentId: string)` 函数，基于 agentId 的 hash 值确定性生成 SVG 头像数据。相同的 agentId SHALL 始终生成相同的头像。

#### Scenario: 确定性生成

- **WHEN** 对同一 agentId 多次调用 generateSvgAvatar
- **THEN** 每次返回的头像数据 SHALL 完全一致（脸型、发型、颜色均相同）

#### Scenario: 不同 Agent 生成不同头像

- **WHEN** 对 "agent-alpha" 和 "agent-beta" 分别调用 generateSvgAvatar
- **THEN** 两个头像 SHALL 在外观上有可区分的差异（至少一个部件不同）

### Requirement: 头像部件组合

SVG 头像 SHALL 包含以下可变部件：脸型（至少 3 种：圆/方/椭圆）、发型（至少 5 种：短发/长发/卷发/光头/莫霍克）、肤色（至少 6 种包容性色调）、发色（至少 4 种）、衣服颜色（来自现有 PALETTE）。

#### Scenario: 部件多样性

- **WHEN** 生成 20 个不同 agentId 的头像
- **THEN** SHALL 出现至少 3 种不同的脸型和至少 4 种不同的发型

### Requirement: SvgAvatar React 组件

系统 SHALL 提供 `<SvgAvatar>` React 组件，接收 agentId 和可选的 size 属性，渲染生成的 SVG 头像。

#### Scenario: 在 Sidebar 中渲染

- **WHEN** Sidebar 的 Agent 列表渲染每个 Agent
- **THEN** SHALL 使用 SvgAvatar 替代现有的纯色首字母圆形头像

#### Scenario: 在 AgentDetailPanel 中渲染

- **WHEN** 打开 Agent 详情面板
- **THEN** SHALL 使用较大尺寸的 SvgAvatar 显示该 Agent 的头像

### Requirement: 向后兼容现有颜色系统

SVG 头像的衣服颜色 SHALL 使用 `generateAvatar3dColor()` 返回的颜色，确保 3D 角色身体颜色与头像衣服颜色一致。

#### Scenario: 颜色一致性

- **WHEN** Agent "dev-01" 的 3D 角色身体颜色为 #3b82f6
- **THEN** 其 SVG 头像的衣服颜色 SHALL 同样为 #3b82f6
