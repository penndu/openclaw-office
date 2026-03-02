## ADDED Requirements

### Requirement: 小屏幕自动切换 2D 模式

当屏幕宽度 < 768px 时，系统 SHALL 自动将 viewMode 切换为 "2d"，并禁用 3D 切换按钮。

#### Scenario: 手机屏幕访问

- **WHEN** 用户在 < 768px 宽度的设备上打开应用
- **THEN** viewMode SHALL 为 "2d"，TopBar 中 3D 按钮 SHALL 为禁用状态

#### Scenario: 窗口缩小触发切换

- **WHEN** 用户将桌面浏览器窗口缩小到 < 768px
- **THEN** 如当前为 3D 模式，SHALL 自动切换为 2D 模式

### Requirement: 侧栏折叠为底部抽屉

在 < 768px 宽度下，侧栏 SHALL 从右侧固定栏变为底部可上滑抽屉。

#### Scenario: 小屏幕底部抽屉

- **WHEN** 屏幕宽度 < 768px
- **THEN** 侧栏 SHALL 隐藏，底部出现上滑手柄，点击/上滑展开侧栏内容

#### Scenario: 抽屉展开/收起

- **WHEN** 用户点击底部抽屉手柄
- **THEN** 侧栏内容 SHALL 以 sheet 形式从底部滑出，覆盖主内容区域

### Requirement: 面板适配移动端

在小屏幕下，MetricsPanel 和 AgentDetailPanel SHALL 适配全宽布局，图表和卡片纵向排列。

#### Scenario: 移动端 MetricsPanel

- **WHEN** 屏幕宽度 < 768px
- **THEN** MetricsPanel 的 4 卡片 SHALL 全宽排列（1 列），图表 Tab 内容全宽展示
