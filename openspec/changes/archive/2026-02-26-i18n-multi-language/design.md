## Context

OpenClaw Office 是基于 React 19 + Zustand 5 + Tailwind CSS 4 的实时监控前端。当前 UI 文本以中文硬编码方式散落在 35+ 个源文件中（约 120–150 条字符串），包括状态标签、按钮文案、占位符、错误提示、时间格式化、区域名称等。项目使用 Vite 6 构建，采用 ESM + TypeScript strict 模式。

现有技术栈中与 i18n 相关的关键约束：

- React 19 hooks 是核心 API 模式
- Zustand 管理全局状态（主题、连接状态等），偏好保存在 `localStorage`
- 无 SSR 需求，纯 SPA 架构
- 测试使用 Vitest + @testing-library/react

## Goals / Non-Goals

**Goals:**

- 引入成熟的 i18n 框架，实现中文 / 英文双语支持
- 所有 UI 可见文本（含 aria-label、title、placeholder）均可翻译
- 语言偏好持久化到 localStorage，刷新后自动恢复
- 翻译资源按命名空间组织，便于按模块维护
- 架构可扩展，后续新增语言仅需添加 JSON 文件
- 默认语言为中文，保持现有用户无感迁移

**Non-Goals:**

- 不做右到左（RTL）语言支持
- 不做服务端语言协商（无 SSR）
- 不引入翻译管理平台（如 Crowdin、Lokalise）
- 不对 mock-adapter 中的模拟数据做翻译（mock 数据仅用于开发调试）
- 不修改 Gateway 协议或后端返回的文本

## Decisions

### Decision 1: i18n 框架选型 — react-i18next

**选择：** `i18next` + `react-i18next`

**替代方案：**

| 方案                    | 优点                                                                                                | 缺点                                                       |
| ----------------------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `react-i18next`         | 生态最成熟；React hooks API (`useTranslation`)；插件丰富（检测、缓存、命名空间）；TypeScript 支持好 | 包体略大（~13KB gzipped）                                  |
| `react-intl` (FormatJS) | ICU 消息格式标准；强类型                                                                            | API 偏重，Context 嵌套深；社区活跃度略低于 i18next         |
| 自研轻量方案            | 零依赖；完全可控                                                                                    | 需自行实现插值、复数、命名空间、持久化等；维护成本高       |
| `lingui`                | 编译时提取；包体小                                                                                  | 需额外 Babel/SWC 插件配置；与 Vite + React 19 集成文档较少 |

**理由：** react-i18next 是 React 生态中使用最广泛的 i18n 方案（npm 周下载量 3M+），与 React 19 hooks 完美适配，`useTranslation` hook 简洁直接，命名空间机制天然适合按模块拆分翻译文件。项目无 SSR 需求，使用 `i18next-browser-languagedetector` 即可完成语言自动检测与 localStorage 持久化。

### Decision 2: 翻译资源组织 — 按命名空间拆分 JSON

**选择：** 在 `src/i18n/locales/` 下按 `{lang}/{namespace}.json` 组织

```
src/i18n/
├── index.ts              # i18next 初始化配置
└── locales/
    ├── zh/
    │   ├── common.json    # 通用文本（连接状态、通用按钮等）
    │   ├── layout.json    # TopBar、Sidebar、ActionBar
    │   ├── office.json    # 2D/3D 办公室场景
    │   ├── panels.json    # 侧边面板、图表
    │   ├── chat.json      # 聊天 Dock
    │   └── console.json   # 控制台页面
    └── en/
        ├── common.json
        ├── layout.json
        ├── office.json
        ├── panels.json
        ├── chat.json
        └── console.json
```

**替代方案：**

- 单文件（`zh.json` / `en.json`）：简单但随着字符串增多维护困难
- 按组件文件 1:1 对应：过于碎片化，难以复用公共 key

**理由：** 按功能域拆分（6 个命名空间），既避免单文件过大，又不至于碎片化。命名空间与项目目录结构大致对应，新成员容易找到对应翻译文件。i18next 原生支持命名空间懒加载（虽然当前体量无需懒加载，但架构已为未来做好准备）。

### Decision 3: 语言检测与回退策略

**选择：** `i18next-browser-languagedetector` 插件

检测优先级：

1. `localStorage` 中的 `i18nextLng` key（用户手动选择的语言）
2. 浏览器 `navigator.language`
3. 回退到 `zh`（默认语言）

**理由：** 用户手动选择的语言优先级最高，保证用户意图被尊重。首次访问时根据浏览器语言自动匹配（中文浏览器 → zh，英文浏览器 → en），降低用户切换成本。最终回退到中文，与当前产品行为一致。

### Decision 4: 翻译 key 命名规范

**选择：** `namespace:section.descriptiveKey` 扁平化结构

示例：

```
layout:topbar.connectionStatus.connected    → "已连接" / "Connected"
layout:sidebar.filter.all                   → "全部" / "All"
panels:metrics.overview                     → "概览" / "Overview"
common:actions.send                         → "发送" / "Send"
common:actions.cancel                       → "取消" / "Cancel"
```

**理由：** 扁平化 key 配合 `.` 分隔符（i18next 默认 `nsSeparator: ':'`，`keySeparator: '.'`），在 IDE 中搜索和自动补全最方便。section 前缀标明所属 UI 区域，descriptiveKey 描述语义而非位置，确保 key 在 UI 重构后仍有意义。

### Decision 5: 语言切换组件实现

**选择：** 独立 `LanguageSwitcher` 组件，放置于 TopBar 右侧

**交互设计：**

- 使用紧凑的按钮式切换（非下拉菜单），因为当前只有 2 种语言
- 显示当前未激活语言的名称作为切换目标（如当前中文时显示 "EN"，当前英文时显示 "中"）
- 点击即刻切换，无需确认
- 未来语言 > 2 时可升级为下拉菜单

**实现方式：**

- 使用 `i18next.changeLanguage()` 切换语言
- `i18next-browser-languagedetector` 自动将选择保存到 localStorage
- 无需在 Zustand store 中维护 locale 状态，i18next 自身即为 locale 的 single source of truth
- 通过 `useTranslation` hook 的响应性自动触发组件重渲染

### Decision 6: Store 层面 locale 不入 Zustand

**选择：** 不在 `office-store` 中维护 locale 状态

**替代方案：**

- 在 office-store 中新增 `locale` 字段并通过 `setLocale` action 同步到 i18next

**理由：** i18next 自身已是 locale 状态管理器，内置 localStorage 持久化、语言变更事件、React binding（`useTranslation` 会自动响应语言变化）。如果同时在 Zustand 中维护 locale，会产生双源头同步问题。对于 office-store spec 的修改降级为"无需修改"——这简化了实现并避免了状态同步风险。

### Decision 7: 测试策略

**选择：** 在测试中注入简化 i18n 配置

- 创建 `src/i18n/test-setup.ts`，配置 i18next 使用内联资源（无需加载文件）
- 测试中使用 `I18nextProvider` 包裹被测组件
- 现有测试中的中文断言暂时保持，因为测试环境默认语言为 `zh`，断言值不变
- 新增 LanguageSwitcher 组件测试，验证切换行为
- 新增 i18n 配置测试，验证命名空间加载和回退策略

## Risks / Trade-offs

| 风险                                                             | 缓解措施                                                                                    |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| **翻译遗漏**：部分硬编码文本被遗漏未提取                         | 实现完成后用 `rg` 全局搜索中文字符（`[\u4e00-\u9fff]`），确认剩余硬编码仅限 mock 数据和注释 |
| **key 不一致**：不同开发者使用不同命名风格                       | 在 spec 中明确 key 命名规范，PR review 时重点检查                                           |
| **包体增大**：新增 i18next 依赖约 13KB gzipped                   | 相对于 3D 渲染依赖（three.js ~150KB）影响可忽略                                             |
| **测试断言失效**：切换默认语言可能导致现有测试中的硬编码断言失败 | 测试环境固定 `lng: 'zh'`，确保现有测试断言不受影响                                          |
| **翻译质量**：英文翻译可能不够地道                               | 先由 AI 生成初版，后续可人工审校；翻译文件集中管理便于审阅                                  |
| **插值与复数**：部分文本含动态数值和复数规则                     | 使用 i18next 内置插值 `{{count}}` 和复数规则 `_one` / `_other` 后缀                         |

## Open Questions

- 暂无。如实现中发现新问题，在对应 spec 或 task 中追踪。
