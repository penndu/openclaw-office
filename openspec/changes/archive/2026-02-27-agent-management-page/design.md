## Context

OpenClaw Office 已有完整的 Console 框架（`ConsoleLayout` + 侧边栏导航 + 路由系统），当前包含 Dashboard、Channels、Skills、Cron、Settings 五个控制台页面。本次变更需要在此框架下新增 `/agents` 页面。

Gateway 已提供完整的 Agent 管理 RPC：`agents.list`、`agents.create`、`agents.update`、`agents.delete`、`agents.files.list`、`agents.files.get`、`agents.files.set`。当前 `GatewayAdapter` 仅封装了 `agentsList()`，其余方法均未接入。

原生 UI（`http://localhost:18789/agents`）的页面结构：

- 左侧 Agent 列表面板（含 Refresh 按钮、Agent 数量统计）
- 右侧 Agent 详情区域，顶部显示 Agent 头像/emoji、名称、ID、DEFAULT 徽章
- 详情区域内 6 个 Tab：Overview、Files、Tools、Skills、Channels、Cron Jobs
- Files Tab 左侧为文件列表卡片（文件名 + 大小 + 时间），右侧为选中文件的内容编辑器（含 Reset / Save 按钮）

## Goals / Non-Goals

**Goals:**

- 在 Console 中新增 `/agents` 页面，复刻 Gateway 原生 Agent 管理的核心功能
- 新增 Agent 创建能力（原生 UI 无此功能）
- 新增 Agent 模型配置能力（原生 UI 的 Overview Tab 未展示模型配置）
- 复用现有 Console 设计系统（Tailwind 样式、LoadingState/ErrorState/EmptyState 组件、i18n 双语）
- 所有 UI 文本通过 i18n 管理

**Non-Goals:**

- 不实现 Agent workspace 文件的批量上传/下载
- 不实现 Agent 间的路由绑定编辑（bindings CRUD，已在 Channels 页面处理）
- 不实现模型 provider 的全局管理（属于 Settings 范畴）
- 不在 Office 2D/3D 视图中联动 Agent 配置变更
- 不实现 Agent 的实时运行状态监控（已在 Office Sidebar 覆盖）

## Decisions

### D1: 页面布局采用"列表 + 详情"双栏结构

**选择**：左侧窄栏（Agent 列表）+ 右侧宽栏（Agent 详情），与原生 UI 一致。

**替代方案**：

- 全页面 Agent 卡片网格 → 不适合展示详情
- 标准表格列表 + 点击展开行 → 不够直观

**理由**：双栏结构是 Agent 管理的标准交互模式，信息密度高且导航效率好。列表侧栏固定宽度 `w-72`，详情区域自适应填充。

### D2: 详情区域使用 Tab 组件切换子视图

**选择**：6 个 Tab（Overview、Files、Tools、Skills、Channels、Cron Jobs），Tab 切换不改变 URL（纯 UI 状态）。

**替代方案**：

- 每个 Tab 作为独立子路由（`/agents/:id/files`）→ 增加路由复杂度，且跨 Tab 数据可复用
- 手风琴折叠面板 → 不适合多个等重的功能区

**理由**：原生 UI 使用 Tab 模式，用户已熟悉；纯 UI 状态切换更轻量，Tab 选择由 `agents-store` 管理。

### D3: 新建 Agent 使用 Dialog 表单

**选择**：在 Agent 列表上方放置「+ 添加 Agent」按钮，点击后弹出 Dialog（含 name、workspace、emoji 字段），调用 `agents.create` 后刷新列表。

**替代方案**：

- 内联表单（在列表底部嵌入表单）→ 空间不够，易与列表项混淆
- 跳转独立页面 → 打断当前工作流

**理由**：Dialog 模式简洁，避免页面跳转；表单字段少（仅 name、workspace、emoji/avatar），Dialog 承载恰当。

### D4: 模型配置在 Overview Tab 内编辑

**选择**：Overview Tab 展示 Agent 的基本信息和模型配置，模型配置以可编辑表单形式呈现（primary model 输入框 + fallbacks 列表），修改后调用 `agents.update`。

**理由**：模型配置是 Agent 的核心属性，放在 Overview Tab 中符合信息层级；无需单独的 Tab 或 Dialog。

### D5: 文件编辑使用 Textarea + Save/Reset 按钮

**选择**：Files Tab 中，选中文件后右侧显示文件内容的 textarea，带 Save 和 Reset 按钮。Save 调用 `agents.files.set`，Reset 恢复到服务端内容。

**替代方案**：

- 集成 Monaco Editor → 依赖体积过大，且文件为 Markdown 不需要 IDE 级编辑能力
- 实时自动保存 → 容易误操作，对配置文件不安全

**理由**：Markdown 文件编辑用 textarea 即可满足需求；显式 Save/Reset 操作更安全，防止误修改。

### D6: `agents-store` 管理页面状态

**选择**：新建 `src/store/agents-store.ts`（Zustand），管理：

- Agent 列表数据（`agents: AgentDetail[]`）
- 选中 Agent ID（`selectedAgentId`）
- 当前活跃 Tab（`activeTab`）
- 文件列表和选中文件内容
- 加载/错误状态
- 搜索过滤关键字

**理由**：遵循现有 Console Store 模式（如 `skills-store.ts`、`channels-store.ts`），每个 Console 页面一个独立 store。

### D7: 扩展 `AgentSummary` 类型

**选择**：扩展现有 `AgentSummary` 接口以携带更多字段（identity.emoji、identity.avatar、identity.avatarUrl、default 标识），同时新增 `AgentDetail` 接口用于详情页。

**理由**：`agents.list` 返回的数据已包含 identity 信息，当前类型定义未覆盖完整字段。

## Risks / Trade-offs

- **[RPC 方法未开放]** → `agents.create`、`agents.update`、`agents.delete`、`agents.files.*` 在 Gateway 侧已实现但需要 `operator.write` scope。当前连接以 `operator.admin` scope 认证，已涵盖 write 权限。需要在 UI 中检测 scope 并在权限不足时禁用写操作按钮。
  → **缓解**：UI 层做权限检查提示，降级为只读模式。

- **[文件编辑无冲突检测]** → 如果其他客户端同时编辑同一文件，可能出现覆盖。
  → **缓解**：第一期不做乐观并发控制，Save 前提示「将覆盖服务端内容」。

- **[Agent 删除不可逆]** → 删除 Agent 可能连带删除 workspace 文件。
  → **缓解**：删除前使用 ConfirmDialog 双重确认，明确提示风险；`deleteFiles` 参数默认为 `false`。

- **[模型 ID 输入验证]** → 用户输入模型名称格式（`provider/model`）可能不正确。
  → **缓解**：前端做格式校验（`/` 分隔），但不验证模型是否实际存在（由 Gateway 在运行时校验）。
