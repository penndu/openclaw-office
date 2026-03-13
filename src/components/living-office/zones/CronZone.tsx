import { ZONE_CONFIGS, ZONE_LABEL_POSITIONS } from "../config";
import { BroadcastBeacon } from "../panels/BroadcastBeacon";
import { CronBoard } from "../panels/CronBoard";
import { ZoneLabel } from "./ZoneLabel";
import { ZonePanel } from "./ZonePanel";

export function CronZone() {
  const cfg = ZONE_CONFIGS.cron;
  const lbl = ZONE_LABEL_POSITIONS.cron;

  return (
    <>
      <ZonePanel config={cfg} />
      <ZoneLabel label={cfg.label} left={lbl.left} top={lbl.top} />
      <CronBoard />
      <BroadcastBeacon />
    </>
  );
}
