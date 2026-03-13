import { useProjectionStore } from "@/perception/projection-store";
import { useOfficeStore } from "@/store/office-store";
import { GlassCard } from "./GlassCard";

function StatusBadge({ isOnline }: { isOnline: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 5,
        padding: "2px 8px",
        borderRadius: 10,
        background: isOnline ? "rgba(41, 211, 145, 0.15)" : "rgba(255, 102, 122, 0.15)",
        fontSize: 10,
        fontWeight: 500,
        color: isOnline ? "var(--lo-good)" : "var(--lo-bad)",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: isOnline ? "var(--lo-good)" : "var(--lo-bad)",
          boxShadow: isOnline
            ? "0 0 6px rgba(41,211,145,0.6)"
            : "0 0 6px rgba(255,102,122,0.6)",
        }}
      />
      {isOnline ? "WS 在线" : "WS 断开"}
    </div>
  );
}

function CollapsedStream({ lines }: { lines: { label: string; detail: string; active: boolean }[] }) {
  const latest = lines.filter((l) => l.active);
  const show = latest.length > 0 ? latest : lines.slice(-2);

  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        overflow: "hidden",
        maskImage: "linear-gradient(90deg, #000 80%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(90deg, #000 80%, transparent 100%)",
      }}
    >
      {show.map((line) => (
        <span
          key={line.label}
          style={{
            fontSize: 9,
            color: line.active ? "var(--lo-cyan)" : "var(--lo-muted)",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          {line.label}
          <span style={{ opacity: 0.6, marginLeft: 3 }}>{line.detail}</span>
        </span>
      ))}
    </div>
  );
}

export function GatewayStatus() {
  const connectionStatus = useOfficeStore((s) => s.connectionStatus);
  const gatewayStream = useProjectionStore((s) => s.sceneArea.gatewayStream);

  const isOnline = connectionStatus === "connected";

  return (
    <GlassCard
      title="Gateway 中控大厅"
      headerExtra={<StatusBadge isOnline={isOnline} />}
      storageKey="lo-hud-gateway"
      collapsedContent={<CollapsedStream lines={gatewayStream} />}
    >
      <div style={{ fontSize: 10, color: "var(--lo-muted)", marginBottom: 6 }}>
        接入事件、分发任务、协调全局
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {gatewayStream.map((line) => (
          <div
            key={line.label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 10,
              color: line.active ? "var(--lo-cyan)" : "var(--lo-muted)",
            }}
          >
            <span style={{ fontWeight: 500 }}>{line.label}</span>
            <span style={{ opacity: 0.75 }}>{line.detail}</span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
