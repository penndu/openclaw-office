import { memo } from "react";
import { useTranslation } from "react-i18next";
import type { ChatDockMessage } from "@/store/console-stores/chat-dock-store";
import { MarkdownContent } from "./MarkdownContent";
import { StreamingIndicator } from "./StreamingIndicator";

interface MessageBubbleProps {
  message: ChatDockMessage;
  isPinned?: boolean;
  onTogglePin?: (messageId: string) => void;
}

export const MessageBubble = memo(function MessageBubble({
  message,
  isPinned = false,
  onTogglePin,
}: MessageBubbleProps) {
  const { t } = useTranslation("chat");
  const isUser = message.role === "user";
  const isSystem = message.role === "system";
  const hasImages = (message.attachments ?? []).some((attachment) => attachment.dataUrl);

  if (isSystem) {
    return (
      <div className="mb-3 flex justify-center">
        <div className="max-w-[85%] rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
          <div className="flex items-start justify-between gap-3">
            <MarkdownContent content={message.content} />
            {onTogglePin && (
              <button
                type="button"
                onClick={() => onTogglePin(message.id)}
                className={`rounded px-1.5 py-0.5 text-[10px] ${
                  isPinned
                    ? "bg-amber-200 text-amber-900 dark:bg-amber-800 dark:text-amber-100"
                    : "text-amber-600 dark:text-amber-300"
                }`}
              >
                {isPinned ? t("message.pinned") : t("message.pin")}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      <div
        className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
          isUser
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            {isUser ? (
              <p className="whitespace-pre-wrap">{message.content}</p>
            ) : (
              <>
                <MarkdownContent content={message.content} />
                {message.isStreaming && <StreamingIndicator />}
              </>
            )}
            {message.toolCalls && message.toolCalls.length > 0 && (
              <div className="mt-2 space-y-1">
                {message.toolCalls.map((toolCall) => (
                  <div
                    key={toolCall.id}
                    className="rounded-xl border border-black/10 bg-black/5 px-2 py-1 text-xs dark:border-white/10 dark:bg-white/5"
                  >
                    <div className="font-medium">{toolCall.name}</div>
                    <div className="opacity-70">{t(`toolStatus.${toolCall.status}`, { defaultValue: toolCall.status })}</div>
                  </div>
                ))}
              </div>
            )}
            {hasImages && (
              <div className="mt-2 grid grid-cols-2 gap-2">
                {message.attachments?.map((attachment) =>
                  attachment.dataUrl ? (
                    <img
                      key={attachment.id}
                      src={attachment.dataUrl}
                      alt={attachment.name ?? attachment.mimeType}
                      className="h-24 w-full rounded-xl object-cover"
                    />
                  ) : null,
                )}
              </div>
            )}
          </div>
          {onTogglePin && (
            <button
              type="button"
              onClick={() => onTogglePin(message.id)}
              className={`rounded px-1.5 py-0.5 text-[10px] ${
                isPinned
                  ? "bg-white/20 text-white dark:bg-white/10"
                  : isUser
                    ? "text-blue-100"
                    : "text-gray-400 dark:text-gray-500"
              }`}
            >
              {isPinned ? t("message.pinned") : t("message.pin")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
});
