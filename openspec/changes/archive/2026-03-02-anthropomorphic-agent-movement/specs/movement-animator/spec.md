## ADDED Requirements

### Requirement: Waypoint 路径规划

系统 SHALL 提供 `planWalkPath(from, to, fromZone, toZone)` 函数，根据起点/终点所在 zone 生成经走廊中线的 waypoint 路径。路径格式为 `Point[]`（SVG 坐标）。

#### Scenario: 同 zone 移动

- **WHEN** 起点和终点在同一 zone
- **THEN** 路径 SHALL 为直线 `[from, to]`，不经过走廊

#### Scenario: 相邻 zone 移动（共享走廊一侧）

- **WHEN** 起点在 desk zone、终点在 hotDesk zone（垂直相邻，共享左侧走廊）
- **THEN** 路径 SHALL 包含 `[from, deskDoor, hotDeskDoor, to]`，其中 door 点位于 zone 靠走廊侧的中点

#### Scenario: 对角 zone 移动

- **WHEN** 起点在 desk zone（左上）、终点在 lounge zone（右下）
- **THEN** 路径 SHALL 包含 `[from, deskDoor, corridorCenter, loungeDoor, to]`，经走廊中心交叉点

#### Scenario: 路径点坐标在走廊范围内

- **WHEN** 路径生成完成
- **THEN** 所有中间 waypoint（不含 from/to）的坐标 SHALL 落在十字走廊区域内（水平走廊 y 范围或垂直走廊 x 范围）

### Requirement: 步速与动画时长计算

系统 SHALL 提供 `calculateWalkDuration(path)` 函数，根据路径总长度和步速计算行走动画时长。

#### Scenario: 正常路径时长

- **WHEN** 路径总长度为 360px（约 3 秒路程）
- **THEN** 动画时长 SHALL 为 `pathLength / WALK_SPEED_SVG`（即 3.0 秒），其中 `WALK_SPEED_SVG = 120`

#### Scenario: 短路径保证最低时长

- **WHEN** 路径总长度为 60px（不足 1.5 秒）
- **THEN** 动画时长 SHALL 为 `MIN_WALK_DURATION`（1.5 秒），步速自动降低为 `pathLength / 1.5`

### Requirement: 路径插值

系统 SHALL 提供 `interpolatePathPosition(path, progress)` 函数，根据进度值（0~1）返回路径上的插值位置。

#### Scenario: 进度为 0

- **WHEN** `progress === 0`
- **THEN** 返回值 SHALL 等于 `path[0]`

#### Scenario: 进度为 1

- **WHEN** `progress === 1`
- **THEN** 返回值 SHALL 等于 `path[path.length - 1]`

#### Scenario: 中间进度

- **WHEN** `progress === 0.5` 且路径有 3 个等距点
- **THEN** 返回值 SHALL 位于第 2 个和第 3 个点之间的中点附近

### Requirement: 动画状态类型

系统 SHALL 定义 `MovementState` 类型，用于 VisualAgent 上存储行走状态。

#### Scenario: MovementState 结构

- **WHEN** Agent 正在行走中
- **THEN** `agent.movement` SHALL 包含 `{ path: Point[], progress: number, duration: number, startTime: number, fromZone: Zone, toZone: Zone }`

#### Scenario: 行走完成

- **WHEN** `progress >= 1`
- **THEN** `agent.movement` SHALL 被设为 `null`，agent.position SHALL 更新为 `path` 终点，agent.zone SHALL 更新为 `toZone`

### Requirement: 2D 行走视觉效果

Agent 在 2D SVG 中行走时 SHALL 呈现拟人化效果。

#### Scenario: 行走弹跳

- **WHEN** Agent 正在沿路径行走（`movement !== null`）
- **THEN** Agent 头像 SHALL 有上下弹跳效果（振幅 2px，频率 8Hz），模拟脚步节奏

#### Scenario: 出发站起

- **WHEN** 行走动画刚开始（progress < 0.1）
- **THEN** Agent 头像 SHALL 有 scale 从 0.9 → 1.0 的放大效果（0.3 秒），表示"站起来"

#### Scenario: 到达落座

- **WHEN** 行走动画即将结束（progress > 0.9）
- **THEN** Agent 头像 SHALL 有 scale 从 1.0 → 0.95 → 1.0 的弹性效果（0.3 秒），表示"坐下"

#### Scenario: 行走中状态环

- **WHEN** Agent 正在行走
- **THEN** StatusRing SHALL 使用蓝色（#3b82f6）虚线样式（`strokeDasharray="4 3"`），区别于其他状态

### Requirement: 3D 行走视觉效果

Agent 在 3D 中行走时 SHALL 呈现同步的拟人化效果。

#### Scenario: 3D 平滑位移

- **WHEN** Agent 行走中
- **THEN** AgentCharacter 的 position SHALL 使用降低的 lerp 因子移动（`Math.min(2.5 * delta, 0.1)`），使行走过程可见

#### Scenario: 3D 身体摆动

- **WHEN** Agent 行走中
- **THEN** AgentCharacter 的 body group SHALL 有左右微摆（旋转约 ±0.08 弧度，频率 8Hz）和上下弹跳（振幅 0.03 单位）

#### Scenario: 3D 行走结束

- **WHEN** Agent 到达目标位置
- **THEN** 摆动和弹跳 SHALL 停止，恢复正常呼吸动画
