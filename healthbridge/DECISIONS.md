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
We initially selected Gemini 3.0 Flash for our AI engine due to its speed and cost-effectiveness. However, when implementing real-time audio transcription for DHH accessibility, we discovered a critical **API feature gap**:

*   **Live Audio API Not Supported:** Gemini 3.0 Flash does not support the `BidiGenerateContent` WebSocket endpoint required for real-time bidirectional audio streaming. Our use case requires sending live PCM audio (16kHz, mono) and receiving transcriptions in real-time—a feature only available in models with native audio capabilities.

### Decision
We migrated to `gemini-2.5-flash-native-audio-preview-12-2025`, a model that supports:
*   Real-time bidirectional audio streaming via WebSocket (`v1beta` API)
*   `responseModalities: ["AUDIO"]` for audio-in/audio-out capabilities
*   Native PCM audio input at 16kHz

### Consequences
*   **Positive:** Enables the core Live Transcription feature required for DHH accessibility. Real-time audio streaming now works as designed.
*   **Negative:** Using a preview model introduces potential instability. We may need to migrate again when a stable native-audio model is released.
