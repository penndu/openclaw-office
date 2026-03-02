## ADDED Requirements

### Requirement: 日间主题灯光与背景

当 theme 为 "light" 时，3D 场景 SHALL 使用暖色灯光方案：DirectionalLight 强度 1.2（色温 #fff8ee）、AmbientLight 强度 0.65、Canvas 背景色 #e8ecf2。UI SHALL 使用浅色主题样式。

#### Scenario: 日间模式视觉表现

- **WHEN** 用户选择日间主题（theme="light"）
- **THEN** 3D 场景 SHALL 呈现明亮的暖色灯光，背景为浅灰蓝色，UI 元素使用浅色配色

### Requirement: 夜间主题灯光与背景

当 theme 为 "dark" 时，3D 场景 SHALL 切换为冷色灯光方案：DirectionalLight 强度 0.4（色温 #8899bb）、增加 2-3 个模拟台灯的 PointLight（暖黄色, 强度 0.6）、AmbientLight 强度 0.2、Canvas 背景色 #0f1729。UI SHALL 使用深色主题样式。

#### Scenario: 夜间模式视觉表现

- **WHEN** 用户选择夜间主题（theme="dark"）
- **THEN** 3D 场景 SHALL 呈现冷色调暗光环境，工位附近有暖黄台灯效果，背景为深蓝色，UI 元素使用深色配色

### Requirement: 主题切换平滑过渡

主题切换时 3D 灯光参数 SHALL 通过 lerp 插值实现 500ms 平滑过渡，避免突兀的亮度跳变。

#### Scenario: 从日间切换到夜间

- **WHEN** 用户从日间主题切换到夜间主题
- **THEN** 灯光强度和颜色 SHALL 在 500ms 内平滑过渡到夜间参数，不出现画面闪烁

#### Scenario: 从夜间切换到日间

- **WHEN** 用户从夜间主题切换到日间主题
- **THEN** 灯光强度和颜色 SHALL 在 500ms 内平滑过渡到日间参数

### Requirement: 主题切换入口

TopBar SHALL 提供主题切换按钮（太阳/月亮图标），点击切换日/夜主题。

#### Scenario: 点击主题按钮

- **WHEN** 用户点击 TopBar 中的主题切换按钮
- **THEN** 系统 SHALL 在日/夜主题间切换，按钮图标 SHALL 同步更新为对应主题的图标

### Requirement: 主题状态持久化

主题选择 SHALL 通过 localStorage 持久化，下次打开时恢复上次选择的主题。

#### Scenario: 刷新页面保持主题

- **WHEN** 用户选择夜间主题后刷新页面
- **THEN** 页面 SHALL 加载时直接使用夜间主题，无闪烁
