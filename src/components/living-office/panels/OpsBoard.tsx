import { GlassPanel } from "./GlassPanel";
import { PanelHead } from "./PanelHead";

const DEFAULT_RULES = [
  "Gateway 接收外部消息并做事件压缩",
  "General Manager 负责主线调度",
  "高频内部事件只进状态，不强制人物移动",
  "长任务才允许出现跨区走动",
];

interface OpsBoardProps {
  rules?: string[];
}

export function OpsBoard({ rules = DEFAULT_RULES }: OpsBoardProps) {
  return (
    <GlassPanel
      style={{
        position: "absolute",
        left: 480,
        top: 100,
        width: 390,
        height: 154,
        transform: "translateZ(16px)",
      }}
    >
      <PanelHead title="组织行为板" subtitle="因果链比热闹更重要" />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 7,
          padding: "0 14px 14px",
        }}
      >
        {rules.map((rule) => (
          <div
            key={rule}
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
            <span style={{ color: "#e6eefc" }}>{rule}</span>
            <span style={{ color: "var(--lo-muted)" }}>policy</span>
          </div>
        ))}
      </div>
    </GlassPanel>
  );
}
