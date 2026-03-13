import { ZONE_CONFIGS, ZONE_LABEL_POSITIONS } from "../config";
import { ProjectRoom } from "../panels/ProjectRoom";
import { ZoneLabel } from "./ZoneLabel";
import { ZonePanel } from "./ZonePanel";

export function ProjectZone() {
  const cfg = ZONE_CONFIGS.project;
  const lbl = ZONE_LABEL_POSITIONS.project;

  return (
    <>
      <ZonePanel config={cfg} />
      <ZoneLabel label={cfg.label} left={lbl.left} top={lbl.top} />
      <ProjectRoom />
    </>
  );
}
