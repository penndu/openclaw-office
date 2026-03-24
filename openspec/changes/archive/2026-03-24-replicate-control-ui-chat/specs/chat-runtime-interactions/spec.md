## ADDED Requirements

### Requirement: Chat renders streaming assistant output and runtime completion states
The system SHALL render assistant responses as a live runtime conversation instead of only as final transcript snapshots.

#### Scenario: Streaming assistant output is visible
- **WHEN** the Gateway emits in-progress chat output for the active session
- **THEN** the Chat page SHALL show live assistant output in the active transcript
- **AND** the sending/streaming state SHALL remain visible until completion, abort, or error

#### Scenario: Abort updates the active run state
- **WHEN** the operator aborts an active chat run
- **THEN** the system SHALL call the Gateway abort flow for the active session or run
- **AND** the transcript/runtime state SHALL reflect that the run was aborted

#### Scenario: Partial output survives abort when available
- **WHEN** the Gateway retains partial assistant output for an aborted run
- **THEN** the Chat page SHALL preserve or reload that partial output in the transcript instead of discarding it silently

### Requirement: Chat surfaces runtime tool activity alongside transcript text
The system SHALL expose upstream-equivalent operator visibility into tool-related chat activity.

#### Scenario: Tool activity is visible during a run
- **WHEN** the active chat run emits tool-call or tool-result information relevant to the transcript
- **THEN** the Chat page SHALL surface that runtime activity in the conversation workflow
- **AND** operators SHALL be able to distinguish tool activity from normal assistant prose

### Requirement: Chat supports rich operator interactions beyond plain text sending
The system SHALL replicate the upstream chat workflow features that materially affect operator interaction.

#### Scenario: Attachments can be included in a chat send when supported
- **WHEN** the operator adds supported chat attachments and sends a message
- **THEN** the system SHALL include those attachments in the outgoing chat request
- **AND** the transcript UI SHALL reflect that the message included attachments

#### Scenario: Slash-command UX is available
- **WHEN** the operator types a supported slash command pattern in the chat composer
- **THEN** the Chat page SHALL provide command-oriented interaction affordances equivalent to the upstream workflow
- **AND** executing a supported command SHALL update the transcript or session state according to that command's behavior

#### Scenario: Transcript utilities are available
- **WHEN** the operator uses transcript utility actions such as search, export, or pinned-reference workflows
- **THEN** the Chat page SHALL provide those utilities within the project's own UI style
- **AND** each utility SHALL operate against the active session transcript

#### Scenario: Chat remains localized during runtime interactions
- **WHEN** the Chat page renders runtime states such as loading, sending, aborting, empty transcript, command feedback, or attachment-related feedback
- **THEN** those user-visible strings SHALL be localized through the app's translation system
