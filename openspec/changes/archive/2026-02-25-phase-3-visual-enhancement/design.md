## Context

Phase 2 完成后，3D 办公室已具备：浅色 isometric 建筑（墙壁/窗户/地板/隔断/楼梯/服务器机架）、家具布局（工位/会议桌/沙发/书架）、CapsuleGeometry Agent 角色（5 种状态动画）、Sub-Agent 派生/消亡动画、父子连线、会议区协作聚集。

当前不足：

1. 缺少后处理特效（连线和状态没有发光/Bloom 效果）
2. 只有固定暖色灯光，无暗色主题
3. ToolScreen 仅为简单 PlaneGeometry + HTML 工具名，缺乏全息面板的视觉冲击力
4. 头像仅为纯色背景+首字母圆形，无法有效区分多个 Agent

设计稿参考：图1 展示了暗色办公室全景带 Live Stats 和 Agent 标签，图3 展示了 Sub-Agent 工位特写带 Memory Stream 面板，图5 展示了夜间全景模式。

## Goals / Non-Goals

**Goals:**

- 通过 Bloom 后处理增强协作连线和状态特效的视觉表现力
- 实现日/夜主题切换，匹配设计稿中的暗色和亮色两种视觉风格
- 将 ToolScreen 升级为全息面板（SkillHologram），增加进度反馈和完成态
- 用 SVG 生成式头像替换首字母头像，提升 Agent 间的视觉辨识度
- 在不破坏 Phase 2 既有功能的前提下增量式增强

**Non-Goals:**

- 不引入 GLTF 模型替换几何体（当前几何体风格统一，且避免引入资产管理复杂度）
- 不做 SSAO（性能影响大，留待后续按需评估）
- 不做复杂的角色骨骼动画（保持轻量几何体风格）

## Decisions

### D1: 后处理方案 — @react-three/postprocessing + 选择性 Bloom

**选择**: 使用 `@react-three/postprocessing` 的 `EffectComposer` + `Bloom`，通过 `layers` 机制选择性应用。

**替代方案**:

- 全局 Bloom → 会让整个场景过曝，不可控
- UnrealBloomPass (three/examples) → 不如 pmndrs 的封装易用，且缺少选择性 Bloom

**做法**:

- 在 Scene3D 的 Canvas 中添加 `<EffectComposer>`
- Bloom 参数: `intensity=1.2, luminanceThreshold=0.6, luminanceSmoothing=0.4`
- 协作连线(ParentChildLine)和状态指示器(ThinkingIndicator, ErrorIndicator)的材质设置 `emissive` + `emissiveIntensity > 1` 使其自然触发 Bloom
- 提供 store 中的 `bloomEnabled: boolean` 开关，默认开启

### D2: 日/夜主题 — Store 驱动 + CSS 变量联动

**选择**: 在 `office-store` 中新增 `theme: "light" | "dark"`，3D 灯光和 UI 同时响应。

**做法**:

- Environment3D 根据 `theme` 切换两套灯光参数：
  - light: 当前暖色方案（directional 1.2, ambient 0.65）
  - dark: 冷色方案（directional 0.4 + 蓝色台灯点光源, ambient 0.2）
- Canvas 背景色随主题切换: `light=#e8ecf2, dark=#0f1729`
- CSS 使用 `data-theme` 属性在 `<html>` 上切换，Tailwind dark mode
- 过渡: 灯光强度用 `THREE.MathUtils.lerp` 在 useFrame 中平滑插值（500ms）
- TopBar 右侧添加太阳/月亮图标按钮

### D3: SkillHologram — 升级 ToolScreen

**选择**: 在现有 ToolScreen.tsx 基础上重构为 SkillHologram.tsx。

**做法**:

- 位置: Agent 面前 45° 偏移，Y 轴 +0.5
- 外观: PlaneGeometry(0.6, 0.4) 半透明蓝色材质(`opacity=0.15`)
- 内容: drei `<Html>` 渲染工具图标(Emoji/Unicode)、工具名、进度条
- 进度条: CSS 动画无限循环条纹(indeterminate)
- 完成态: 工具完成时显示绿色对勾 ✓（500ms 后淡出消失）
- 弹出/收起动画: scale 0→1 (easeOutBack, 300ms)

### D4: SVG 生成式头像 — 基于 hash 的确定性组合

**选择**: 纯前端 SVG 生成，不依赖外部服务。

**替代方案**:

- DiceBear/Boring Avatars 库 → 增加依赖，且样式可能不符合办公室拟人化风格
- Canvas 绘制 → 不如 SVG 可缩放且 React 友好

**做法**:

- 在 `avatar-generator.ts` 中新增 `generateSvgAvatar(agentId: string): SvgAvatarData`
- 返回: `{ faceShape, hairStyle, skinColor, hairColor, shirtColor, eyeStyle }`
- 基于 agentId hash 的不同 bit 段选择各部件
- 脸型: 3 种（圆/方/椭圆）
- 发型: 5 种（短发/长发/卷发/光头/莫霍克）
- 肤色: 6 种包容性色调
- 新建 `SvgAvatar.tsx` 组件渲染 SVG
- 在 Sidebar Agent 列表和 AgentDetailPanel 中替换现有 Avatar 组件

## Risks / Trade-offs

- **[Bloom 性能]** → 低端设备可能掉帧。缓解: 提供 `bloomEnabled` 开关，默认检测 devicePixelRatio < 1.5 时自动关闭
- **[主题切换闪烁]** → 灯光/背景/UI 同步切换可能出现短暂不一致。缓解: 使用 requestAnimationFrame 批量更新，灯光 lerp 平滑过渡
- **[SVG 头像一致性]** → hash 算法变更会导致同一 Agent 头像改变。缓解: 固定 hash 算法，使用与现有 `hashString()` 相同的函数
- **[ToolScreen 向后兼容]** → 直接替换可能影响 2D 模式。缓解: SkillHologram 仅在 3D 模式渲染，2D 模式保留现有工具信息展示
