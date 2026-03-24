import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import type { ConnectionStatus, ThemeMode, PageId } from "@/gateway/types";
import { useOfficeStore } from "@/store/office-store";

const APP_VERSION = typeof __APP_VERSION__ === "string" ? __APP_VERSION__ : "dev";

function getStatusConfig(
  t: (key: string) => string,
): Record<ConnectionStatus, { color: string; pulse: boolean; label: string }> {
  return {
    connecting: { color: "#eab308", pulse: true, label: t("common:status.connecting") },
    connected: { color: "#22c55e", pulse: false, label: t("common:status.connected") },
    reconnecting: { color: "#f97316", pulse: true, label: t("common:status.reconnecting") },
    disconnected: { color: "#6b7280", pulse: false, label: t("common:status.disconnected") },
    error: { color: "#ef4444", pulse: false, label: t("common:status.error") },
  };
}

interface TopBarProps {
  isMobile?: boolean;
}

export function TopBar({ isMobile = false }: TopBarProps) {
  const { t } = useTranslation("layout");
  const connectionStatus = useOfficeStore((s) => s.connectionStatus);
  const connectionError = useOfficeStore((s) => s.connectionError);
  const metrics = useOfficeStore((s) => s.globalMetrics);
  const theme = useOfficeStore((s) => s.theme);
  const setTheme = useOfficeStore((s) => s.setTheme);
  const currentPage = useOfficeStore((s) => s.currentPage);

  const statusCfg = getStatusConfig(t)[connectionStatus];
  const isOfficePage = currentPage === "office";

  return (
    <header className="grid h-12 shrink-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4 border-b border-gray-200 bg-white px-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <div className="min-w-0">
        {isOfficePage ? (
          <OfficeTopBarContent metrics={metrics} isMobile={isMobile} />
        ) : (
          <ConsoleTopBarContent currentPage={currentPage} />
        )}
      </div>
      <TopNav currentPage={currentPage} />
      <div className="ml-auto flex items-center gap-3 justify-self-end">
        <ThemeToggle theme={theme} setTheme={setTheme} />
        <LanguageSwitcher />
        <ConnectionIndicator
          statusCfg={statusCfg}
          connectionError={connectionError}
          connectionStatus={connectionStatus}
        />
      </div>
    </header>
  );
}

function OfficeTopBarContent({
  metrics,
  isMobile,
}: {
  metrics: { activeAgents: number; totalAgents: number; totalTokens: number };
  isMobile?: boolean;
}) {
  const { t } = useTranslation("layout");

  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <h1 className="truncate text-lg font-semibold tracking-tight text-gray-800 dark:text-gray-100">
          OpenClaw Office
        </h1>
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400">
          v{APP_VERSION}
        </span>
      </div>
      {!isMobile && (
        <div className="ml-3 hidden items-center gap-6 text-sm text-gray-500 dark:text-gray-400 xl:flex">
          <span>
            {t("topbar.activeCountText")}{" "}
            <strong className="text-gray-800 dark:text-gray-200">
              {metrics.activeAgents}/{metrics.totalAgents}
            </strong>
          </span>
          <span>
            {t("topbar.tokensLabel")}{" "}
            <strong className="text-gray-800 dark:text-gray-200">
              {formatTokens(metrics.totalTokens)}
            </strong>
          </span>
        </div>
      )}
    </div>
  );
}

function ConsoleTopBarContent({ currentPage }: { currentPage: PageId }) {
  const { t } = useTranslation("layout");

  return (
    <div className="flex items-center gap-3">
      <h1 className="truncate text-lg font-semibold text-gray-800 dark:text-gray-100">
        {t(`topbar.pageTitles.${currentPage}`, { defaultValue: t("topbar.pageTitles.fallback") })}
      </h1>
    </div>
  );
}

function TopNav({ currentPage }: { currentPage: PageId }) {
  const { t } = useTranslation("layout");
  const navigate = useNavigate();
  const isOfficePage = currentPage === "office";
  const isChatPage = currentPage === "chat";
  const isConsolePage = !isOfficePage && !isChatPage;

  return (
    <nav
      aria-label={t("topbar.navigation")}
      className="flex items-center rounded-lg border border-gray-200 bg-gray-50 p-1 dark:border-gray-700 dark:bg-gray-800"
    >
      <button
        onClick={() => navigate("/")}
        className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
          isOfficePage
            ? "bg-white text-gray-900 shadow-sm dark:bg-gray-900 dark:text-gray-100"
            : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
        }`}
      >
        {t("topbar.office")}
      </button>
      <button
        onClick={() => navigate("/chat")}
        className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
          isChatPage
            ? "bg-white text-gray-900 shadow-sm dark:bg-gray-900 dark:text-gray-100"
            : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
        }`}
      >
        {t("topbar.chat")}
      </button>
      <button
        onClick={() => navigate("/dashboard")}
        className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
          isConsolePage
            ? "bg-white text-gray-900 shadow-sm dark:bg-gray-900 dark:text-gray-100"
            : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
        }`}
      >
        {t("topbar.console")}
      </button>
    </nav>
  );
}

function ConnectionIndicator({
  statusCfg,
  connectionError,
  connectionStatus,
}: {
  statusCfg: { color: string; pulse: boolean; label: string };
  connectionError: string | null;
  connectionStatus: ConnectionStatus;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="h-2.5 w-2.5 rounded-full"
        style={{
          backgroundColor: statusCfg.color,
          animation: statusCfg.pulse ? "pulse 1.5s ease-in-out infinite" : "none",
        }}
      />
      <span className="text-sm text-gray-500 dark:text-gray-400">
        {connectionError && connectionStatus === "error" ? connectionError : statusCfg.label}
      </span>
    </div>
  );
}

function ThemeToggle({ theme, setTheme }: { theme: ThemeMode; setTheme: (t: ThemeMode) => void }) {
  const { t } = useTranslation("layout");

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      title={theme === "light" ? t("topbar.theme.switchToDark") : t("topbar.theme.switchToLight")}
      className="ml-2 flex h-7 w-7 items-center justify-center rounded-md text-base transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
    >
      {theme === "light" ? "🌙" : "☀️"}
    </button>
  );
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) {
    return `${(n / 1_000_000).toFixed(1)}M`;
  }
  if (n >= 1_000) {
    return `${(n / 1_000).toFixed(1)}k`;
  }
  return String(n);
}
