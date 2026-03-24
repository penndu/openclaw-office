## 1. Navigation And Page Shell

- [x] 1.1 Add a new Chat page route, page identity, and top-navigation entry that fit the current Office/Console navigation model.
- [x] 1.2 Create a dedicated Chat page shell that uses the existing layout system and can host a full chat workspace instead of the current dock-only experience.
- [x] 1.3 Add zh/en i18n entries for Chat navigation, page titles, and shared page-level actions/states.

## 2. Shared Chat Workspace State

- [x] 2.1 Refactor the existing dock-oriented chat store into a shared chat workspace state model that supports route-level usage.
- [x] 2.2 Expand chat state to cover active session selection, new-session workflow, target agent routing, draft state, queue state, and history loading/error state.
- [x] 2.3 Decide and implement how the legacy dock participates in the new shared state model, or explicitly retire it.

## 3. Gateway And Mock Contracts

- [x] 3.1 Audit upstream chat-visible data requirements against the current adapter contract and document the exact gaps.
- [x] 3.2 Extend gateway adapter types and implementations for the richer chat/session/runtime payloads needed by the new page.
- [x] 3.3 Update mock adapter behavior so session switching, streaming, aborts, tool activity, and any supported attachments can be exercised without a live Gateway.

## 4. Session Workflow Parity

- [x] 4.1 Implement session list loading and active session switching in the dedicated Chat page.
- [x] 4.2 Implement new-session creation and agent-targeted routing behavior for chat.
- [x] 4.3 Ensure transcript refresh and navigation return flows preserve the active chat workspace state.

## 5. Runtime Interaction Parity

- [x] 5.1 Implement transcript rendering for live assistant streaming and final message reconciliation.
- [x] 5.2 Implement runtime tool activity rendering in the transcript workflow.
- [x] 5.3 Implement abort handling, including correct partial-output behavior after abort.
- [x] 5.4 Implement attachment-aware sending if the Gateway contract supports it end-to-end.
- [x] 5.5 Implement supported slash-command UX and execution flows backed by available Office APIs.
- [x] 5.6 Implement transcript utilities such as search, export, and pinned-reference workflows in the Office UI style.

## 6. Verification And Review Readiness

- [x] 6.1 Add unit/component tests covering shared chat state, session workflows, and key runtime interactions.
- [x] 6.2 Add parity-oriented checks or review notes that map implemented behaviors back to the upstream OpenClaw chat references.
- [x] 6.3 Verify zh/en translation completeness and mock/live compatibility before requesting implementation review.
