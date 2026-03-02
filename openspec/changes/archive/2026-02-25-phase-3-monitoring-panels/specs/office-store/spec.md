## MODIFIED Requirements

### Requirement: Store 包含监控数据字段

office-store SHALL 包含以下监控数据字段：

- `tokenHistory: TokenSnapshot[]` — 环形缓冲区，最多 30 条，每条包含 `{ timestamp: number, total: number, byAgent: Record<string, number> }`
- `agentCosts: Record<string, number>` — 各 Agent 累计 token 成本
- `usagePollEnabled: boolean` — usage 轮询开关（默认 true）

SHALL 提供对应 actions：`pushTokenSnapshot(snapshot)` 自动淘汰旧记录、`setAgentCosts(costs)` 更新成本数据。

#### Scenario: 添加 tokenSnapshot

- **WHEN** 调用 pushTokenSnapshot 添加新快照
- **THEN** tokenHistory SHALL 追加新记录，如已满 30 条则移除最旧记录

#### Scenario: 更新 agentCosts

- **WHEN** 调用 setAgentCosts 更新成本
- **THEN** agentCosts SHALL 反映最新数据
