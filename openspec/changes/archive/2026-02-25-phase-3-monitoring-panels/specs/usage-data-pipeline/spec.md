## ADDED Requirements

### Requirement: 周期性 Usage RPC 轮询

系统 SHALL 每 60 秒调用 `usage.status` RPC 获取 token 消耗数据，并更新 store 中的 tokenHistory。

#### Scenario: 正常轮询

- **WHEN** WebSocket 连接状态为 "connected"
- **THEN** 系统 SHALL 每 60 秒发送 `usage.status` RPC 并将响应写入 tokenHistory

#### Scenario: 断线暂停轮询

- **WHEN** WebSocket 连接断开
- **THEN** 轮询 SHALL 暂停，不发送任何 RPC 请求

#### Scenario: 重连恢复轮询

- **WHEN** WebSocket 重新连接成功
- **THEN** 轮询 SHALL 恢复

### Requirement: TokenHistory 环形缓冲区

tokenHistory SHALL 维护最多 30 条记录（对应 30 分钟），新数据到达时自动淘汰最旧记录。

#### Scenario: 缓冲区满时淘汰

- **WHEN** tokenHistory 已有 30 条记录，新数据到达
- **THEN** 最旧的记录 SHALL 被移除，新记录追加到末尾

### Requirement: RPC 失败时 token 本地聚合

如 `usage.status` RPC 调用失败或不受支持，系统 SHALL 从 Agent 事件中本地聚合 token 数据作为 fallback。

#### Scenario: RPC 不可用

- **WHEN** `usage.status` RPC 连续 3 次失败
- **THEN** 系统 SHALL 切换为从 eventHistory 中的 tool 事件本地估算 token 消耗

### Requirement: Mock 模式数据生成

Mock 模式下，usage 轮询 SHALL 返回随机递增的 token 数据，每个 Agent 有独立的增长速率。

#### Scenario: Mock 模式图表有数据

- **WHEN** 应用在 Mock 模式运行 3 分钟后
- **THEN** tokenHistory SHALL 至少有 3 条记录，折线图显示上升趋势
