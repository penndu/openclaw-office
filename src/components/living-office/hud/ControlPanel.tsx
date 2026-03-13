import { GlassCard } from "./GlassCard";

interface DemoButton {
  label: string;
  color: string;
  hoverColor: string;
  onClick: () => void;
}

interface ControlPanelProps {
  buttons: DemoButton[];
}

const LEGEND_ITEMS = [
  { color: "var(--lo-good)", label: "空闲/正常" },
  { color: "var(--lo-cyan)", label: "忙碌/执行中" },
  { color: "var(--lo-bad)", label: "阻塞/异常" },
  { color: "var(--lo-warn)", label: "Heartbeat" },
  { color: "var(--lo-violet)", label: "Cron" },
];

function CollapsedControls() {
  return (
    <span style={{ fontSize: 9, color: "var(--lo-muted)", opacity: 0.7 }}>
      展开操作台
    </span>
  );
}

export function ControlPanel({ buttons }: ControlPanelProps) {
  return (
    <GlassCard
      tag="Preview Controls"
      title="交互触发"
      storageKey="lo-hud-control"
      collapsedContent={<CollapsedControls />}
    >
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
        {buttons.map((btn) => (
          <button
            key={btn.label}
            type="button"
            onClick={btn.onClick}
            style={{
              padding: "3px 8px",
              fontSize: 9,
              fontWeight: 600,
              border: "none",
              borderRadius: 6,
              background: btn.color,
              color: "#fff",
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "background 0.15s, transform 0.1s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = btn.hoverColor;
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = btn.color;
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            {btn.label}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 5, flexWrap: "wrap" }}>
        {LEGEND_ITEMS.map((item) => (
          <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 3 }}>
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: item.color,
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: 8, color: "var(--lo-muted)" }}>{item.label}</span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
