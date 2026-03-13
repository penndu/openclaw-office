export function OfficeFloor() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: 34,
        background: [
          "linear-gradient(135deg, rgba(255,255,255,.055), rgba(255,255,255,.015))",
          "repeating-linear-gradient(0deg, rgba(255,255,255,.035), rgba(255,255,255,.035) 2px, transparent 2px, transparent 58px)",
          "repeating-linear-gradient(90deg, rgba(255,255,255,.03), rgba(255,255,255,.03) 2px, transparent 2px, transparent 58px)",
          "linear-gradient(180deg, #1a2944, #0d1525)",
        ].join(", "),
        boxShadow: [
          "inset 0 1px 0 rgba(255,255,255,.06)",
          "inset 0 -30px 80px rgba(0,0,0,.35)",
          "0 40px 120px rgba(0,0,0,.55)",
        ].join(", "),
        border: "1px solid rgba(255,255,255,.05)",
      }}
    />
  );
}
