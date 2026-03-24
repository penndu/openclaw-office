## ADDED Requirements

### Requirement: Chat uses session-oriented workflows
The system SHALL provide session-oriented chat behavior equivalent to the upstream Control UI workflow instead of a single implicit transcript.

#### Scenario: Operator can switch sessions
- **WHEN** multiple chat sessions are available from the Gateway
- **THEN** the Chat page SHALL list them in the chat workflow
- **AND** selecting a session SHALL load that session's transcript and runtime state into the active view

#### Scenario: Operator can start a new session
- **WHEN** the operator triggers the new-session action from the Chat workflow
- **THEN** the system SHALL create and activate a new chat session context
- **AND** subsequent messages SHALL be sent to that new active session

#### Scenario: Session transcript loads from Gateway history
- **WHEN** the active session changes or the chat page loads an existing session
- **THEN** the system SHALL request transcript history from the Gateway for that session
- **AND** the transcript shown to the operator SHALL reflect the active session rather than a shared global message list

### Requirement: Chat session routing supports agent-targeted conversations
The system SHALL support routing chat to a selected target agent where the active session model requires agent affinity.

#### Scenario: Operator changes target agent
- **WHEN** the operator selects a different target agent for chat
- **THEN** the active session routing SHALL update to target that agent's session context
- **AND** transcript loading SHALL follow the selected target context

#### Scenario: Session-aware state survives normal navigation
- **WHEN** the operator leaves the Chat page and later returns during the same app session
- **THEN** the most recent active session context SHALL remain available
- **AND** the app SHALL avoid silently resetting the operator to an unrelated transcript

### Requirement: Chat session state is shared across chat entry points
The system SHALL maintain one canonical chat workspace state so route-level chat and any retained quick-entry affordance do not diverge.

#### Scenario: Shared chat state remains consistent
- **WHEN** the operator opens chat from any supported entry point in the application
- **THEN** message history, active session, sending state, and target agent state SHALL resolve from the same underlying chat workspace model
- **AND** the operator SHALL NOT observe conflicting chat states between entry points
