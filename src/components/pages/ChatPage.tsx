import { ArrowDown, Download, Eye, EyeOff, Loader2, Paperclip, Search, Send, Square, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import TextareaAutosize from "react-textarea-autosize";
import { AgentSelector } from "@/components/chat/AgentSelector";
import { MarkdownContent } from "@/components/chat/MarkdownContent";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { SessionSwitcher } from "@/components/chat/SessionSwitcher";
import { StreamingIndicator } from "@/components/chat/StreamingIndicator";
import { getSlashCommands } from "@/lib/chat-slash-commands";
import { useChatDockStore, type ChatDockMessage } from "@/store/console-stores/chat-dock-store";

function extractStreamingText(streamingMessage: Record<string, unknown> | null): string {
  if (!streamingMessage) return "";
  const content = streamingMessage.content;
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return (content as Array<{ type?: string; text?: string }>)
      .filter((block) => block.type === "text" && block.text)
      .map((block) => block.text!)
      .join("\n");
  }
  return "";
}

export function ChatPage() {
  const { t } = useTranslation(["chat", "common"]);
  const slashCommands = useMemo(() => getSlashCommands(), []);
  const messages = useChatDockStore((s) => s.messages);
  const isStreaming = useChatDockStore((s) => s.isStreaming);
  const streamingMessage = useChatDockStore((s) => s.streamingMessage);
  const isHistoryLoading = useChatDockStore((s) => s.isHistoryLoading);
  const error = useChatDockStore((s) => s.error);
  const clearError = useChatDockStore((s) => s.clearError);
  const loadSessions = useChatDockStore((s) => s.loadSessions);
  const initializeHistory = useChatDockStore((s) => s.initializeHistory);
  const sendMessage = useChatDockStore((s) => s.sendMessage);
  const abort = useChatDockStore((s) => s.abort);
  const currentSessionKey = useChatDockStore((s) => s.currentSessionKey);
  const draft = useChatDockStore((s) => s.draft);
  const setDraft = useChatDockStore((s) => s.setDraft);
  const attachments = useChatDockStore((s) => s.attachments);
  const addAttachment = useChatDockStore((s) => s.addAttachment);
  const removeAttachment = useChatDockStore((s) => s.removeAttachment);
  const clearAttachments = useChatDockStore((s) => s.clearAttachments);
  const focusMode = useChatDockStore((s) => s.focusMode);
  const setFocusMode = useChatDockStore((s) => s.setFocusMode);
  const searchQuery = useChatDockStore((s) => s.searchQuery);
  const setSearchQuery = useChatDockStore((s) => s.setSearchQuery);
  const pinnedMessageIds = useChatDockStore((s) => s.pinnedMessageIds);
  const togglePinMessage = useChatDockStore((s) => s.togglePinMessage);
  const exportCurrentSession = useChatDockStore((s) => s.exportCurrentSession);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isComposing, setIsComposing] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const messageRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const streamingText = extractStreamingText(streamingMessage);
  const canSend = (draft.trim().length > 0 || attachments.length > 0) && !isStreaming;

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  useEffect(() => {
    initializeHistory();
  }, [initializeHistory, currentSessionKey]);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingText, autoScroll]);

  const filteredMessages = useMemo<ChatDockMessage[]>(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return [...messages];
    }
    return messages.filter((message) => {
      if (message.content.toLowerCase().includes(query)) {
        return true;
      }
      return (message.toolCalls ?? []).some((toolCall) => toolCall.name.toLowerCase().includes(query));
    });
  }, [messages, searchQuery]);

  const pinnedMessages = useMemo(
    () => messages.filter((message) => pinnedMessageIds.includes(message.id)),
    [messages, pinnedMessageIds],
  );

  const slashMenuItems = useMemo(() => {
    const trimmed = draft.trimStart();
    if (!trimmed.startsWith("/")) {
      return [];
    }
    const withoutSlash = trimmed.slice(1);
    const [commandName = "", ...rest] = withoutSlash.split(/\s+/u);
    const active = slashCommands.find((command) => command.name === commandName);
    const argsFilter = rest.join(" ").trim().toLowerCase();
    if (active?.argOptions && rest.length > 0) {
      return active.argOptions
        .filter((option) => option.toLowerCase().startsWith(argsFilter))
        .map((option) => ({
          key: `${active.name}:${option}`,
          label: `/${active.name} ${option}`,
          description: active.description,
          value: `/${active.name} ${option}`,
        }));
    }
    return slashCommands.filter((command) => command.name.startsWith(commandName.toLowerCase())).map(
      (command) => ({
        key: command.name,
        label: `/${command.name}${command.args ? ` ${command.args}` : ""}`,
        description: command.description,
        value: `/${command.name}${command.args ? " " : ""}`,
      }),
    );
  }, [draft, slashCommands]);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    setAutoScroll(scrollHeight - scrollTop - clientHeight < 40);
  }, []);

  const scrollToBottom = useCallback(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    setAutoScroll(true);
  }, []);

  const handleSend = useCallback(() => {
    if ((!draft.trim() && attachments.length === 0) || isStreaming) return;
    void sendMessage(draft, attachments);
  }, [attachments, draft, isStreaming, sendMessage]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Enter" && !event.shiftKey && !isComposing) {
        event.preventDefault();
        handleSend();
      }
    },
    [handleSend, isComposing],
  );

  const handleAttachmentChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files ?? []);
      for (const file of files) {
        const dataUrl = await readFileAsDataUrl(file);
        addAttachment({
          id: `${file.name}-${file.lastModified}`,
          name: file.name,
          mimeType: file.type || "application/octet-stream",
          dataUrl,
        });
      }
      event.target.value = "";
    },
    [addAttachment],
  );

  const handleSelectSlashMenuItem = useCallback(
    (value: string) => {
      setDraft(value);
    },
    [setDraft],
  );

  const handleScrollToPinned = useCallback((messageId: string) => {
    messageRefs.current[messageId]?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  return (
    <div className={`flex h-[calc(100vh-3rem)] flex-col ${focusMode ? "mx-auto max-w-5xl" : ""}`}>
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-200 pb-4 dark:border-gray-800">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {t("layout:topbar.pageTitles.chat")}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t("page.description")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SessionSwitcher />
          <AgentSelector />
          <button
            type="button"
            onClick={() => exportCurrentSession()}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
            title={t("page.export")}
          >
            <Download className="h-4 w-4" />
            <span>{t("page.export")}</span>
          </button>
          <button
            type="button"
            onClick={() => setFocusMode(!focusMode)}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
            title={focusMode ? t("page.focusOff") : t("page.focusOn")}
          >
            {focusMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span>{focusMode ? t("page.focusOff") : t("page.focusOn")}</span>
          </button>
        </div>
      </div>

      {!focusMode && (
        <div className="mt-4 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={t("page.searchPlaceholder")}
              className="w-full rounded-2xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-700 outline-none transition-colors focus:border-blue-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            />
          </div>
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
              title={t("common:actions.close")}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      <div className="relative mt-6 flex min-h-0 flex-1 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex min-h-0 flex-1 flex-col">
          {pinnedMessages.length > 0 && !focusMode && (
            <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 px-4 py-3 dark:border-gray-800">
              <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
                {t("page.pinned")}
              </span>
              {pinnedMessages.map((message) => (
                <button
                  key={`pin-${message.id}`}
                  type="button"
                  onClick={() => handleScrollToPinned(message.id)}
                  className="rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  {message.content.slice(0, 48)}
                  {message.content.length > 48 ? "…" : ""}
                </button>
              ))}
            </div>
          )}

          {isHistoryLoading && (
            <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3 text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{t("chatDialog.loadingHistory")}</span>
            </div>
          )}

          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="relative min-h-0 flex-1 overflow-y-auto px-4 py-4"
          >
            {filteredMessages.length === 0 && !isStreaming && !isHistoryLoading ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-8 dark:border-gray-700 dark:bg-gray-950">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {t("page.emptyTitle")}
                  </p>
                  <p className="mt-2 max-w-md text-sm text-gray-500 dark:text-gray-400">
                    {t("page.emptyDescription")}
                  </p>
                </div>
              </div>
            ) : (
              <>
                {filteredMessages.map((message) => (
                  <div
                    key={message.id}
                    ref={(node) => {
                      messageRefs.current[message.id] = node;
                    }}
                  >
                    <MessageBubble
                      message={message}
                      isPinned={pinnedMessageIds.includes(message.id)}
                      onTogglePin={togglePinMessage}
                    />
                  </div>
                ))}
                {isStreaming && streamingText && (
                  <div className="mb-3 flex justify-start">
                    <div className="max-w-[80%] rounded-2xl bg-gray-100 px-4 py-3 text-sm text-gray-900 dark:bg-gray-800 dark:text-gray-100">
                      <MarkdownContent content={streamingText} />
                      <StreamingIndicator />
                    </div>
                  </div>
                )}
                {isStreaming && !streamingText && (
                  <div className="mb-3 flex justify-start">
                    <div className="flex items-center gap-2 rounded-2xl bg-gray-100 px-4 py-3 text-sm text-gray-500 dark:bg-gray-800 dark:text-gray-300">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{t("dock.thinkingStatus")}</span>
                    </div>
                  </div>
                )}
              </>
            )}

            {!autoScroll && (
              <button
                type="button"
                onClick={scrollToBottom}
                title={t("chatDialog.scrollToBottom")}
                className="sticky bottom-3 left-full ml-auto flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white shadow-md hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
              >
                <ArrowDown className="h-4 w-4 text-gray-500" />
              </button>
            )}
          </div>

          {error && (
            <div className="flex items-center justify-between border-t border-red-100 bg-red-50 px-4 py-2 text-sm text-red-600 dark:border-red-900/30 dark:bg-red-950/30 dark:text-red-400">
              <span className="truncate">{error}</span>
              <button type="button" onClick={clearError} className="ml-3 text-xs font-medium">
                {t("common:actions.dismiss")}
              </button>
            </div>
          )}

          <div className="border-t border-gray-200 bg-gray-50/80 px-4 py-4 dark:border-gray-800 dark:bg-gray-950/40">
            {attachments.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-3">
                {attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900"
                  >
                    {attachment.dataUrl ? (
                      <img
                        src={attachment.dataUrl}
                        alt={attachment.name ?? attachment.mimeType}
                        className="h-20 w-20 object-cover"
                      />
                    ) : (
                      <div className="flex h-20 w-20 items-center justify-center px-2 text-center text-xs text-gray-500">
                        {attachment.name ?? attachment.mimeType}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeAttachment(attachment.id ?? "")}
                      className="absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white"
                      title={t("page.removeAttachment")}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={clearAttachments}
                  className="inline-flex h-20 items-center rounded-2xl border border-dashed border-gray-300 px-4 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400"
                >
                  {t("page.clearAttachments")}
                </button>
              </div>
            )}
            <div className="flex items-end gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleAttachmentChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-500 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                title={t("page.addAttachment")}
              >
                <Paperclip className="h-4 w-4" />
              </button>
              <TextareaAutosize
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={handleKeyDown}
                onCompositionStart={() => setIsComposing(true)}
                onCompositionEnd={() => setIsComposing(false)}
                maxRows={8}
                placeholder={t("dock.placeholder")}
                className="min-h-[2.75rem] flex-1 resize-none rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition-colors placeholder:text-gray-400 focus:border-blue-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-blue-500"
              />
              {isStreaming ? (
                <button
                  type="button"
                  onClick={() => void abort()}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-red-500 px-4 text-sm font-medium text-white hover:bg-red-600"
                >
                  <Square className="h-4 w-4" />
                  <span>{t("common:actions.stop")}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!canSend}
                  className={`inline-flex h-11 items-center justify-center gap-2 rounded-2xl px-4 text-sm font-medium transition-colors ${
                    canSend
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-200 text-gray-400 dark:bg-gray-800 dark:text-gray-600"
                  }`}
                >
                  <Send className="h-4 w-4" />
                  <span>{t("common:actions.send")}</span>
                </button>
              )}
            </div>
            {slashMenuItems.length > 0 && (
              <div className="mt-3 rounded-2xl border border-gray-200 bg-white p-2 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                {slashMenuItems.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleSelectSlashMenuItem(item.value)}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      {item.label}
                    </span>
                    <span className="text-xs text-gray-400">{item.description}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
