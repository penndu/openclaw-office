import { beforeEach, describe, expect, it } from "vitest";
import { __resetAdapterForTests, initAdapter } from "@/gateway/adapter-provider";
import { useChatDockStore } from "../console-stores/chat-dock-store";

function resetChatStore() {
  useChatDockStore.setState({
    messages: [],
    isStreaming: false,
    currentSessionKey: "agent:main:main",
    dockExpanded: false,
    targetAgentId: null,
    sessions: [],
    error: null,
    activeRunId: null,
    streamingMessage: null,
    isHistoryLoaded: false,
    isHistoryLoading: false,
    draft: "",
    attachments: [],
    queue: [],
    focusMode: false,
    searchQuery: "",
    pinnedMessageIds: [],
    thinkingLevel: null,
  });
}

describe("Chat workspace store", () => {
  beforeEach(async () => {
    __resetAdapterForTests();
    await initAdapter("mock");
    resetChatStore();
  });

  it("initializes history with thinking level and messages", async () => {
    await useChatDockStore.getState().initializeHistory();
    const state = useChatDockStore.getState();
    expect(state.messages.length).toBeGreaterThan(0);
    expect(state.thinkingLevel).toBe("medium");
    expect(state.isHistoryLoaded).toBe(true);
  });

  it("creates a new session and keeps it active", () => {
    useChatDockStore.getState().newSession("main");
    const state = useChatDockStore.getState();
    expect(state.currentSessionKey).toContain("agent:main:session-");
    expect(state.sessions[0]?.key).toBe(state.currentSessionKey);
  });

  it("queues outbound messages while streaming", async () => {
    useChatDockStore.setState({ isStreaming: true });
    await useChatDockStore.getState().sendMessage("queued while busy");
    const state = useChatDockStore.getState();
    expect(state.queue).toHaveLength(1);
    expect(state.queue[0]?.text).toBe("queued while busy");
  });

  it("handles local slash commands through shared state", async () => {
    await useChatDockStore.getState().sendMessage("/focus");
    const state = useChatDockStore.getState();
    expect(state.focusMode).toBe(true);
    expect(state.messages.at(-1)?.content).toContain("专注模式");
  });

  it("records tool activity from agent events", () => {
    useChatDockStore.getState().handleAgentEvent({
      runId: "run-1",
      seq: 1,
      stream: "tool",
      ts: Date.now(),
      sessionKey: "agent:main:main",
      data: { phase: "start", name: "mock_search", args: { query: "hello" } },
    });
    const state = useChatDockStore.getState();
    expect(state.messages.at(-1)?.kind).toBe("tool");
    expect(state.messages.at(-1)?.toolCalls?.[0]?.name).toBe("mock_search");
  });
});
