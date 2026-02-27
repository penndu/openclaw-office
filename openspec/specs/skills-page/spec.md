# skills-page Specification

## Purpose
TBD - created by archiving change clawx-phase-c-console-pages. Update Purpose after archive.
## Requirements
### Requirement: Skills 页面布局与双 Tab 视图

SkillsPage SHALL 在挂载时自动调用 `useSkillsStore.fetchSkills()` 获取技能数据，展示三种状态：加载中（LoadingState）、错误（ErrorState + 重试）、正常内容。

页面布局 SHALL 分为：
1. **标题栏** — 页面标题 + 刷新按钮
2. **Tab 切换** — Installed / Marketplace 双 Tab
3. **Installed 视图** — 搜索框 + 来源筛选按钮组 + 技能卡片网格
4. **Marketplace 视图** — 安全提示卡 + 市场搜索框 + 市场结果卡片网格

**Installed Tab** 显示所有已安装（或 bundled）的技能。
**Marketplace Tab** 参考 ClawX 的发现页设计，显示所有非 bundled 的技能候选项，并提供更清晰的安装入口和安装状态反馈。

#### Scenario: 首次挂载加载数据
- **WHEN** SkillsPage 首次挂载
- **THEN** 自动调用 `fetchSkills()` 并显示 LoadingState

#### Scenario: Tab 切换
- **WHEN** 用户点击 "Marketplace" Tab
- **THEN** 页面切换为独立的 Marketplace 发现视图，而不是继续复用 Installed 卡片布局

#### Scenario: 来源筛选
- **WHEN** 用户选择"Built-in"筛选
- **THEN** 仅显示 `isBundled === true` 的技能

### Requirement: Installed 视图参考 ClawX 的筛选与浏览结构

Installed 视图 SHALL 参考 ClawX 的技能浏览区，提供：

1. 本地搜索框（按名称 / 描述过滤）
2. 来源筛选按钮组（All / Built-in / Marketplace），并显示数量
3. 技能卡片网格，按 `enabled`、`isCore`、名称排序

#### Scenario: 已启用技能排在前面
- **WHEN** 同时存在 enabled 和 disabled 技能
- **THEN** enabled 技能应优先显示

#### Scenario: 核心技能排在普通技能前面
- **WHEN** 同时存在 core skill 与普通技能
- **THEN** core skill 应优先显示

### Requirement: Marketplace 视图参考 ClawX 的发现页设计

Marketplace 视图 SHALL 参考 `ClawX/src/pages/Skills/index.tsx` 的结构，包含：

1. 安全提示卡，提醒用户先审查技能来源与文档
2. 搜索框与搜索按钮
3. Marketplace 卡片网格
4. 空态/搜索中/搜索失败三种反馈

**说明**:
- 当前 OpenClaw Office 不实现 ClawX Electron IPC 的远程 ClawHub 搜索
- 搜索行为 SHALL 在 `skills.status()` 返回的 `!isBundled` 技能候选集合上执行本地过滤
- Marketplace 结果卡片 SHALL 与 Installed 卡片视觉和动作分离

#### Scenario: 市场搜索
- **WHEN** 用户在 Marketplace 视图输入关键词
- **THEN** 结果按名称、描述、slug 做本地过滤

#### Scenario: 市场空态
- **WHEN** Marketplace 没有匹配项
- **THEN** 页面显示独立空态文案，而不是 Installed 页的空态

#### Scenario: 安全提示展示
- **WHEN** 用户进入 Marketplace 视图
- **THEN** 顶部显示一条安全提示卡，说明安装前应审查技能来源和配置要求

### Requirement: 技能卡片组件

每个技能 SHALL 以卡片形式展示，包含：

1. 技能图标（emoji 或 icon 字段）
2. 技能名称
3. 技能描述（截断为 2 行）
4. 来源标签（Built-in / Marketplace）
5. 版本号
6. 启用/禁用状态开关
7. 操作菜单：配置、安装/卸载（根据状态）

卡片 SHALL 根据状态有视觉区分：
- enabled → 正常色调
- disabled → 半透明灰色
- 有 missing requirements → 黄色警告标识

#### Scenario: 渲染已启用的 core 技能
- **WHEN** 技能 isCore=true, enabled=true
- **THEN** 显示正常色调卡片 + "Built-in" 标签 + 启用开关为开启状态
- **THEN** 开关禁用（不可关闭 core 技能）

#### Scenario: 渲染已禁用的 marketplace 技能
- **WHEN** 技能 isBundled=false, enabled=false
- **THEN** 显示半透明卡片 + "Marketplace" 标签 + 启用开关为关闭状态

#### Scenario: 技能有缺失依赖
- **WHEN** 技能 `missing.bins` 非空数组
- **THEN** 卡片右上角显示黄色警告图标 + 提示"缺少依赖"

### Requirement: MarketplaceSkillCard 独立于 Installed SkillCard

系统 SHALL 提供独立的 Marketplace 卡片组件，参考 ClawX 的市场卡片交互：

1. 卡片整体可作为“查看更多信息”的入口
2. 右上角显示安装按钮或已安装态
3. 安装中时显示 loading 态
4. 底部展示版本、作者和安装来源提示

#### Scenario: 已安装市场技能
- **WHEN** Marketplace 卡片对应的技能已经在已安装列表中
- **THEN** 卡片右上角显示已安装标识或禁用安装按钮

#### Scenario: 未安装市场技能
- **WHEN** Marketplace 卡片对应技能尚未安装
- **THEN** 卡片右上角显示安装按钮

#### Scenario: 安装中状态
- **WHEN** 用户点击安装且请求未完成
- **THEN** Marketplace 卡片右上角进入 loading 状态

### Requirement: 技能启用/禁用操作

用户切换技能启用开关时，系统 SHALL：

1. 如果是 core skill（`isCore === true` 且 `always === true`），开关 SHALL 被禁用，不可切换
2. 否则调用 `adapter.skillsUpdate(skillKey, { enabled: !currentEnabled })`
3. 成功后更新 store 中对应技能的 enabled 状态
4. 失败时回滚开关状态并显示错误 toast

#### Scenario: 禁用非核心技能
- **WHEN** 用户关闭 "Image Generation" 技能的开关
- **THEN** 调用 `skillsUpdate("image-gen", { enabled: false })`
- **THEN** 成功后卡片变为半透明

#### Scenario: 尝试禁用核心技能
- **WHEN** 用户尝试关闭 "Web Search"（isCore=true）
- **THEN** 开关不响应（disabled 状态），显示 tooltip "核心技能不可禁用"

#### Scenario: 禁用操作失败回滚
- **WHEN** `skillsUpdate()` 返回失败
- **THEN** 开关回滚到之前的状态，显示错误提示

### Requirement: 技能安装操作

Marketplace Tab 中未安装的技能 SHALL 显示"安装"按钮。安装流程：

1. 如果技能有多个 `installOptions`，弹出选择弹窗让用户选择安装方式（如 brew / node / go）
2. 调用 `adapter.skillsInstall(name, installId)`
3. 安装进行中按钮显示 loading 状态
4. 安装完成后刷新技能列表
5. 安装失败显示错误信息

#### Scenario: 安装技能（单一安装选项）
- **WHEN** 技能仅有 1 个 installOption
- **THEN** 直接调用 `skillsInstall(name, installId)` 无需选择弹窗

#### Scenario: 安装技能（多安装选项）
- **WHEN** 技能有 brew / node 两个 installOption
- **THEN** 弹窗显示"通过 Homebrew 安装" / "通过 npm 安装"选项
- **WHEN** 用户选择 brew
- **THEN** 调用 `skillsInstall("playwright", "brew")`

#### Scenario: 安装失败
- **WHEN** `skillsInstall()` 返回 `{ ok: false, message: "brew not found" }`
- **THEN** 显示错误提示 "brew not found"

#### Scenario: 已安装技能不重复安装
- **WHEN** Marketplace 卡片对应技能已安装
- **THEN** 不再展示可点击的安装主按钮

### Requirement: 技能详情/配置弹窗

点击技能卡片的"配置"按钮 SHALL 打开详情弹窗，包含两个面板：

**Info 面板**（左侧或顶部）：
- 技能名称、描述、版本、作者、来源
- 主页链接（homepage，可点击）
- 依赖状态列表（requirements.bins 各项及其是否满足）

**Config 面板**（右侧或底部）：
- API Key 输入框（如果技能有 `primaryEnv` 字段）— secret 类型
- 环境变量编辑（key-value 表格，可增删行）
- configChecks 状态展示（每项 path + satisfied 状态）
- 保存按钮 — 调用 `skillsUpdate(skillKey, { apiKey, env })`
- 底部状态栏显示当前启用状态与启用开关

#### Scenario: 配置含 API Key 的技能
- **WHEN** 打开 "Web Search" 技能的配置弹窗
- **WHEN** 该技能 primaryEnv 为 "SEARCH_API_KEY"
- **THEN** 显示 API Key 输入框

#### Scenario: 保存技能配置
- **WHEN** 用户修改 API Key 并点击保存
- **THEN** 调用 `skillsUpdate("web-search", { apiKey: "new-key" })`
- **THEN** 成功后关闭弹窗并刷新技能列表

#### Scenario: 无配置项的技能
- **WHEN** 打开的技能无 primaryEnv 且无 configChecks
- **THEN** Config 面板显示"此技能无需配置"

#### Scenario: 详情弹窗底部切换启用状态
- **WHEN** 用户在详情弹窗底部切换启用开关
- **THEN** 调用 `toggleSkill()` 更新技能启停
- **THEN** core skill 仍不可禁用

### Requirement: Skills Store 扩展

`useSkillsStore` SHALL 扩展以下状态和 actions：

- 新增 `activeTab: "installed" | "marketplace"` — 当前 Tab
- 新增 `sourceFilter: "all" | "built-in" | "marketplace"` — 来源筛选
- 新增 `selectedSkill: SkillInfo | null` — 当前选中技能（详情弹窗）
- 新增 `detailDialogOpen: boolean` — 详情弹窗状态
- 新增 `installing: Set<string>` — 正在安装中的技能 ID 集合
- 新增 `setTab(tab)` / `setSourceFilter(filter)` / `openDetail(skill)` / `closeDetail()` actions
- 新增 `toggleSkill(skillKey, enabled)` — 启用/禁用技能
- 新增 `installSkill(name, installId)` — 安装技能
- `fetchSkills()` 增加对 WsAdapter `skillsStatus` 扩展返回值的处理
- 新增 `searchQuery` / `marketplaceQuery` 或同等组件层状态支持本地搜索与市场搜索体验
- 新增 `installedSkillIds` 或同等计算逻辑，用于在 Marketplace 视图中识别已安装技能

**Computed 数据**（在组件层通过 store 选择器计算）：
- `filteredSkills` — 根据 activeTab + sourceFilter 过滤后的技能列表
- `installedSkills` — `isBundled || eligible` 的技能
- `marketplaceSkills` — `!isBundled` 的技能

#### Scenario: 切换 Tab 更新列表
- **WHEN** 调用 `setTab("marketplace")`
- **THEN** `activeTab` 更新为 "marketplace"
- **THEN** 组件重新计算 `filteredSkills` 仅展示 marketplace 技能

#### Scenario: 安装中状态追踪
- **WHEN** 调用 `installSkill("image-gen", "node")`
- **THEN** `installing` 集合添加 "image-gen"
- **THEN** 安装完成后从 `installing` 移除

