## Context

Phase A 已完成架构底座：React Router 路由系统、Gateway Adapter 接口层（含 MockAdapter 和 WsAdapter）、6 个 Console Store 骨架（dashboard/channels/skills/cron/settings/chat-dock）、管控页面占位组件。其中 `chat-dock-store.ts` 已有状态定义（messages、isStreaming、currentSessionKey、dockExpanded）和空的 action 签名，MockAdapter 的 `chatSend` 方法标注了"Phase B 实现 streaming"。

Office 当前布局（AppShell）为：TopBar + main（OfficeView + ActionBar）+ Sidebar。底部无任何交互区域。Chat 需要嵌入 Office 视图底部作为 Dock，不能作为独立页面，以保持 Office 的主入口定位。

OpenClaw Gateway 已有 `chat.send`、`chat.history`、`chat.abort` 方法和 `agent` 事件流（包含 lifecycle/tool/assistant/error stream），前端可复用这些协议实现实时对话。

## Goals / Non-Goals

**Goals:**

- 在 Office 视图（AppShell）底部集成 ChatDockBar 输入条和 ChatTimelineDrawer 消息抽屉
- 实现完整的消息发送链路：输入 → 发送 → 乐观更新 → streaming 接收 → 最终消息
- 支持 streaming 消息展示：thinking 折叠块、tool_use 卡片、Markdown 文本、streaming 进度指示
- 实现会话管理：会话列表、新建会话、切换会话
- 确保 Chat 更新不影响 2D/3D 场景渲染性能
- 完善 MockAdapter chat 方法，支持模拟多步骤 streaming 响应

**Non-Goals:**

- 不实现文件附件的完整上传流程（仅做 UI 占位，显示 staging 状态）
- 不实现图片预览 lightbox（留给后续迭代）
- 不实现"弹出独立聊天窗口"功能
- 不引入第三方 Markdown 库（使用轻量级自实现或 `react-markdown`，视复杂度而定）
- 不实现与 Agent 的深度联动（如"选中 Agent 时自动切换会话上下文"）

## Decisions

### D1: Chat Dock 在 AppShell 中的布局位置

**选择：** 将 ChatDockBar 和 ChatTimelineDrawer 放在 AppShell 的 `<main>` 区域底部，位于 OfficeView 之上、ActionBar 之上。

**布局结构：**

```
<div className="flex flex-col h-screen">
  <TopBar />
  <div className="flex flex-1 overflow-hidden">
    <main className="flex flex-col flex-1 overflow-hidden">
      <div className="flex-1 overflow-hidden relative">
        <OfficeView />        ← 2D/3D 场景，flex-1 占据剩余空间
      </div>
      <ChatTimelineDrawer />  ← 可展开抽屉，固定或动态高度
      <ChatDockBar />         ← 底部固定输入条，~56px
      <ActionBar />
    </main>
    <Sidebar />
  </div>
</div>
```

**理由：**

- ChatDockBar 始终可见（收起态），用户随时可输入
- ChatTimelineDrawer 展开时向上推压 OfficeView，而非遮罩（不阻挡场景操作）
- ActionBar 在 Chat 之下，保持原有位置关系

**替代方案：** 用 CSS overlay 悬浮在 OfficeView 上方——但会遮挡 Agent 动画和交互，违背"不阻塞场景操作"原则。

### D2: Streaming 消息处理架构

**选择：** 通过 Adapter 的 `onEvent` 监听 `chat` 和 `agent` 事件，在 `chat-dock-store` 中维护 streaming 状态机。

**状态机流转：**

```
idle → sending → streaming → done
                           → error
                → aborted
```

**消息更新策略：**

1. 用户发送时创建 optimistic user message（立即显示）
2. 收到 `chat.stream.start` 事件后创建空的 assistant message（isStreaming: true）
3. 收到 `chat.stream.delta` 事件后增量合并 text content
4. 收到 `agent` 事件中的 `tool` stream 时追加 ToolCallInfo 到当前 assistant message
5. 收到 `agent` 事件中的 `assistant` stream 且含 thinking 时更新 thinking 字段
6. 收到 `chat.stream.end` 事件后标记 isStreaming: false

**批处理优化：** streaming delta 使用 `requestAnimationFrame` 或 50ms 节流批处理合并多个 delta，减少 React 重渲染次数。

**理由：** 与 ClawX 的 streaming 处理模式一致，且利用已有的 `onEvent` 机制，不需要新增通信通道。

### D3: Chat Store 与 Office Store 的隔离

**选择：** chat-dock-store 作为独立 Zustand store，不合并到 office-store。组件通过各自的 selector 订阅，避免交叉触发。

**性能隔离措施：**

1. ChatDockBar / ChatTimelineDrawer 仅订阅 `useChatDockStore`
2. OfficeView / AgentDot 仅订阅 `useOfficeStore`
3. Dock 展开/收起状态变化触发 AppShell 重布局时，使用 CSS transition 而非条件渲染，减少 unmount/remount
4. streaming delta 批处理后统一 `set()` 一次，而非每个 delta 调用一次

**理由：** Zustand 的 selector 粒度隔离天然支持这种模式。将 chat 状态混入 office-store 会导致 streaming 高频更新传播到 2D/3D 渲染组件。

### D4: 消息气泡组件架构

**选择：** 单个 `MessageBubble` 组件根据 message 类型分发渲染子组件。

**组件拆分：**

```
MessageBubble
├── UserMessage      ← 用户消息（纯文本 + 附件预览）
├── AssistantMessage ← 助手消息（Markdown + tool_calls + thinking）
│   ├── MarkdownContent   ← Markdown 渲染
│   ├── ThinkingBlock     ← 可折叠的思考过程
│   └── ToolCallCard      ← 工具调用卡片（name + status + result 摘要）
└── StreamingIndicator ← 正在输出的打字动画指示
```

**理由：** 拆分为子组件使得各消息类型可独立优化（如 ToolCallCard 可 memo 化，ThinkingBlock 默认折叠不占渲染资源）。

### D5: Markdown 渲染方案

**选择：** 使用 `react-markdown` + `remark-gfm` 进行 Markdown 渲染。

**理由：**

- `react-markdown` 是 React 生态最成熟的 Markdown 渲染库，体积合理（~30KB gzip）
- 支持 GFM（表格、任务列表、删除线）
- 支持自定义组件映射，可与项目的 Tailwind 样式集成
- 代码块使用 `<pre><code>` 默认样式，不引入额外的语法高亮库（控制体积）

**替代方案：** 手写轻量级 Markdown 解析——但 assistant 消息可能包含复杂格式（表格、嵌套列表、代码块），手写解析维护成本高。

### D6: Agent 选择器与默认行为设计

**选择：** Chat Dock 默认始终显示在 Office 视图底部，默认与 main Agent 对话。在 ChatDockBar 左侧放置 Agent 选择下拉组件（AgentSelector），显示当前对话的 Agent 名称。

**默认行为：**

- Office 页面加载后 ChatDockBar 立即可见，不需要先点击某个 Agent
- 默认目标 Agent 为 main Agent（即 `agents.list` 返回的 `defaultId`）
- chat.send 调用时无需指定 agent——Gateway 默认投递到 main Agent

**Agent 选择器行为：**

- 显示当前对话的 Agent 名称和头像色块
- 下拉列表显示所有可用 Agent（从 office-store 的 agents map 获取）
- 选择不同 Agent 时清空当前消息列表，后续消息投递到所选 Agent 的会话
- 如果用户在 2D/3D 中点击了某个 Agent，ChatDockBar 可联动切换到该 Agent（可选）

**理由：**

- 默认显示降低了用户发现对话能力的门槛——用户进入 Office 就能看到输入框
- Agent 选择器比会话选择器更直观，用户关心的是"和谁对话"而非"哪个 session key"
- 内部仍通过 session key 管理，但 UI 层面以 Agent 为单位呈现

### D7: MockAdapter Streaming 模拟实现

**选择：** `MockAdapter.chatSend` 使用 `setTimeout` 序列模拟多步骤 streaming 响应。

**模拟流程：**

```
chatSend() →
  0ms:   emit("chat", { type: "stream.start", runId })
  200ms: emit("agent", { stream: "assistant", data: { thinking: "让我思考一下..." } })
  600ms: emit("agent", { stream: "tool", data: { name: "web_search", status: "running" } })
  1000ms: emit("agent", { stream: "tool", data: { name: "web_search", status: "done", result: "..." } })
  1200ms: emit("chat", { type: "stream.delta", text: "根据搜索结果，" })
  1400ms: emit("chat", { type: "stream.delta", text: "以下是相关信息..." })
  2000ms: emit("chat", { type: "stream.end", runId })
```

**理由：** 提供真实的 streaming 体验用于 UI 开发和演示，而不需要连接 Gateway。模拟延迟和步骤数足以验证 UI 的各种状态转换。

## Risks / Trade-offs

**[R1] Dock 高度挤压 2D/3D 场景可视区域** → ChatTimelineDrawer 展开时限制最大高度为视口的 40%，且支持拖拽调整高度。收起态仅 ChatDockBar 占 ~56px，对场景影响极小。

**[R2] Markdown 渲染性能——长消息或大量代码块** → 使用 `React.memo` 包裹 MessageBubble，仅在 message 内容变化时重渲染。streaming 中的增量更新仅影响当前正在流式输出的最后一条消息。

**[R3] react-markdown 依赖增加 bundle 体积** → 约增加 ~30KB gzip，相比项目已有依赖可接受。如后续需进一步优化，可改用 lazy import（仅在 Dock 展开时加载）。

**[R4] 事件流中 chat 事件与 agent 事件的时序竞争** → chat-dock-store 使用 runId 关联同一轮对话的所有事件，即使乱序到达也能正确归属。设置 2s 超时保护，超时后将 streaming 消息标记为 done 避免永久挂起。

**[R5] IME 输入法组合输入时误触发发送** → 通过 `isComposing` 状态（compositionstart/compositionend 事件）屏蔽 Enter 键在组合输入中的发送行为，仅在组合完成后响应 Enter。
