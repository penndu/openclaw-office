## ADDED Requirements

### Requirement: Dedicated chat page is available from the top navigation
The system SHALL expose a dedicated Chat page in the current top navigation so operators can access chat as a first-class workflow without relying on the office dock.

#### Scenario: Chat page is reachable from top navigation
- **WHEN** the operator is using OpenClaw Office and activates the top navigation entry labeled `Chat`
- **THEN** the application SHALL navigate to the dedicated chat route
- **AND** the active top navigation state SHALL reflect that Chat is selected

#### Scenario: Chat page uses the OpenClaw Office visual system
- **WHEN** the Chat page is rendered
- **THEN** it SHALL use this project's existing layout, typography, theming, and interaction patterns
- **AND** it SHALL NOT clone the upstream Control UI styling verbatim

#### Scenario: Chat page is localized
- **WHEN** the operator switches application language between supported locales
- **THEN** all user-visible Chat page labels, actions, empty states, and errors SHALL render through the project's i18n system

### Requirement: Chat page integrates with the application page model
The system SHALL treat Chat as a page-level feature within routing, page identity, and shared layout state.

#### Scenario: Current page tracking recognizes chat
- **WHEN** the operator navigates to the Chat route
- **THEN** the application SHALL record Chat as the current page identity
- **AND** page title and navigation affordances SHALL update consistently with other first-class pages

#### Scenario: Chat page coexists with office and console views
- **WHEN** the operator moves between Office, Chat, and other console pages
- **THEN** navigation SHALL remain consistent
- **AND** chat state SHALL not be lost solely because the operator changed pages unless an explicit reset action was taken
