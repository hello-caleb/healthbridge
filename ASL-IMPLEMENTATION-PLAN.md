# ASL Pipeline Implementation Plan

## Overview
Add ASL (American Sign Language) video recognition to HealthBridge using MediaPipe + Gemini Vision.

**Goal:** Patient signs → Camera → English text → Doctor reads

---

## Phase A: MediaPipe Hand Detection (2-3 hrs)
- [ ] Install `@mediapipe/tasks-vision`
- [ ] Create `useHandLandmarker` hook
- [ ] Add camera view with hand landmark overlay
- [ ] Visual feedback when hands detected

## Phase B: Sign Capture System (2 hrs)
- [ ] Buffer video frames when hands are present
- [ ] Detect "sign complete" (hands pause or leave frame)
- [ ] UI indicator: "Recording sign..."

## Phase C: Gemini Vision Recognition (2-3 hrs)
- [ ] Send captured frames to Gemini Vision API
- [ ] Prompt: "Analyze this ASL sign sequence and translate to English"
- [ ] Output to existing caption system

## Phase D: Integration & Testing (2-3 hrs)
- [ ] Connect to existing jargon detection pipeline
- [ ] Test with ASL dictionary videos (Signing Savvy, SignASL.org)
- [ ] Polish UI for ASL input mode

**Total Estimate: 8-11 hours**

---

## Architecture
```
Camera → MediaPipe (local) → Gemini Vision → English text → Jargon Detection
```

- MediaPipe runs locally (no API limits)
- Gemini Vision called only per completed sign
- Feeds into existing caption/jargon system

---

## Test Resources
| Source | What It Has | URL |
|--------|-------------|-----|
| Signing Savvy | ASL dictionary videos | signingsavvy.com |
| SignASL.org | 40,000+ videos, healthcare section | signasl.org |
| WLASL Dataset | 2,000 words | kaggle.com/datasets/risangbaskoro/wlasl-processed |
| How2Sign | 80+ hours continuous | how2sign.github.io |

---

## Rate Limit Strategy
| Component | API Calls | Notes |
|-----------|-----------|-------|
| MediaPipe | 0 (local) | Free, unlimited |
| Frame capture | 0 (local) | Free, unlimited |
| Gemini Vision | 1 per sign | Only when sign complete |

---

## Technical Details

### MediaPipe Setup
```bash
npm install @mediapipe/tasks-vision
```

### Key Hook Structure
```typescript
// src/hooks/use-hand-landmarker.ts
- Initialize HandLandmarker with WASM
- Process video frames
- Return hand landmarks + detection state
```

### Gemini Vision Prompt
```
Analyze this video sequence. A person is signing in American Sign Language.
What word or phrase are they signing? Respond with just the English translation.
```

---

## Status: ✅ Ready to implement
