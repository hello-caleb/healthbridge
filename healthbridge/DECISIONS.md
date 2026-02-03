# Architecture Decision Log

This document records the architectural decisions made for the HealthBridge project. We follow a lightweight [ADR (Architecture Decision Record)](https://adr.github.io/) format.

## Log

| ID | Date | Title | Status |
| -- | ---- | ----- | ------ |
| 1 | 2026-02-03 | [Migrate away from Gemini 3.0 Flash](#1-migrate-away-from-gemini-30-flash) | Accepted |

---

## 1. Migrate away from Gemini 3.0 Flash

**Date:** 2026-02-03

### Status
Accepted

### Context
We initially selected Gemini 3.0 Flash for our AI engine due to its speed and cost-effectiveness. However, as we integrated more complex interactions—specifically the real-time "Jargon Detection" and "Multi-party Diarization"—we encountered significant limitations:
*   **Reasoning Depth:** The "Flash" model struggled with subtle context switching between [Doctor] and [Patient] roles during complex medical dialogue.
*   **Instruction Following:** It frequently missed the strict output formatting required for our frontend to render 'Thought Signatures' correctly.

### Decision
We will change the underlying architecture to use a more capable model (Pending specific model selection, e.g., Gemini 3.0 Pro or similar high-reasoning variant) for the core intelligence layer.

### Consequences
*   **Positive:** Improved accuracy in speaker diarization and jargon translation. Better adherence to safety guardrails (`manifesto.md`).
*   **Negative:** Likely higher latency and cost per token compared to the Flash model. We may need to implement optimistic UI updates to mask the increased latency.
