# AGENTS.md: HealthBridge Project Briefing

## 1. Project Mission
HealthBridge is a real-time healthcare communication assistant for Deaf/Hard-of-Hearing (DHH) patients. It is a **COMMUNICATION TOOL**, not a medical device. It must never provide medical advice or diagnoses.

## 2. Technical Stack
- **Framework:** Next.js 15 (App Router)
- **AI Engine:** Gemini 3 API (`@google/genai`)
- **Real-time Audio:** LiveKit (WebSocket)
- **Audio Specs:** 16-bit PCM, 16kHz, mono (Required for Gemini Live API)
- **ASL Recognition:** MediaPipe HandLandmarker + Gemini Vision

## 3. Core "Skills" & Rules
- **Diarization:** Separate speaker roles as `[Doctor]` and `[Patient]` using acoustic cues.
- **Jargon Detection:** Automatically simplify medical terms to a Grade 6-8 reading level.
- **Safety Guardrail:** Strictly adhere to the rules in `/lib/manifesto.md`.

## 4. Engineering Standards
- **Accessibility:** Use high-contrast light themes, 18px+ font sizes, and semantic HTML (`aria-live="polite"`).
- **Thought Signatures:** Always maintain state for `thought_signature` between turns to ensure context retention.
- **Test-Driven:** Before merging any code, verify the sampling rate of the AudioWorklet and the accuracy of the jargon decoder.

## 5. Progress Tracker
- [x] **Phase 1: Scaffolding**
  - Project initialized (Next.js 15, Tailwind, TS).
  - Dependencies installed (`@google/genai`, `livekit-client`).
  - `src/components/Dashboard.tsx` created (UI Layout).
  - `src/worklets/downsampler.ts` implemented (Audio Processing).
  - `lib/manifesto.md` established.

- [x] **Phase 2: Real-time Integration**
  - [x] Implement WebSocket client for Gemini 3 API (`use-gemini-client.ts`).
  - [x] Connect `Dashboard.tsx` to live audio stream.
  - [x] Integrate `downsampler.ts` with Microphone input.
  - [x] Verify audio packets are 16kHz PCM16.

- [x] **Phase 3: Intelligence & Video**
  - [x] Implement Jargon Detection (Gemini System Instructions).
  - [x] Build Diarization Logic (Doctor vs. Patient speaker lanes).
  - [x] Connect Video Feeds (LiveKit integration).

- [x] **Phase 4: Production Hardening**
  - [x] Error Boundaries & Reconnection Logic.
  - [x] Session Timeouts & Security Headers.
  - [x] Deployment Config (Vercel).

- [x] **Phase 5: ASL Recognition Pipeline**
  - [x] MediaPipe HandLandmarker integration (`use-hand-landmarker.ts`).
  - [x] Gemini Vision for ASL → English translation (`asl-translation-service.ts`).
  - [x] ASL Input component with hand landmark overlay (`ASLInput.tsx`).
  - [x] Input mode toggle (Audio/ASL) in CinematicVideoRoom.
  - [x] ASL translations displayed in Live Transcription view.

- [ ] **Phase 6: Post-Consultation** *(Stretch)*
  - Generate Visit Summaries (PDF/Text).
  - Export to EHR (FHIR standard placeholder).
  - Patient History & Session Logs.