## ADDED Requirements

### Requirement: 三级 LOD 渲染

系统 SHALL 基于相机到场景中心的距离实现三级 LOD：

- **近距 (distance < 15)**：完整角色 + 气泡 + 特效 + HTML 标签
- **中距 (15 ≤ distance < 30)**：简化角色（身体+头部）+ 状态色点（无 HTML overlay）
- **远距 (distance ≥ 30)**：仅渲染状态色小球

#### Scenario: 近距完整渲染

- **WHEN** 相机距场景中心 < 15
- **THEN** 所有 Agent SHALL 完整渲染，包含气泡、工具面板、HTML 标签

#### Scenario: 中距简化渲染

- **WHEN** 相机距场景中心在 15-30 之间
- **THEN** Agent SHALL 渲染简化角色（身体+头部），不渲染 HTML overlay 和气泡

#### Scenario: 远距点渲染

- **WHEN** 相机距场景中心 ≥ 30
- **THEN** Agent SHALL 仅渲染状态色小球（SphereGeometry 半径 0.1），无身体/头部几何体

### Requirement: LOD 切换即时生效

LOD 级别变化时 SHALL 即时切换渲染内容，无过渡动画。

#### Scenario: 缩放触发 LOD 切换

- **WHEN** 用户缩放相机从距离 10 变为距离 20
- **THEN** 渲染 SHALL 从近距切换为中距，HTML overlay 立即消失
