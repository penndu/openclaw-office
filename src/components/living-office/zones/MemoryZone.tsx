import { ZONE_CONFIGS, ZONE_LABEL_POSITIONS } from "../config";
import { MemoryWall } from "../panels/MemoryWall";
import { ZoneLabel } from "./ZoneLabel";
import { ZonePanel } from "./ZonePanel";

export function MemoryZone() {
  const cfg = ZONE_CONFIGS.memory;
  const lbl = ZONE_LABEL_POSITIONS.memory;

  return (
    <>
      <ZonePanel config={cfg} />
      <ZoneLabel label={cfg.label} left={lbl.left} top={lbl.top} />
      <MemoryWall />
    </>
  );
}
