## Context

OpenClaw Office already has the lowest-level pieces of chat: a WebSocket-backed adapter, `chat.history` / `chat.send` / `chat.abort` RPCs, a `chat` event listener, IndexedDB transcript caching, and a dock-style React UI (`src/components/chat/*`, `src/store/console-stores/chat-dock-store.ts`). That implementation is intentionally lightweight and office-centric.

The upstream OpenClaw Control UI chat experience is broader. The primary reference points are:

- `../openclaw/ui/src/ui/views/chat.ts`
- `../openclaw/ui/src/ui/controllers/chat.ts`
- `../openclaw/ui/src/ui/app-chat.ts`
- `../openclaw/docs/web/control-ui.md`

Those files show that the upstream product treats chat as a full operator surface with:

- dedicated chat page layout
- session-centric state and navigation
- streaming assistant and tool rendering
- queueing and abort semantics
- slash commands and command-result injection
- attachment-aware sending
- transcript utilities such as search, export, and pinning

This project cannot copy that code directly because the stacks differ materially: upstream is Lit-based and shares state through an app host object, while OpenClaw Office uses React 19, Zustand, Tailwind, and a different visual design system. The design therefore needs behavioral parity, not code reuse or UI cloning.

## Goals / Non-Goals

**Goals:**

- Introduce a dedicated Chat page in the current top navigation, consistent with the project's existing console and office navigation patterns.
- Preserve this project's visual language and component structure while matching upstream user-visible chat capabilities as closely as the Gateway and current app architecture allow.
- Unify chat state so the page experience, agent targeting, and any retained dock entry point all operate on one source of truth.
- Make feature parity explicit enough that a later implementation/review pass can compare behavior against upstream capability-by-capability instead of relying on vague “looks similar” judgments.
- Ensure the resulting design is testable, localizable, and compatible with mock mode.

**Non-Goals:**

- Pixel-for-pixel reproduction of the upstream Control UI.
- Rewriting the app around the upstream Lit app host architecture.
- Expanding the scope into unrelated dashboard-v2 features that exist near upstream chat, such as command palette, mobile tab shells, or unrelated configuration panels.
- Server-side Gateway changes inside `../openclaw`; this change is a frontend replication effort inside OpenClaw Office.

## Decisions

### 1. Model the work as behavioral parity, not component porting

The implementation SHOULD treat upstream `chat.ts` / `app-chat.ts` / `controllers/chat.ts` as the behavioral reference and map those behaviors into React-native modules.

Why:

- Lit view code is tightly coupled to upstream app host state and cannot be transplanted cleanly.
- React/Zustand needs explicit state slices, selectors, and component boundaries.
- The user explicitly wants the current project's UI style preserved.

Alternatives considered:

- Directly port upstream view code into a compatibility layer: rejected because it would introduce brittle architecture and fight the existing React app.
- Keep current dock and add a few missing buttons: rejected because it would not reach parity with the upstream page-oriented workflow.

### 2. Promote chat to a dedicated route and page-level feature

Chat SHOULD become a first-class page, likely under a new `/chat` route that participates in `PageTracker`, `PageId`, `TopBar`, translations, and console layout behavior. The top menu SHOULD gain a `Chat` entry because the user explicitly requested it there.

Why:

- The existing dock forces chat into the office surface, but the upstream experience is a standalone operator workflow.
- Page routing is required for preserving chat-centric state, deep-linking, and future reviewability.
- The current `TopBar` and page-title model already support page-level experiences cleanly.

Alternatives considered:

- Put Chat only in the left console sidebar: rejected because the user asked for top-menu placement and because chat should be globally reachable.
- Keep it modal/dock-only: rejected because it undercuts parity and creates layout constraints for sessions, tools, and transcript utilities.

### 3. Replace the current dock store with a generalized chat workspace store

The current `chat-dock-store` SHOULD evolve into, or be superseded by, a generalized chat workspace store that owns:

- active session key
- available sessions and selection
- active target agent
- messages and tool stream state
- draft, queued sends, streaming state, abort state
- history loading status and errors
- attachments
- chat utilities state needed across the page lifecycle

Why:

- The current store assumes a single dock workflow with limited transcript state.
- Upstream parity requires more than `messages + streamingMessage + sessionKey`.
- A page-level feature needs reusable state that can also be shared by a minimized dock trigger if retained.

Alternatives considered:

- Create multiple disconnected stores for page, dock, and utilities: rejected because session/stream state divergence will create bugs.
- Keep the current store and bolt features onto components: rejected because the data model is already too shallow for upstream parity.

### 4. Split replicated capability into three implementation slices

The work SHOULD be decomposed into:

1. navigation and page shell
2. session/routing/state integration
3. runtime interaction features

Why:

- This mirrors the three OpenSpec capabilities and gives review clear checkpoints.
- The user asked for step-by-step work that can guide later review and implementation.
- It limits risk by creating stable integration points before richer chat utilities are added.

Alternatives considered:

- Build the whole chat page in one pass: rejected because it obscures dependency order and reviewability.

### 5. Prefer thin Gateway adapter expansion over UI-side protocol guessing

When upstream-visible chat features require data that the current adapter layer does not expose, this change SHOULD expand `adapter-types.ts`, `adapter.ts`, `ws-adapter.ts`, and mock adapter contracts rather than burying protocol assumptions inside components.

Why:

- Current adapter types flatten chat messages aggressively (`content: string`), which is insufficient for attachments, tool results, or richer message metadata.
- Review needs a stable contract between UI and Gateway events.
- Mock mode and tests become much easier when the adapter contract reflects real features.

Alternatives considered:

- Let components read raw payloads directly from WebSocket events: rejected because it bypasses the app’s integration boundary and makes tests brittle.

### 6. Keep parity bounded to user-visible upstream chat features

The implementation SHOULD explicitly catalogue which upstream chat features are in-scope, which are deferred, and which depend on missing support in OpenClaw Office or Gateway contracts.

Initial in-scope parity target:

- dedicated page
- session switch/new session
- transcript history refresh
- assistant streaming text
- tool-call/tool-result visibility
- abort flow and partial transcript retention handling
- attachments if the current Gateway contract can support them end-to-end
- slash-command entry UX and command-result rendering for commands backed by existing or newly added Office RPC support
- transcript export, search, and pinned-message utilities
- focus-mode equivalent if it can be expressed naturally in this project's layout

Potentially deferred if blocked by infrastructure or excessive scope:

- markdown side panel for oversized structured content
- speech-to-text
- full upstream command matrix if Office lacks matching session APIs

Why:

- “Complete replicate” needs an explicit parity ledger; otherwise the phrase is not actionable.
- Some upstream features are purely UI-side, others depend on session APIs not yet wrapped by this project.

## Risks / Trade-offs

- [Feature parity is broader than the current adapter contract] → Expand Gateway adapter types early and document unsupported upstream features explicitly before implementation starts.
- [Two chat surfaces can diverge] → Make the dedicated page the primary experience and keep any dock affordance as a thin consumer of shared state or retire it.
- [Upstream slash commands may depend on RPCs not yet wrapped here] → Separate command UX parity from command execution parity; implement only commands backed by Office APIs in the first pass and list deferred commands clearly.
- [Attachments may require richer payload modeling than current `string[]` support] → Validate the real Gateway payload shape during implementation and avoid committing to attachment parity without adapter coverage and tests.
- [Transcript-heavy rendering can hurt performance] → Design transcript grouping, virtualization boundaries, and refresh rules before implementation; do not reload entire history on every event unless required.
- [i18n completeness can lag feature work] → Treat zh/en key parity as part of the definition of done for each feature slice.

## Migration Plan

1. Add the new change artifacts and approve the parity scope before implementation.
2. Introduce `/chat` route, page identity, top-menu entry, and placeholder page shell behind the shared layout.
3. Refactor chat state from dock-specific to page-capable shared state without removing the existing working chat path on day one.
4. Expand adapter and mock contracts for richer transcript/session/runtime features.
5. Port runtime capabilities slice-by-slice, verifying parity against upstream references after each slice.
6. Decide whether to retire, minimize, or repurpose the old dock once the page reaches functional parity.
7. Run review against proposal/spec/design checklist before broader QA.

Rollback strategy:

- Because this is a frontend-only change, rollback is route/UI level: remove the top-menu chat entry and fall back to the existing dock implementation if the new page is unstable.

## Open Questions

- Which upstream slash commands are truly required for “complete replicate” in this repo, and which depend on session APIs not yet exposed in OpenClaw Office?
- Should the legacy dock remain as a quick launcher into `/chat`, or should it be removed after parity is achieved?
- Does the current Gateway endpoint used by OpenClaw Office already support attachment payloads in the same shape as upstream `chat.send`, or will adapter work reveal a backend compatibility gap?
- Should pinned/search/export state be persisted per session locally, or remain ephemeral in the first implementation?
