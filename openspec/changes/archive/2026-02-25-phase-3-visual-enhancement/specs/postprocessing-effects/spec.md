## ADDED Requirements

### Requirement: Bloom 效果应用于协作连线和状态指示器

系统 SHALL 在 3D 场景中启用 Bloom 后处理效果，使协作连线（ParentChildLine）和状态指示器（ThinkingIndicator、ErrorIndicator）产生发光效果。Bloom 参数 SHALL 为: intensity=1.2, luminanceThreshold=0.6, luminanceSmoothing=0.4。

#### Scenario: 3D 模式下 Bloom 效果生效

- **WHEN** 用户处于 3D 视图模式
- **THEN** 协作连线和状态指示器（思考旋转环、错误八面体）SHALL 呈现柔和的发光效果

#### Scenario: Bloom 效果不影响普通物体

- **WHEN** Bloom 效果启用
- **THEN** 办公桌、墙壁、地板等非发光物体 SHALL 不受 Bloom 影响，仅 emissiveIntensity > 1 的材质触发发光

### Requirement: Bloom 效果可关闭

系统 SHALL 提供 `bloomEnabled` 开关（存储在 office-store 中），允许用户手动开关 Bloom 效果。

#### Scenario: 关闭 Bloom 效果

- **WHEN** 用户通过设置关闭 Bloom
- **THEN** 3D 场景 SHALL 不渲染任何 Bloom 后处理效果，帧率 SHALL 与无后处理时一致

#### Scenario: 低性能设备自动关闭

- **WHEN** 设备 devicePixelRatio < 1.5
- **THEN** Bloom SHALL 默认关闭

### Requirement: 后处理仅在 3D 模式加载

EffectComposer 和 Bloom SHALL 仅在 3D 视图模式下渲染，2D 模式 SHALL 不加载后处理相关组件。

#### Scenario: 2D 模式无后处理开销

- **WHEN** 用户处于 2D 视图模式
- **THEN** EffectComposer SHALL 不被挂载到 DOM/Canvas 中
