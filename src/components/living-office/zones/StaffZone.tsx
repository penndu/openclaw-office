import { ZONE_CONFIGS, ZONE_LABEL_POSITIONS } from "../config";
import { ZoneLabel } from "./ZoneLabel";
import { ZonePanel } from "./ZonePanel";

export function StaffZone() {
  const cfg = ZONE_CONFIGS.staff;
  const lbl = ZONE_LABEL_POSITIONS.staff;

  return (
    <>
      <ZonePanel config={cfg} />
      <ZoneLabel label={cfg.label} left={lbl.left} top={lbl.top} />
    </>
  );
}
