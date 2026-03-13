import type { DeskConfig, ZoneConfig } from "./types";

export const ZONE_CONFIGS: Record<string, ZoneConfig> = {
  gateway: {
    id: "gateway-zone",
    label: "Gateway Hall",
    position: { left: 58, top: 74 },
    size: { width: 360, height: 220 },
  },
  ops: {
    id: "ops-zone",
    label: "Operations Board",
    position: { left: 450, top: 70 },
    size: { width: 450, height: 220 },
  },
  cron: {
    id: "cron-zone",
    label: "Cron Broadcast",
    position: { left: 940, top: 80 },
    size: { width: 320, height: 180 },
  },
  staff: {
    id: "staff-zone",
    label: "Staff Floor",
    position: { left: 86, top: 350 },
    size: { width: 820, height: 360 },
  },
  project: {
    id: "project-zone",
    label: "Project Room",
    position: { left: 950, top: 330 },
    size: { width: 300, height: 210 },
  },
  memory: {
    id: "memory-zone",
    label: "Memory Wall",
    position: { left: 960, top: 570 },
    size: { width: 270, height: 110 },
  },
};

export const ZONE_LABEL_POSITIONS: Record<string, { left: number; top: number }> = {
  gateway: { left: 72, top: 54 },
  ops: { left: 468, top: 50 },
  cron: { left: 968, top: 58 },
  staff: { left: 104, top: 328 },
  project: { left: 973, top: 307 },
  memory: { left: 985, top: 548 },
};

export const DESK_CONFIGS: DeskConfig[] = [
  {
    id: "desk-gm",
    agentName: "General Manager",
    role: "orchestrator",
    position: { left: 170, top: 430 },
  },
  {
    id: "desk-sales",
    agentName: "Sales Agent",
    role: "discovery",
    position: { left: 390, top: 430 },
  },
  {
    id: "desk-ops",
    agentName: "Ops Agent",
    role: "execution",
    position: { left: 610, top: 430 },
  },
  {
    id: "desk-fin",
    agentName: "Finance Agent",
    role: "payment",
    position: { left: 280, top: 590 },
  },
  {
    id: "desk-it",
    agentName: "IT Agent",
    role: "tooling",
    position: { left: 520, top: 590 },
  },
];
