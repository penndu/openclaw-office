# domain-mapping Specification

## Purpose

TBD - created by archiving change clawx-phase-a-architecture. Update Purpose after archive.

## Requirements

### Requirement: ViewModel 类型定义

系统 SHALL 在 `src/lib/view-models.ts` 中定义管控页面使用的 ViewModel TypeScript 类型，页面组件 SHALL 仅消费 ViewModel 而非 Gateway 原始 payload。

#### Scenario: Channel ViewModel 定义

- **WHEN** ViewModel 类型文件创建完成
- **THEN** SHALL 包含 `ChannelCardVM` 类型，含字段：`id: string`、`name: string`、`type: string`（渠道类型）、`statusLabel: string`（人类可读状态）、`statusColor: string`（状态对应颜色）、`icon: string`（渠道图标标识）

#### Scenario: Skill ViewModel 定义

- **WHEN** ViewModel 类型文件创建完成
- **THEN** SHALL 包含 `SkillCardVM` 类型，含字段：`id: string`、`name: string`、`description: string`、`enabled: boolean`、`icon: string`、`source: string`（来源：built-in / marketplace）

#### Scenario: CronTask ViewModel 定义

- **WHEN** ViewModel 类型文件创建完成
- **THEN** SHALL 包含 `CronTaskCardVM` 类型，含字段：`id: string`、`name: string`、`schedule: string`（cron 表达式）、`scheduleLabel: string`（人类可读频率）、`enabled: boolean`、`lastRunAt: number | null`、`nextRunAt: number | null`、`statusLabel: string`

### Requirement: ViewModel 转换函数骨架

系统 SHALL 为每种 ViewModel 提供从 Gateway payload 到 ViewModel 的纯函数转换器。

#### Scenario: 转换函数的纯函数特性

- **WHEN** 调用任何 ViewModel 转换函数
- **THEN** 转换函数 SHALL 为纯函数（无副作用），输入为 Gateway adapter 返回的原始类型，输出为对应的 ViewModel 类型

#### Scenario: Phase A 转换函数实现

- **WHEN** Phase A 实施完成
- **THEN** 转换函数 SHALL 至少定义类型签名。对于已知的字段映射（如 status → statusLabel/statusColor）SHALL 提供初步实现；复杂的业务转换逻辑 SHALL 在后续 Phase 填充
