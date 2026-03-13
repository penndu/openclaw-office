import { useMemo } from "react";
import { useProjectionStore } from "@/perception/projection-store";
import { GlassCard } from "./GlassCard";

const FALLBACK_ITEMS = [
  { title: "客户消息到达", desc: "Telegram → Gateway 事件总线" },
  { title: "GM 接单分发", desc: "智能路由 → 匹配最佳 Agent" },
  { title: "Sales 分析报告", desc: "工具调用 → 生成分析结论" },
  { title: "Cron 定时广播", desc: "周期任务 → 全员通知" },
  { title: "Heartbeat 巡检", desc: "健康脉冲 → 状态同步" },
  { title: "Sub-Agent 协作", desc: "拉起子 Agent → 并行执行" },
];

function CollapsedTicker({ items }: { items: { title: string; desc: string }[] }) {
  const latest = items[items.length - 1];
  if (!latest) return null;

  return (
    <div
      style={{
        display: "flex",
        gap: 6,
        overflow: "hidden",
        alignItems: "center",
        maskImage: "linear-gradient(90deg, #000 85%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(90deg, #000 85%, transparent 100%)",
      }}
    >
      <span style={{ fontSize: 9, fontWeight: 600, color: "var(--lo-cyan)", flexShrink: 0 }}>
        {latest.title}
      </span>
      <span
        style={{
          fontSize: 9,
          color: "var(--lo-muted)",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {latest.desc}
      </span>
    </div>
  );
}

export function EventTicker() {
  const narrativeLogs = useProjectionStore((s) => s.narrativeLogs);

  const items = useMemo(() => {
    if (narrativeLogs.length >= 3) {
      return narrativeLogs.slice(-6).map((log) => ({
        title: log.kind.replace(/_/g, " "),
        desc: log.text,
      }));
    }
    return FALLBACK_ITEMS;
  }, [narrativeLogs]);

  const doubled = useMemo(() => [...items, ...items], [items]);

  return (
    <GlassCard
      tag="Perception Layer"
      title="事件流转叙事"
      storageKey="lo-hud-ticker"
      collapsedContent={<CollapsedTicker items={items} />}
    >
      <div style={{ fontSize: 10, color: "var(--lo-muted)", marginBottom: 4 }}>
        把毫秒级系统事件压缩成秒级可感知组织行为
      </div>

      <div
        style={{
          height: 44,
          overflow: "hidden",
          position: "relative",
          maskImage: "linear-gradient(180deg, transparent, #000 15%, #000 85%, transparent)",
          WebkitMaskImage: "linear-gradient(180deg, transparent, #000 15%, #000 85%, transparent)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
            animation: "lo-ticker-scroll 14s linear infinite",
          }}
        >
          {doubled.map((item, i) => (
            <div
              key={`${item.title}-${String(i)}`}
              style={{ display: "flex", gap: 8, alignItems: "baseline", whiteSpace: "nowrap" }}
            >
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: "var(--lo-cyan)",
                  flexShrink: 0,
                }}
              >
                {item.title}
              </span>
              <span
                style={{
                  fontSize: 10,
                  color: "var(--lo-muted)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {item.desc}
              </span>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}
