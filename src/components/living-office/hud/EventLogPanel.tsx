import { useEffect, useRef } from "react";
import { useProjectionStore } from "@/perception/projection-store";
import { GlassCard } from "./GlassCard";

function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function LogCount({ count }: { count: number }) {
  return (
    <span style={{ fontSize: 9, color: "var(--lo-muted)", opacity: 0.8 }}>
      {count} 条
    </span>
  );
}

function CollapsedLog({ text }: { text: string }) {
  return (
    <span
      style={{
        fontSize: 9,
        color: "var(--lo-muted)",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </span>
  );
}

export function EventLogPanel() {
  const narrativeLogs = useProjectionStore((s) => s.narrativeLogs);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [narrativeLogs]);

  const latestText = narrativeLogs.length > 0
    ? narrativeLogs[narrativeLogs.length - 1].text
    : "等待事件…";

  return (
    <GlassCard
      tag="Narrative Log"
      title="事件日志"
      headerExtra={<LogCount count={narrativeLogs.length} />}
      storageKey="lo-hud-log"
      collapsedContent={<CollapsedLog text={latestText} />}
    >
      <div
        ref={scrollRef}
        style={{
          maxHeight: 42,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 2,
          scrollbarWidth: "none",
        }}
      >
        {narrativeLogs.length === 0 ? (
          <div style={{ fontSize: 10, color: "var(--lo-muted)", opacity: 0.5, fontStyle: "italic" }}>
            等待事件…
          </div>
        ) : (
          narrativeLogs.map((log, i) => (
            <div
              key={`${String(log.ts)}-${String(i)}`}
              style={{ display: "flex", gap: 8, fontSize: 10, lineHeight: 1.4 }}
            >
              <span
                style={{
                  color: "var(--lo-muted)",
                  opacity: 0.6,
                  flexShrink: 0,
                  fontFamily: "monospace",
                  fontSize: 9,
                }}
              >
                {formatTime(log.ts)}
              </span>
              <span
                style={{
                  color: "var(--lo-text)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {log.text}
              </span>
            </div>
          ))
        )}
      </div>
    </GlassCard>
  );
}
