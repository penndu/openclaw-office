## ADDED Requirements

### Requirement: 连接时获取权限 scopes

系统 SHALL 在 WebSocket 连接成功后从 Gateway 响应中提取 scopes 信息，存入 office-store。

#### Scenario: 获取到 operator scope

- **WHEN** Gateway 连接成功且响应中包含 scopes: ["operator"]
- **THEN** store.operatorScopes SHALL 包含 "operator"

#### Scenario: 无 scopes 信息

- **WHEN** Gateway 连接成功但响应中无 scopes 字段
- **THEN** 系统 SHALL 默认赋予所有操作权限（向后兼容旧版 Gateway）

### Requirement: 操作按钮权限控制

Force Action 操作按钮（Pause/Resume/Kill/Send Message）SHALL 检查 operator 权限。无权限时按钮 SHALL 为灰色禁用状态，hover 时显示 "需要 operator 权限" tooltip。

#### Scenario: 有 operator 权限

- **WHEN** 用户拥有 operator scope
- **THEN** 所有 Force Action 按钮 SHALL 可用

#### Scenario: 无 operator 权限

- **WHEN** 用户没有 operator scope
- **THEN** Pause/Resume/Kill/Send Message 按钮 SHALL 为灰色禁用状态，hover 显示 "需要 operator 权限"

### Requirement: Mock 模式默认 operator 权限

在 Mock 模式（VITE_MOCK=true）下，系统 SHALL 默认赋予 operator 权限，以便开发测试。

#### Scenario: Mock 模式权限

- **WHEN** 应用在 Mock 模式下运行
- **THEN** 所有 Force Action 按钮 SHALL 可用
