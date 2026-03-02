## Why

Phase A 已完成架构底座（路由系统、Gateway Adapter 接口层、Console Stores 骨架、管控页面占位组件），Office 现在具备多页面工作台的基本框架。但当前 Office 仅有"只读监控"能力——用户只能观察 Agent 行为，无法直接与 Agent 交互。

根据 ClawX 界面复刻规划（Phase B），需要在 Office 视图底部实现 Chat 对话能力，将 ClawX 的独立 Chat 页面以"底部 Dock"形式嵌入 Office 主屏。这使 Office 从"可视化监控"升级为"可视化 + 可操作"的交互工作台——用户可以一边观察 Agent 协作动画，一边直接向 Agent 发送指令并查看实时响应。

## What Changes

- **新增 ChatDockBar 组件**：固定在 Office 视图底部的输入条，默认始终显示（不需要点击 Agent 才出现），默认与 main Agent 对话；包含消息输入框、附件按钮、发送/停止按钮、Agent 选择器（可选择特定 Agent 对话）
- **新增 ChatTimelineDrawer 组件**：可展开的消息时间线抽屉，支持 user/assistant 消息流渲染、Markdown 格式化、thinking 折叠块、tool_use 卡片、streaming 状态指示
- **新增 message-utils 工具模块**：消息解析、Markdown 渲染、streaming delta 合并、tool_result 图片挂载等实用函数
- **完善 chat-dock-store**：将 Phase A 的骨架 store 填充为完整业务逻辑，包括消息发送/接收、streaming 处理、会话管理、乐观更新
- **完善 MockAdapter 的 Chat 方法**：为 chatSend 实现模拟 streaming 响应（包含 thinking、tool_use、text delta），chatHistory 返回合理的模拟对话记录
- **2D/3D 同屏性能优化**：Chat 更新与 Office 渲染分离，streaming updates 批处理（50~100ms），避免全树重渲染

## Capabilities

### New Capabilities

- `chat-dock-bar`: 底部固定输入条组件——默认显示，默认 main Agent 对话，支持 Agent 选择器切换目标 Agent，消息输入、发送/停止控制、输入交互（Enter 发送/Shift+Enter 换行/IME 防误发）
- `chat-timeline`: 消息时间线抽屉组件——消息流渲染、Markdown 格式化、thinking 折叠、tool_use 卡片、streaming 实时展示、图片预览
- `chat-message-utils`: 消息处理工具库——streaming delta 合并、Markdown 解析、tool_result 图片挂载、消息类型判断
- `chat-dock-store-impl`: Chat Dock 完整 store 实现——消息 CRUD、streaming 生命周期管理、会话切换、乐观更新、错误处理

### Modified Capabilities

- `gateway-adapter`: MockAdapter 的 chat 相关方法需实现模拟 streaming 响应，支持多步骤事件发射（thinking → tool_use → text delta → final）
- `office-store`: 需增加 chatDockHeight 持久化状态和 Dock 展开/收起与 Office 布局的联动逻辑

## Impact

- **文件变更范围**：
  - `src/components/layout/AppShell.tsx` — 集成 ChatDockBar 到 Office 底部布局
  - `src/store/console-stores/chat-dock-store.ts` — 从骨架升级为完整实现
  - `src/gateway/mock-adapter.ts` — 完善 chat 相关方法的模拟实现
  - `src/gateway/adapter-types.ts` — 可能需要补充 streaming 事件类型
- **新增文件**：
  - `src/components/chat/ChatDockBar.tsx` — 底部输入条
  - `src/components/chat/ChatTimelineDrawer.tsx` — 消息时间线抽屉
  - `src/components/chat/MessageBubble.tsx` — 单条消息气泡
  - `src/components/chat/ToolCallCard.tsx` — 工具调用卡片
  - `src/components/chat/ThinkingBlock.tsx` — Thinking 折叠块
  - `src/components/chat/SessionSelector.tsx` — 会话选择器
  - `src/lib/message-utils.ts` — 消息处理工具函数
- **新增依赖**：`react-markdown`（Markdown 渲染）、`react-textarea-autosize`（自适应输入框）
- **性能考量**：Chat streaming 更新与 2D/3D 场景渲染隔离，避免高频状态更新导致 Office 视图帧率下降
- **不破坏现有功能**：Office 2D/3D 视图、Agent 监控、管控页面路由等 Phase A 成果保持不变
- **默认行为变更**：Chat Dock 默认在 Office 页面始终显示（不依赖选中 Agent），默认与 main Agent 对话
- **测试策略**：以真实 OpenClaw Gateway 为准进行浏览器验证，而非仅 mock 数据测试
