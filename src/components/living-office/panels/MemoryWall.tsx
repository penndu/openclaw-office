import { GlassPanel } from "./GlassPanel";
import { PanelHead } from "./PanelHead";

interface MemoryWallProps {
  entries?: Array<{ text: string; tag: string }>;
}

const DEFAULT_ENTRIES = [
  { text: "跨境客户催跟进", tag: "shared" },
  { text: "合同待回款", tag: "shared" },
];

export function MemoryWall({ entries = DEFAULT_ENTRIES }: MemoryWallProps) {
  return (
    <GlassPanel
      style={{
        position: "absolute",
        left: 982,
        top: 588,
        width: 220,
        height: 72,
        transform: "translateZ(16px)",
      }}
    >
      <PanelHead title="共享记忆墙" subtitle="目标 / 事实 / 上下文" />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 7,
          padding: "0 14px 14px",
        }}
      >
        {entries.slice(0, 3).map((entry) => (
          <div
            key={entry.text}
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 10,
              fontSize: 11,
              padding: "7px 9px",
              background: "rgba(255,255,255,.04)",
              borderRadius: 10,
            }}
          >
            <span style={{ color: "#e6eefc" }}>{entry.text}</span>
            <span style={{ color: "var(--lo-muted)" }}>{entry.tag}</span>
          </div>
        ))}
      </div>
    </GlassPanel>
  );
}
