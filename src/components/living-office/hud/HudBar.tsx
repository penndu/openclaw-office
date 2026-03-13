import type { ReactNode } from "react";

interface HudBarProps {
  left?: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
}

export function HudBar({ left, center, right }: HudBarProps) {
  return (
    <div
      className="lo-hud-bar"
      style={{
        position: "absolute",
        top: 10,
        left: 14,
        right: 14,
        zIndex: 20,
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: 10,
        pointerEvents: "none",
        alignItems: "start",
      }}
    >
      {left && <div style={{ pointerEvents: "auto" }}>{left}</div>}
      {center && <div style={{ pointerEvents: "auto" }}>{center}</div>}
      {right && <div style={{ pointerEvents: "auto" }}>{right}</div>}
    </div>
  );
}
