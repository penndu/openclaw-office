## ADDED Requirements

### Requirement: 2.5D 工位组件

系统 SHALL 提供 `Desk` 组件，渲染一个 160×108px 的 2.5D 工位。工位 SHALL 包含以下子元素：

- **桌面（Surface）**——深色渐变矩形，圆角 20px，带内发光和投影
- **显示器（Monitor）**——桌面上方居中的发光矩形，颜色随状态变化
- **状态指示环（StatusRing）**——右上角 14px 圆形，颜色映射：`idle → 绿`、`busy → 黄`、`blocked → 红`
- **名称标签**——左下角显示 Agent 名称
- **元标签**——右下角显示 Agent 角色
- **气泡提示（DeskBubble）**——工位上方的胶囊形提示框，默认隐藏

工位 SHALL 通过 `translateZ(12px)` 悬浮于地板之上。

#### Scenario: 空闲工位渲染
- **WHEN** 工位对应的 Agent 处于 idle 状态
- **THEN** 工位 SHALL 显示绿色状态环，显示器为默认蓝色发光，无气泡提示

#### Scenario: 忙碌工位渲染
- **WHEN** 工位对应的 Agent 处于 busy/working 状态
- **THEN** 工位 SHALL 显示黄色状态环

#### Scenario: 阻塞工位渲染
- **WHEN** 工位对应的 Agent 处于 blocked/error 状态
- **THEN** 工位 SHALL 显示红色状态环

### Requirement: 工位气泡提示

系统 SHALL 在工位上方显示 `DeskBubble` 气泡提示，用于展示简短的状态文字（如"收到新事务"、"接单分析中"）。气泡 SHALL 具有进入动画（向上浮入 + 淡入）和自动消失机制（2.6 秒后自动隐藏）。

#### Scenario: 气泡显示与隐藏
- **WHEN** 系统向某工位发送气泡消息
- **THEN** 气泡 SHALL 从工位上方淡入浮出，显示文字内容，2.6 秒后自动淡出消失

#### Scenario: 气泡位置
- **WHEN** 气泡显示时
- **THEN** 气泡 SHALL 位于工位中心上方，通过 `translateZ(20px)` 悬浮于工位桌面之上

### Requirement: Heartbeat 巡检脉冲效果

系统 SHALL 在 Heartbeat 巡检时为工位添加脉冲边框动画——工位外围出现一个扩散消散的半透明蓝色光环（1.6 秒周期）。此效果 SHALL 不触发 Agent 角色走动。

#### Scenario: 巡检脉冲
- **WHEN** 系统触发 Heartbeat 巡检事件
- **THEN** 目标工位 SHALL 出现脉冲光环动画，持续 1-2 秒后恢复正常，工位状态环短暂亮为蓝色

### Requirement: Glass Morphism 基础面板

系统 SHALL 提供 `GlassPanel` 组件作为所有信息面板的基础容器。面板样式 SHALL 包含：

- 半透明渐变背景（`rgba(18, 28, 49, 0.82)` → `rgba(11, 18, 32, 0.72)`）
- `backdrop-filter: blur(14px)` 模糊效果
- 微透明边框（`rgba(148, 163, 184, 0.18)`）
- 投影阴影
- 18px 圆角

面板 SHALL 接受 `children`、`className`、`style` props，支持灵活组合。

#### Scenario: 面板统一风格
- **WHEN** 多个面板（Gateway/Cron/Ops/Project/Memory）渲染时
- **THEN** 所有面板 SHALL 具有一致的 Glass Morphism 视觉风格，仅内容不同

### Requirement: Gateway 核心面板

系统 SHALL 渲染 `GatewayCore` 面板，包含：

- 标题 "OPENCLAW GATEWAY" + 实时时钟
- 三条总线信息卡片：Provider Mesh（channel/client/node）、Event Spine（agent/heartbeat/cron/health）、Dispatch Queue（perception paced routing）
- 扫描波光效——从左到右的半透明蓝色渐变条，6 秒循环动画
- 面板具有蓝色辉光边框（`rgba(92, 200, 255, 0.24)`）

#### Scenario: 扫描波动画
- **WHEN** Gateway 核心面板渲染时
- **THEN** 面板内 SHALL 持续播放从左到右的扫描波动画，渐变条在 6 秒内从左侧移出到右侧

### Requirement: Cron 广播牌

系统 SHALL 渲染 `CronBoard` 面板，显示当前活跃的 Cron 定时任务列表。每条任务显示为一行 mini-row（任务描述 + 状态标签）。面板标题为"Cron 广播牌"，副标题说明"制度性任务，不拟人"。

#### Scenario: 任务列表展示
- **WHEN** 系统有活跃的 Cron 任务
- **THEN** Cron 广播牌 SHALL 列出所有活跃任务，每条显示时间、任务名称和 "scheduled" 状态

### Requirement: 广播波纹信标

系统 SHALL 在 Cron 区域渲染 `BroadcastBeacon` 组件——一个 30px 的橙色发光圆点，持续播放扩散波纹动画（两层波纹，2.2 秒周期，交错 1.1 秒）。此组件表达 Cron 广播机制的"制度性"，不拟人化。

#### Scenario: 波纹持续播放
- **WHEN** Cron 区域可见时
- **THEN** 广播信标 SHALL 持续播放波纹扩散动画，不受 Agent 状态影响

### Requirement: 运营行为板

系统 SHALL 渲染 `OpsBoard` 面板，展示当前的组织行为规则/因果链说明。面板标题为"组织行为板"，副标题"因果链比热闹更重要"。内容为静态策略说明行，可动态更新。

#### Scenario: 行为规则展示
- **WHEN** 运营行为板渲染时
- **THEN** 面板 SHALL 显示 3-5 条组织行为规则，如"Gateway 接收外部消息并做事件压缩"、"高频内部事件只进状态，不强制人物移动"

### Requirement: 临时项目室面板

系统 SHALL 渲染 `ProjectRoom` 面板，显示当前活跃的临时协作任务。面板标题为"临时项目室"，副标题"Sub-agent 只在这里亮起"。当无协作时显示"暂无临时协作"。

#### Scenario: 无协作状态
- **WHEN** 没有活跃的 sub-agent 协作
- **THEN** 项目室面板 SHALL 显示"暂无临时协作"占位文本

#### Scenario: 有协作状态
- **WHEN** 系统拉起 sub-agent 协作
- **THEN** 项目室面板 SHALL 显示协作任务列表，每条包含 sub-agent 名称和任务摘要

### Requirement: 共享记忆墙面板

系统 SHALL 渲染 `MemoryWall` 面板，展示当前共享上下文/事实。面板标题为"共享记忆墙"，副标题"目标/事实/上下文"。最多显示 2-3 条最新的共享记忆条目。

#### Scenario: 记忆条目展示
- **WHEN** 系统有共享记忆条目
- **THEN** 记忆墙 SHALL 显示最近 2-3 条条目，新条目排在最前

### Requirement: 五个正式员工工位布局

系统 SHALL 按照以下坐标布局 5 个工位：

| 工位 ID   | Agent 名称        | 角色          | 位置 (left, top)  |
|-----------|------------------|--------------|------------------|
| desk-gm   | General Manager  | orchestrator | 170px, 430px     |
| desk-sales| Sales Agent      | discovery    | 390px, 430px     |
| desk-ops  | Ops Agent        | execution    | 610px, 430px     |
| desk-fin  | Finance Agent    | payment      | 280px, 590px     |
| desk-it   | IT Agent         | tooling      | 520px, 590px     |

工位 SHALL 配置化管理，支持后续动态增减。

#### Scenario: 五工位完整渲染
- **WHEN** 办公室场景渲染时
- **THEN** Staff Floor 分区内 SHALL 显示 5 个工位，每个显示对应的 Agent 名称和角色标签，初始状态为 idle（绿色状态环）
