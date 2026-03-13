interface PanelHeadProps {
  title: string;
  subtitle?: string;
}

export function PanelHead({ title, subtitle }: PanelHeadProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 14px 8px",
      }}
    >
      <b style={{ fontSize: 13, color: "#e9f2ff" }}>{title}</b>
      {subtitle && (
        <span style={{ fontSize: 11, color: "var(--lo-muted)" }}>
          {subtitle}
        </span>
      )}
    </div>
  );
}
