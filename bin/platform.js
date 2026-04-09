/**
 * Platform detection utility for openclaw-office service management.
 */

const { platform } = await import("node:os");
const { exec } = await import("node:child_process");
const { promisify } = await import("node:util");
const execAsync = promisify(exec);

/** @returns {Promise<'macos' | 'linux' | 'windows' | 'unknown'>} */
export function detectPlatform() {
  const p = platform();
  if (p === "darwin") return "macos";
  if (p === "linux") return "linux";
  if (p === "win32") return "windows";
  return "unknown";
}

/**
 * Check if systemd --user is available (Linux).
 * @returns {Promise<boolean>}
 */
export async function hasSystemdUser() {
  try {
    await execAsync("systemctl --user is-system-running");
    return true;
  } catch {
    return false;
  }
}

/**
 * Get the path to the currently running node executable.
 * @returns {string}
 */
export function getNodePath() {
  return process.execPath;
}
