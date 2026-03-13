## ADDED Requirements

### Requirement: 六大功能分区布局

系统 SHALL 将办公室空间划分为六个功能分区，每个分区为独立的 `ZonePanel` 组件实例，具有固定的位置、尺寸和视觉风格。分区列表：

| 分区 ID       | 名称         | 位置 (left, top)  | 尺寸 (w × h)  |
|--------------|-------------|------------------|--------------|
| gateway-zone | Gateway 中控大厅 | 58px, 74px      | 360 × 220   |
| ops-zone     | 运营行为板     | 450px, 70px      | 450 × 220   |
| cron-zone    | Cron 广播区   | 940px, 80px      | 320 × 180   |
| staff-zone   | 正式员工工区   | 86px, 350px      | 820 × 360   |
| project-zone | 临时项目室     | 950px, 330px     | 300 × 210   |
| memory-zone  | 共享记忆墙     | 960px, 570px     | 270 × 110   |

#### Scenario: 分区可见且不重叠
- **WHEN** 办公室场景完成渲染
- **THEN** 六个分区 SHALL 在等距视角下全部可见，各分区边界清晰，不产生视觉重叠

#### Scenario: 分区背景样式
- **WHEN** 分区渲染时
- **THEN** 每个分区 SHALL 具有统一的 Glass Morphism 样式——半透明渐变背景、微透明边框、内发光、投影阴影，并通过 `translateZ(4px)` 悬浮于地板之上

### Requirement: 分区标签系统

系统 SHALL 为每个分区渲染一个 `ZoneLabel` 组件，显示英文标签名称（如 "Gateway Hall"、"Staff Floor" 等），标签 SHALL 使用大写字母、间距 0.12em、胶囊形背景，通过 `translateZ(8px)` 浮于分区面板之上。

#### Scenario: 标签可见性
- **WHEN** 场景渲染时
- **THEN** 每个分区 SHALL 在左上角附近显示对应的英文标签，标签文字清晰可读，背景半透明不遮挡分区内容

### Requirement: 分区位置配置化

系统 SHALL 通过统一的配置对象（`ZONE_CONFIG`）管理所有分区的位置、尺寸和标签文本，以便后续动态调整。组件 SHALL 从配置中读取参数，不硬编码到 JSX 中。

#### Scenario: 配置驱动布局
- **WHEN** 修改 `ZONE_CONFIG` 中某个分区的 `left` 或 `width` 值
- **THEN** 对应分区 SHALL 在下次渲染时自动应用新的位置和尺寸

### Requirement: Gateway 中控大厅区域

Gateway 分区 SHALL 包含以下子组件：

1. **GatewayCore 面板**——显示 "OPENCLAW GATEWAY" 标题、实时时钟、三条总线信息（Provider Mesh / Event Spine / Dispatch Queue），面板具有扫描波光效动画
2. **传送带（Conveyor）**——分区下方的水平光带，用 CSS 动画模拟事务流入效果

#### Scenario: Gateway 面板渲染
- **WHEN** 场景渲染时
- **THEN** Gateway 分区内 SHALL 显示核心面板，扫描波从左向右持续扫描（6 秒周期），传送带光效从左向右移动（8 秒周期）

#### Scenario: 实时时钟
- **WHEN** Gateway 面板可见时
- **THEN** 面板右上角 SHALL 显示当前系统时间（HH:MM:SS 格式），每秒更新

### Requirement: 员工工区空间

Staff Floor 分区 SHALL 作为正式员工工位的容器区域，预留 5 个工位的摆放空间。工位的具体实现见 `workspace-components` 能力。

#### Scenario: 工区预留空间
- **WHEN** 场景渲染时
- **THEN** Staff Floor 分区 SHALL 提供足够空间容纳 5 个工位（2 行布局：上行 3 个，下行 2 个），各工位之间有合理间距
