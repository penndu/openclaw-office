## ADDED Requirements

### Requirement: 等距视角 3D 透视容器

系统 SHALL 提供一个 `OfficeStage` 容器组件，使用 CSS `perspective: 1200px` 创建 3D 透视上下文。内部 `office` 层 SHALL 应用 `rotateX(58deg) rotateZ(-28deg)` 等距变换，使整个办公室场景呈现 2.5D 等距视角效果。容器 SHALL 通过 `transform-style: preserve-3d` 让子元素参与 3D 空间层叠。

#### Scenario: 等距场景正确渲染
- **WHEN** `LivingOfficeView` 组件挂载到页面
- **THEN** 办公室场景 SHALL 以等距视角呈现，地板倾斜可见，工位和分区具有明确的空间层次感

#### Scenario: 元素层级深度
- **WHEN** 多个子组件使用不同的 `translateZ()` 值
- **THEN** 视觉上 SHALL 正确呈现前后遮挡关系（高 Z 值的元素在视觉上更靠近观察者）

### Requirement: 等距地板渲染

系统 SHALL 渲染一个 `OfficeFloor` 组件，使用 CSS 渐变和 `repeating-linear-gradient` 创建地板网格纹理。地板 SHALL 采用深色科技风格（深蓝底色 + 微透明网格线），尺寸为 1380×820px，带有 34px 圆角边框和内阴影增强空间深度。

#### Scenario: 地板视觉效果
- **WHEN** 办公室场景渲染
- **THEN** 地板 SHALL 显示深蓝色底面，叠加水平和垂直的微透明网格线，并具有内发光和边缘阴影效果

### Requirement: 背景网格系统

系统 SHALL 在场景容器内渲染 `CityGrid` 背景层，使用 60×60px 间距的网格线提供空间参考。网格线 SHALL 为极低透明度（~0.03 白色），仅作为视觉纵深提示。

#### Scenario: 网格可见度
- **WHEN** 场景渲染时
- **THEN** 背景网格 SHALL 可见但不干扰前景内容，整体透明度控制在 0.18 以下

### Requirement: 环境粒子效果

系统 SHALL 渲染 `AmbientParticles` 环境层，在视口中生成 30-40 个微小光点，以极慢速度（20-50 秒周期）向上漂浮。粒子 SHALL 使用 CSS `animation` 实现，不依赖 Canvas 或 requestAnimationFrame。

#### Scenario: 粒子动画性能
- **WHEN** 环境粒子动画运行时
- **THEN** 粒子 SHALL 平滑漂浮且不造成可感知的帧率下降（目标 60fps），`pointer-events` 设置为 `none` 不干扰用户交互

### Requirement: 响应式视口适配

系统 SHALL 在视口宽度 ≤ 1400px 时自动缩放办公室场景，通过 CSS `scale()` 变换保持布局比例。HUD 和底栏布局 SHALL 在窄屏下切换为单列堆叠。

#### Scenario: 窄屏缩放
- **WHEN** 浏览器视口宽度 ≤ 1400px
- **THEN** 办公室场景 SHALL 整体缩小（约 0.88 倍），HUD 区域切换为垂直堆叠布局

### Requirement: 深色科技主题系统

系统 SHALL 通过 CSS 自定义属性定义 Living Office 主题，所有颜色、阴影、模糊参数 SHALL 使用 `--lo-` 前缀的 CSS 变量。主题 SHALL 包含以下语义色彩：背景色（`--lo-bg`）、面板色（`--lo-panel`）、正常状态色（`--lo-good`）、警告色（`--lo-warn`）、异常色（`--lo-bad`）、主色调（`--lo-cyan`）、辅助色（`--lo-violet`）。

#### Scenario: 主题变量可用
- **WHEN** Living Office 组件加载
- **THEN** 所有 `--lo-*` CSS 变量 SHALL 在 `:root` 或 Living Office 容器作用域内可用，组件 SHALL 通过 `var(--lo-*)` 引用而非硬编码颜色值
