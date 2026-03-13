import type { DeskConfig, DeskStatus } from "../types";
import { DeskBubble } from "./DeskBubble";
import { StatusRing } from "./StatusRing";

interface DeskProps {
  config: DeskConfig;
  status?: DeskStatus;
  bubble?: string;
}

export function Desk({ config, status = "idle", bubble = "" }: DeskProps) {
  const isHeartbeat = status === "heartbeat";

  return (
    <div
      data-desk-id={config.id}
      style={{
        position: "absolute",
        left: config.position.left,
        top: config.position.top,
        width: 160,
        height: 108,
        transform: "translateZ(12px)",
      }}
    >
      {/* Heartbeat pulse ring */}
      {isHeartbeat && (
        <div
          style={{
            position: "absolute",
            inset: -8,
            borderRadius: 24,
            border: "2px solid rgba(92,200,255,.16)",
            animation: "lo-pulse 1.6s ease-out infinite",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Surface */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, #172842, #0f1a2c)",
          borderRadius: 20,
          border: "1px solid rgba(255,255,255,.06)",
          boxShadow:
            "0 20px 40px rgba(0,0,0,.3), inset 0 1px 0 rgba(255,255,255,.06)",
        }}
      />

      {/* Monitor */}
      <div
        style={{
          position: "absolute",
          left: 46,
          top: 18,
          width: 68,
          height: 30,
          borderRadius: 8,
          background:
            "linear-gradient(180deg, rgba(92,200,255,.35), rgba(92,200,255,.08))",
          border: "1px solid rgba(92,200,255,.25)",
          boxShadow: "0 0 24px rgba(92,200,255,.14)",
        }}
      />

      <StatusRing status={status} />

      {/* Agent name */}
      <div
        style={{
          position: "absolute",
          left: 10,
          bottom: 10,
          fontSize: 11,
          color: "#e8f1ff",
          fontWeight: 700,
        }}
      >
        {config.agentName}
      </div>

      {/* Role meta */}
      <div
        style={{
          position: "absolute",
          right: 10,
          bottom: 10,
          fontSize: 10,
          color: "var(--lo-muted)",
        }}
      >
        {config.role}
      </div>

      <DeskBubble text={bubble} />
    </div>
  );
}
