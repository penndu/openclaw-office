import { ZONE_CONFIGS, ZONE_LABEL_POSITIONS } from "../config";
import { OpsBoard } from "../panels/OpsBoard";
import { ZoneLabel } from "./ZoneLabel";
import { ZonePanel } from "./ZonePanel";

export function OpsZone() {
  const cfg = ZONE_CONFIGS.ops;
  const lbl = ZONE_LABEL_POSITIONS.ops;

  return (
    <>
      <ZonePanel config={cfg} />
      <ZoneLabel label={cfg.label} left={lbl.left} top={lbl.top} />
      <OpsBoard />
    </>
  );
}
