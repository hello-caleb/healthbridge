# HealthBridge: Three-Way Reconciliation

> **Analysis Date:** February 4, 2026 (Updated: February 5, 2026)
> **Sources:** Claude Ideation | Perplexity Vision | Antigravity Implementation
> **Hackathon Deadline:** February 9, 2026 @ 5:00pm PST

---

## Executive Summary

You have **three different visions** that need reconciliation:

| Source | Core Approach | Audio/Video Input |
|--------|---------------|-------------------|
| **Claude Ideation** | AI Studio Build Tab, lightweight | Web Speech API (browser audio) |
| **Perplexity Vision** | ASL-first, SignGemma + MediaPipe | Video → ASL recognition → English |
| **Antigravity Build** | Full Next.js stack, Gemini WebSocket | Audio → Gemini transcription |

**Current State:**
- Antigravity built a **speech-to-text** system (audio input)
- Perplexity envisioned an **ASL recognition** system (video input)
- Claude planned a **browser-native** approach (simpler, faster to demo)

**✅ UPDATE (Feb 5): The ASL pipeline IS NOW IMPLEMENTED using MediaPipe HandLandmarker + Gemini Vision API.**

---

## Source 1: Claude Ideation (Original Plan)

### Key Documents
- `healthbridge-prd.md` — Product requirements
- `healthbridge-architecture.md` — Technical architecture
- `healthbridge-handoff.md` — Project context
- `healthbridge-ai-studio-prompt.md` — Build tab prompt

### Core Vision
- **Build Path:** AI Studio Build Tab → paste prompt → share link
- **Audio Input:** Web Speech API (browser native, zero-config)
- **Target User:** Deaf/HoH patients in doctor appointments
- **Primary Feature:** Real-time captions + medical term explanations
- **Design:** Living Glass (dark glassmorphism)
- **Demo Mode:** Pre-scripted cardiology transcript for judges

### Planned Features
| Feature | Priority | Status in Antigravity |
|---------|----------|----------------------|
| Live transcription | P0 | ✅ Built (different tech) |
| Term detection | P0 | ✅ Built |
| Term explanation | P0 | ✅ Built |
| Demo mode | P0 | ❌ Not built |
| Landing page | P0 | ❌ Not built |
| Local dictionary (30+ terms) | P0 | ❌ Not built |
| Living Glass design | P0 | ❌ Different (light theme) |
| Visual diagrams (Nano Banana) | P1 | ❌ Not built |
| Marathon Agent memory | P1 | ❌ Not built |
| Prep mode | P1 | ❌ Not built |
| Form explainer | P2 | ❌ Not built |

---

## Source 2: Perplexity Vision (ASL Pipeline)

### Core Vision
- **Primary Input:** ASL video (patient signs to camera)
- **Recognition Stack:** SignGemma + MediaPipe Hand Landmarker
- **Output:** English text for clinicians
- **Use Case:** "Symptom Intake Helper" — patient signs symptoms, system translates

### Key Technical Components (NOW BUILT ✅)
| Component | Purpose | Status |
|-----------|---------|--------|
| **Gemini Vision** | ASL → English translation | ✅ Implemented (replaced SignGemma) |
| **MediaPipe** | Hand/pose landmark extraction | ✅ Integrated (`use-hand-landmarker.ts`) |
| **Video → Landmarks** | Frame processing pipeline | ✅ Built (`ASLInput.tsx`) |
| **Landmarks → Text** | ASL sequence recognition | ✅ Built (`asl-translation-service.ts`) |

> **Note:** We used Gemini Vision API instead of SignGemma. This better showcases Gemini's multimodal capabilities for hackathon judging.

### Perplexity's Phase Plan
| Phase | Scope | Status |
|-------|-------|--------|
| Phase 1: Validate & Spec | User stories, architecture | ✅ Documented |
| Phase 2: Environment Setup | Repo, CI, credentials | ✅ Done by Antigravity |
| Phase 3: ASL Recognition | MediaPipe + Gemini Vision | ✅ **Complete (Feb 5)** |
| Phase 4: Gemini Reasoning | Symptom structuring | ⚠️ Partial (jargon detection) |
| Phase 5: Polish & Demo | Demo scenarios, submission | ⏳ Pending |

### Community Concerns Noted
Perplexity explicitly flagged:
> "Explicitly acknowledge Deaf community concerns about one‑way tools and show roadmap for two‑way communication."

This is important for the hackathon narrative — you need to address why the tool is helpful even without full ASL input.

---

## Source 3: Antigravity Implementation (What Got Built)

### Technical Stack
| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| UI | React 19, Tailwind CSS v4 |
| Audio Transcription | Gemini 2.5 Flash native-audio (WebSocket) |
| Jargon Detection | gemini-3-flash-preview (REST API) |
| Video | LiveKit (doctor-patient video rooms) |
| Diarization | Speaker tagging (Doctor/Patient) |

### What Antigravity Built (Phases 1-4)

| Phase | Components | Status |
|-------|------------|--------|
| **Phase 1: Scaffolding** | Next.js 15, Tailwind, AudioWorklet | ✅ Complete |
| **Phase 2: Real-time** | WebSocket client, audio streaming | ✅ Complete |
| **Phase 3: Intelligence** | Jargon detection, diarization, LiveKit video | ✅ Complete* |
| **Phase 4: Hardening** | Error boundaries, reconnection, Vercel config | ✅ Complete |
| **Phase 5: Post-Consult** | PDF summaries, EHR export | ❌ Not started |

*Phase 3 noted as "still debugging" per Caleb

### Architectural Decision Made
From `DECISIONS.md`:
> "Migrated to `gemini-2.5-flash-native-audio-preview-12-2025`... Gemini 3.0 Flash does not support the `BidiGenerateContent` WebSocket endpoint required for real-time bidirectional audio streaming."

---

## The Three-Way Comparison Matrix

| Aspect | Claude Plan | Perplexity Vision | **Current Build (Feb 5)** |
|--------|-------------|-------------------|---------------------------|
| **Primary Input** | Speech (mic) | ASL video (camera) | **Both!** Speech + ASL toggle |
| **Transcription Tech** | Web Speech API | SignGemma + MediaPipe | Gemini WebSocket + MediaPipe + Gemini Vision |
| **Target User** | DHH patients listening | Deaf patients signing | **Both user types** |
| **Server Required** | No | Yes | Yes |
| **Complexity** | Low | High | High |
| **Demo Readiness** | High (demo mode) | Low (needs ASL samples) | Medium (needs demo mode) |
| **Gemini Integration** | Explanations only | Reasoning + structuring | Audio + Vision + explanations |
| **Video** | None | Input (for ASL) | LiveKit + ASL input |
| **Design** | Living Glass (dark) | Not specified | Cinematic dark theme ✅ |

---

## Critical Questions to Resolve

### Question 1: What's the PRIMARY input modality?

| Option | Pros | Cons |
|--------|------|------|
| **Speech (current)** | Working now, simpler demo | Doesn't help patients who sign |
| **ASL Video (Perplexity)** | True DHH accessibility | SignGemma complex, needs ASL test data |
| **Both (stretch)** | Maximum accessibility | Scope creep, deadline risk |

**Reality check:** Adding SignGemma + MediaPipe ASL pipeline would be a **significant undertaking** this close to deadline. The current audio-based system is already functional.

### Question 2: Who is the primary user?

| Interpretation | Input | Output |
|----------------|-------|--------|
| **Claude/Antigravity:** DHH patient who reads | Doctor speaks | Patient reads captions |
| **Perplexity:** Deaf patient who signs | Patient signs | Clinician reads English |

These are **different user flows**:
- Claude/Antigravity: Helps DHH patients **understand** their doctor
- Perplexity: Helps Deaf patients **communicate** to their doctor

**Recommendation:** For hackathon, focus on the flow you have working (doctor → patient). Mention ASL input as the roadmap/future vision.

### Question 3: What must be added before submission?

| Feature | Source | Effort | Impact | Status |
|---------|--------|--------|--------|--------|
| **Demo mode** | Claude | ~2-3 hrs | 🔴 CRITICAL | ✅ **COMPLETE!** |
| **Landing page** | Claude | ~2 hrs | 🟡 HIGH | ✅ **COMPLETE!** |
| **Local dictionary** | Claude | ~1-2 hrs | 🟡 MEDIUM | ❌ Optional |
| **Design polish** | Claude | ~2-4 hrs | 🟡 MEDIUM | ✅ Dark theme done |
| **ASL pipeline** | Perplexity | ~8-16 hrs | 🟢 STRETCH | ✅ **COMPLETE!** |

---

## Recommended Path Forward

### Priority 1: Submission Readiness (Do These)
1. **Add demo mode** — Pre-scripted cardiology transcript that auto-plays
2. **Add landing page** — Explain what the app does, 2-3 mode cards
3. **Add local dictionary** — 30+ common medical terms with instant lookup

### Priority 2: Polish (If Time)
4. **Design toward Living Glass** — Darken theme, add glass effects
5. **Improve jargon panel** — Better visual hierarchy

### Priority 3: Narrative (For Submission)
6. **Frame the ASL roadmap** — In your demo video and Devpost:
   - Acknowledge the Perplexity vision (ASL input)
   - Show architecture diagram with "Phase 2: ASL Input" as future
   - Address Deaf community concerns explicitly
   - Position current build as "first step toward full two-way bridge"

### NOT Recommended for This Deadline
- ~~Implementing full SignGemma + MediaPipe ASL pipeline~~ ✅ **DONE!** (using Gemini Vision instead)
- Building two-way communication (speech → sign)
- EHR/FHIR integration
- Full Marathon Agent memory system

---

## Summary: What's Aligned, What Diverged, What's Missing

### ✅ ALIGNED (Consistent Across All Sources)
- Gemini-powered reasoning for medical context
- Real-time transcription of some kind
- Medical term detection and simplification
- Healthcare accessibility as core mission
- "Communication bridge, not medical device" positioning

### ⚠️ DIVERGED (Different Approaches)
| Aspect | Divergence |
|--------|------------|
| Input modality | Speech vs ASL video |
| Build environment | AI Studio vs Next.js |
| Design system | Living Glass vs light theme |
| Transcription engine | Browser API vs Gemini WebSocket |

### ❌ MISSING (From Original Plans) — Updated Feb 6
| Feature | From Which Source | Status |
|---------|-------------------|--------|
| Demo mode | Claude | ✅ **Complete** |
| Landing page | Claude | ✅ **Complete** |
| Local dictionary | Claude | ❌ Optional |
| Living Glass design | Claude | ✅ Cinematic dark theme |
| ASL recognition | Perplexity | ✅ **Complete** |
| SignGemma integration | Perplexity | ✅ Replaced with Gemini Vision |
| MediaPipe landmarks | Perplexity | ✅ **Complete** |
| Marathon Agent memory | Claude | ❌ Stretch goal |

---

## Next Steps — Updated Feb 6

### ✅ Completed Since Original Analysis
- **ASL Recognition Pipeline** — MediaPipe + Gemini Vision integration complete
- **Dark Theme** — CinematicVideoRoom with glassmorphism and Living Glass design
- **Demo Mode** — Pre-scripted cardiology transcript with dual input simulation (Audio + ASL)
- **Landing Page** — Hero section, feature cards, "Watch Demo" CTA

### 🟡 Nice to Have (3 days remaining)
1. Local medical dictionary (30+ terms)
2. Additional UI polish
3. Demo video recording for Devpost

### Narrative for Devpost
The app now supports **dual input modalities**:
- **Audio Input:** Doctor speaks → Gemini WebSocket transcribes → Patient reads captions
- **ASL Input:** Patient signs → MediaPipe detects → Gemini Vision translates → Doctor reads text

This makes HealthBridge a **true communication bridge** serving both directions!

---

*Generated for Caleb (Rivrr Studio) — February 4, 2026*
*Updated: February 5, 2026*
