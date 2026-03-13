import { DESK_CONFIGS } from "./config";
import { OfficeStage } from "./scene/OfficeStage";
import { Desk } from "./workspace/Desk";
import { CronZone } from "./zones/CronZone";
import { GatewayZone } from "./zones/GatewayZone";
import { MemoryZone } from "./zones/MemoryZone";
import { OpsZone } from "./zones/OpsZone";
import { ProjectZone } from "./zones/ProjectZone";
import { StaffZone } from "./zones/StaffZone";

export function LivingOfficeView() {
  return (
    <div
      className="living-office"
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background:
          "radial-gradient(circle at 20% 0%, #16233f 0%, #0b1220 38%, #070b13 100%)",
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, "PingFang SC", "Microsoft YaHei", sans-serif',
        color: "var(--lo-text)",
      }}
    >
      {/* App background radials */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: [
            "radial-gradient(circle at 20% 10%, rgba(92,200,255,.14), transparent 20%)",
            "radial-gradient(circle at 80% 20%, rgba(143,125,255,.10), transparent 24%)",
            "linear-gradient(180deg, rgba(255,255,255,.02), transparent 22%)",
            "linear-gradient(180deg, #0c1425 0%, #09111d 100%)",
          ].join(", "),
          pointerEvents: "none",
        }}
      />

      <OfficeStage>
        {/* Zones */}
        <GatewayZone />
        <OpsZone />
        <CronZone />
        <StaffZone />
        <ProjectZone />
        <MemoryZone />

        {/* Desks */}
        {DESK_CONFIGS.map((desk) => (
          <Desk key={desk.id} config={desk} />
        ))}
      </OfficeStage>
    </div>
  );
}
