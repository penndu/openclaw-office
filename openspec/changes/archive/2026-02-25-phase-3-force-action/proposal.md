## Why

当前 OpenClaw Office 是纯"观察"工具——管理员只能看到 Agent 的实时状态，无法对 Agent 进行任何操作干预。设计稿（图2、图6）明确展示了底部操作栏（Pause Agent / Spawn Sub-Agent / Interview）和 Agent 详情弹窗中的 Force Action 按钮。Phase 2 的 ActionBar 已预留了按钮骨架但点击仅显示"此功能将在后续版本中启用"。现在需要将这些占位交互升级为真正可用的 Agent 干预能力，包括上下文菜单、发送消息、暂停/恢复/终止 Agent 等操作。

## What Changes

- **上下文菜单（Context Menu）**：点击 3D 角色或 2D Agent 圆点时弹出右键菜单，提供 Pause/Resume/Kill/Send Message/View Session 操作入口
- **ForceActionDialog 弹窗**：Send Message 模式提供文本输入框+发送按钮，Kill 模式提供确认弹窗，显示操作对象的 Agent 信息
- **RPC 集成**：通过 Gateway WebSocket 发送操作 RPC（pause/resume/kill/send），在前端定义接口，即使后端暂未实现也提供完整 UI 流程
- **权限校验**：基于连接时的 `scopes` 参数检查 `operator` 权限，无权限时按钮禁用+tooltip 说明
- **ActionBar 升级**：将 Phase 2 的占位按钮升级为真正调用 ForceActionDialog 的功能按钮

## Capabilities

### New Capabilities

- `agent-context-menu`: Agent 右键/点击上下文菜单，提供操作入口列表
- `force-action-dialog`: Force Action 操作弹窗（Send Message / Kill 确认），含 Agent 信息展示
- `force-action-rpc`: 通过 Gateway RPC 执行 Agent 干预操作（pause/resume/kill/send-message）
- `operator-permission`: 基于连接 scopes 的 operator 权限校验，控制操作按钮的可用状态

### Modified Capabilities

## Impact

- **修改文件**:
  - `src/components/layout/ActionBar.tsx` — 升级为功能性操作栏
  - `src/components/office-3d/AgentCharacter.tsx` — 添加右键菜单触发
  - `src/components/office-2d/AgentDot.tsx` — 添加右键菜单触发
  - `src/gateway/ws-client.ts` — 新增 Force Action RPC 方法封装
  - `src/store/office-store.ts` — 新增操作权限状态
- **新增文件**:
  - `src/components/overlays/AgentContextMenu.tsx`
  - `src/components/overlays/ForceActionDialog.tsx`
  - `src/gateway/force-action-rpc.ts`
- **测试**: 上下文菜单渲染/交互测试、权限检查单元测试
