## Context

Phase 2 的 ActionBar 已渲染了"暂停 / 派生子Agent / 对话"三个按钮，但点击仅弹出 tooltip "此功能将在后续版本中启用"。Gateway WS 客户端已有通用的 `send()` 方法支持 RPC 请求/响应模式，ConnectParams 中预留了 `scopes` 字段。设计稿图2 展示了底部操作栏，图6 展示了 Agent 详情弹窗中的 Force Action 按钮。

当前 Gateway 侧可能已有 `exec.approval.requested/resolved` 机制，但前端尚未对接。

## Goals / Non-Goals

**Goals:**

- 实现完整的 Agent 右键上下文菜单 UI
- 实现 ForceActionDialog 弹窗（Send Message 输入 + Kill 确认）
- 封装 Force Action RPC 调用层，即使后端暂未实现也能完整演示 UI 流程
- 实现 operator 权限检查，无权限时优雅降级（按钮灰色+提示）
- 升级 ActionBar 从占位到真实功能

**Non-Goals:**

- 不实现 Gateway 后端的 Force Action 处理逻辑（后端已有或待后续实现）
- 不实现 Spawn Sub-Agent 的完整创建流程（仅预留入口，实际创建需要更多参数设计）
- 不实现角色级别的权限矩阵（仅做 operator scope 的二元检查）

## Decisions

### D1: 上下文菜单方案 — HTML Overlay + Portal

**选择**: 使用 React Portal 渲染上下文菜单到 document.body，通过鼠标事件坐标定位。

**替代方案**:

- drei `<Html>` 在 3D 空间中渲染 → 位置跟随相机旋转不稳定，点击区域判定复杂
- 原生 contextmenu 事件 → 浏览器默认菜单干扰

**做法**:

- 3D 模式: AgentCharacter 的 `onContextMenu` 获取鼠标坐标，传递给 store 的 `openContextMenu(agentId, {x, y})`
- 2D 模式: AgentDot 同理
- `AgentContextMenu.tsx` 作为 Portal 组件，根据 store 中的 contextMenu 状态渲染到 body
- 点击菜单外部自动关闭

### D2: ForceActionDialog — 模态弹窗

**选择**: 自建轻量级 Dialog 组件，使用 Tailwind 样式。

**做法**:

- 弹窗包含: Agent 头像+名称、操作类型标题、内容区（Send Message 为 textarea + 发送按钮，Kill 为确认文案 + 确认/取消按钮）
- 操作发送后显示 loading 状态，收到 RPC 响应后关闭弹窗
- RPC 超时（5s）或错误时显示 toast 提示

### D3: RPC 封装 — 独立 force-action-rpc 模块

**选择**: 新建 `src/gateway/force-action-rpc.ts` 封装各 Force Action RPC 调用。

**做法**:

- 定义 RPC 方法接口:
  - `agent.pause(agentId)` — 暂停
  - `agent.resume(agentId)` — 恢复
  - `agent.kill(agentId)` — 终止
  - `agent.message(agentId, text)` — 发送消息
- 每个方法通过 ws-client.send() 发送 RPC 请求，返回 Promise
- 如 Gateway 尚未实现对应方法，前端 RPC 调用将超时并显示 "Gateway 暂不支持此操作"

### D4: 权限校验 — Store 级 scopes 管理

**选择**: 连接成功后从 HelloOk 响应中提取 scopes，存入 store。

**做法**:

- `office-store` 新增 `operatorScopes: string[]`
- 连接成功时从 snapshot/scopes 中解析
- `hasOperatorPermission()` 选择器检查是否包含 "operator"
- ActionBar 和 ContextMenu 中的操作按钮根据权限状态禁用/启用
- Mock 模式默认赋予 operator 权限

## Risks / Trade-offs

- **[Gateway RPC 不可用]** → 前端 RPC 调用将超时。缓解: 5s 超时后显示友好提示，不阻塞 UI
- **[权限信息缺失]** → 旧版 Gateway 可能不返回 scopes。缓解: 未获取到 scopes 时默认允许所有操作
- **[并发操作]** → 多次快速点击可能发送重复 RPC。缓解: 操作期间按钮进入 loading 状态禁止重复点击
