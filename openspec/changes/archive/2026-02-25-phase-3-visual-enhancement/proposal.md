## Why

Phase 2 完成了 Isometric 3D 办公室的基础场景和 Agent 角色系统，但当前使用的是 BoxGeometry/CapsuleGeometry 等基础几何体，视觉品质与设计稿（图1-图6）的"简洁平面化 3D + 拟人化数字员工"目标仍有差距。需要通过后处理特效、日/夜主题、全息工具面板和 SVG 生成式头像等增强手段，将 Agent 办公室从"技术 Demo"提升为"专业级产品级可视化"。

## What Changes

- **后处理特效**：引入 `@react-three/postprocessing`，为协作连线、状态特效添加 Bloom 发光效果，增强场景空间感
- **日/夜主题切换**：在 Store 中新增 `theme` 状态，实现日间（暖色灯光+浅色背景+浅色 UI）和夜间（冷色灯光+深蓝背景+深色 UI）两套视觉方案，带平滑过渡动画
- **全息工具面板（SkillHologram）**：升级现有 ToolScreen 为全息面板效果——Agent 进入 tool_calling 时面前弹出半透明悬浮面板，显示工具图标+名称+进度条动画，完成时绿色对勾后消失
- **SVG 生成式头像**：基于 agentId hash 生成确定性 SVG 头像（脸型、发型、颜色组合），替代当前的纯色圆形首字母头像，提升 Agent 辨识度
- **场景装饰增强**：在现有 Environment3D 基础上添加桌面装饰物（台灯、文件夹、咖啡杯等），丰富办公室的生活感和拟人化氛围

## Capabilities

### New Capabilities

- `postprocessing-effects`: Bloom 后处理特效系统，为 3D 场景中的连线、状态特效添加发光效果，含性能开关
- `day-night-theme`: 日/夜主题切换能力，包含灯光方案、背景色、UI 主题的联动切换和平滑过渡
- `skill-hologram`: 全息工具面板，Agent 调用工具时的 3D 悬浮显示，含工具信息、进度动画和完成反馈
- `svg-avatar-generator`: 基于 agentId hash 的确定性 SVG 头像生成器，产出脸型+发型+颜色组合的可辨识头像

### Modified Capabilities

- `office-store`: 新增 `theme: "light" | "dark"` 状态字段和 `setTheme` action

## Impact

- **新增依赖**: `@react-three/postprocessing`
- **修改文件**:
  - `src/store/office-store.ts` — 新增 theme 状态
  - `src/components/office-3d/Environment3D.tsx` — 灯光方案随主题切换、增加装饰物
  - `src/components/office-3d/Scene3D.tsx` — 集成 EffectComposer/Bloom
  - `src/components/office-3d/ToolScreen.tsx` — 升级为 SkillHologram
  - `src/components/layout/TopBar.tsx` — 新增主题切换按钮
  - `src/lib/avatar-generator.ts` — 新增 SVG 头像生成函数
  - `src/components/panels/AgentDetailPanel.tsx` — 使用新头像
  - `src/components/layout/Sidebar.tsx` — 使用新头像
- **新增文件**:
  - `src/components/office-3d/SkillHologram.tsx`
  - `src/components/shared/SvgAvatar.tsx`
- **测试**: 需为 SVG 头像生成器、theme 切换添加单元测试
