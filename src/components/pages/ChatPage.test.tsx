import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { __resetAdapterForTests, initAdapter } from "@/gateway/adapter-provider";
import { useChatDockStore } from "@/store/console-stores/chat-dock-store";
import { ChatPage } from "./ChatPage";

vi.stubGlobal(
  "URL",
  Object.assign(globalThis.URL ?? {}, {
    createObjectURL: vi.fn(() => "blob:test"),
    revokeObjectURL: vi.fn(),
  }),
);

function resetChatStore() {
  const state = useChatDockStore.getState();
  useChatDockStore.setState({
    ...state,
    messages: [],
    isStreaming: false,
    currentSessionKey: "agent:main:main",
    dockExpanded: false,
    targetAgentId: "main",
    sessions: [],
    error: null,
    activeRunId: null,
    streamingMessage: null,
    isHistoryLoaded: true,
    isHistoryLoading: false,
    draft: "",
    attachments: [],
    queue: [],
    focusMode: false,
    searchQuery: "",
    pinnedMessageIds: [],
    thinkingLevel: null,
    loadSessions: async () => {},
    initializeHistory: async () => {},
  });
}

describe("ChatPage", () => {
  beforeEach(async () => {
    __resetAdapterForTests();
    await initAdapter("mock");
    resetChatStore();
  });

  it("filters transcript messages by search query", async () => {
    useChatDockStore.setState({
      messages: [
        { id: "1", role: "assistant", content: "alpha result", timestamp: 1 },
        { id: "2", role: "assistant", content: "beta result", timestamp: 2 },
      ],
    });

    await act(async () => {
      render(<ChatPage />);
    });
    fireEvent.change(screen.getByPlaceholderText("搜索当前会话转录..."), {
      target: { value: "beta" },
    });

    expect(screen.queryByText("alpha result")).not.toBeInTheDocument();
    expect(screen.getByText("beta result")).toBeInTheDocument();
  });

  it("shows slash command suggestions from the draft", async () => {
    await act(async () => {
      render(<ChatPage />);
    });
    fireEvent.change(screen.getByPlaceholderText("输入消息... (Enter 发送, Shift+Enter 换行)"), {
      target: { value: "/he" },
    });

    await waitFor(() => {
      expect(screen.getByText("/help")).toBeInTheDocument();
    });
  });

  it("pins a message into the pinned strip", async () => {
    useChatDockStore.setState({
      messages: [{ id: "1", role: "assistant", content: "pin me please", timestamp: 1 }],
    });

    await act(async () => {
      render(<ChatPage />);
    });
    fireEvent.click(screen.getAllByRole("button", { name: "置顶" })[0]!);

    await waitFor(() => {
      expect(screen.getAllByText("已置顶").length).toBeGreaterThan(0);
      expect(screen.getByRole("button", { name: /pin me please/i })).toBeInTheDocument();
    });
  });
});
