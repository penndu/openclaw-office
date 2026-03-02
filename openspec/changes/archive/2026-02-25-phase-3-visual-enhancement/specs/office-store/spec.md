## MODIFIED Requirements

### Requirement: Store 包含主题状态

office-store SHALL 包含 `theme: "light" | "dark"` 状态字段，默认值为 "dark"。SHALL 提供 `setTheme(theme: "light" | "dark")` action 用于切换主题。SHALL 提供 `bloomEnabled: boolean` 状态字段（默认 true）和 `setBloomEnabled(enabled: boolean)` action。

#### Scenario: 初始主题状态

- **WHEN** 应用首次加载且 localStorage 中无 theme 记录
- **THEN** store.theme SHALL 为 "dark"

#### Scenario: 从 localStorage 恢复主题

- **WHEN** 应用加载时 localStorage 中有 theme="light"
- **THEN** store.theme SHALL 初始化为 "light"

#### Scenario: 切换主题

- **WHEN** 调用 setTheme("light")
- **THEN** store.theme SHALL 变为 "light"，且该值 SHALL 同步写入 localStorage

#### Scenario: 切换 Bloom 开关

- **WHEN** 调用 setBloomEnabled(false)
- **THEN** store.bloomEnabled SHALL 变为 false
