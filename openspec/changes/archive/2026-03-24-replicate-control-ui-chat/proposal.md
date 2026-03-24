## Why

OpenClaw Office currently exposes chat as a bottom dock attached to the office view, while the upstream OpenClaw Control UI treats chat as a first-class workflow with session switching, runtime controls, and richer conversation tooling. This gap makes the frontend feel incomplete for operator workflows and prevents this project from offering the same day-to-day chat capability that already exists in the upstream product.

## What Changes

- Add a dedicated `Chat` console entry in the current top navigation and route it as a first-class page instead of a dock-only interaction.
- Recreate the upstream Control UI chat feature set on top of this project's React + Zustand + Tailwind architecture, while keeping this project's visual language, layout patterns, and interaction style.
- Expand the current chat state model from simple send/history/abort behavior into a session-oriented model that supports session switching, new session creation, agent targeting, streaming state, queued sends, and richer transcript state.
- Support upstream chat runtime behaviors that are visible to operators, including streaming assistant output, tool-call/tool-result rendering, abort handling, attachment-aware sending, slash-command driven controls, transcript export, search, and pinned-message style operator utilities where supported by Gateway APIs.
- Add all required i18n strings, tests, and mock-mode behavior so the replicated functionality behaves consistently in both Chinese and English.
- Keep the existing office dock experience only if it can be reduced to a thin entry point into the new chat model; avoid maintaining two divergent chat implementations.

## Capabilities

### New Capabilities

- `console-chat-page`: A dedicated chat page in the Office console that exposes upstream-equivalent chat workflows through this project's own UI system.
- `chat-session-workflows`: Session-oriented chat behavior, including session selection, new session creation, agent-targeted routing, transcript refresh, and route-aware page state.
- `chat-runtime-interactions`: Rich runtime chat interactions, including streaming text, tool output visibility, abort behavior, attachments, slash-command UX, transcript search/export, and pinned/reference utilities.

### Modified Capabilities

- None.

## Impact

- Affected frontend areas: routing, `TopBar`, console layouts/pages, chat components, Zustand console stores, gateway adapter types, mock adapter behavior, and local persistence.
- Affected Gateway integration: `chat.history`, `chat.send`, `chat.abort`, `sessions.list`, and likely additional RPC/event handling needed to match upstream-visible features such as richer session metadata, tool stream rendering, and command-driven session updates.
- Affected quality surface: unit tests for stores/adapters, component interaction tests, i18n locale files, and review criteria for parity against `../openclaw/ui/src/ui/views/chat.ts` and related controllers.
