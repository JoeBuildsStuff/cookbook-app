# Architecture Decision Records (ADRs)

This directory contains Architecture Decision Records for the DataTable component system. ADRs document the architectural decisions made in this project, including the context, decision, and consequences.

## What are ADRs?

Architecture Decision Records are a way to track important architectural decisions and their rationale. Each ADR is a numbered document that captures:

- **Status**: The current state of the decision (Proposed, Accepted, Deprecated, etc.)
- **Context**: The situation that led to this decision
- **Decision**: What was decided and why
- **Consequences**: The positive and negative outcomes of the decision

## ADR Format

Each ADR follows this structure:

```markdown
# [Number]. [Title]

## Status
[Proposed | Accepted | Deprecated | Superseded]

## Context
[The issue or situation motivating this decision]

## Decision
[What we decided to do and how we implemented it]

## Consequences
[Positive and negative outcomes, trade-offs]

## References
[Links to relevant code, documentation, or other ADRs]
```

## Current ADRs

- **[0001-state-synchronization-strategy.md](./0001-state-synchronization-strategy.md)**: How we synchronize table state across components (props vs context)
- **[0002-url-parameter-removal-strategy.md](./0002-url-parameter-removal-strategy.md)**: Strategy for removing URL parameters when state is cleared
- **[0003-server-refresh-strategy.md](./0003-server-refresh-strategy.md)**: How we trigger server component re-renders when URL params change
- **[0004-preventing-sync-loops.md](./0004-preventing-sync-loops.md)**: Preventing infinite loops in bidirectional state/URL synchronization

## When to Create an ADR

Create an ADR when you make a decision that:

- Affects multiple components or the overall architecture
- Has trade-offs or significant consequences
- Might be questioned or revisited in the future
- Involves choosing between multiple viable alternatives
- Represents a significant change from previous approach

Don't create an ADR for:
- Simple bug fixes
- Obvious implementation choices
- Temporary workarounds (use code comments instead)

## Resources

- [Documenting Architecture Decisions](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions) by Michael Nygard
- [ADR Template](https://github.com/joelparkerhenderson/architecture-decision-record)


