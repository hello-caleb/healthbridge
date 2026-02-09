# HealthBridge Execution Plan: Phases A, B, C

> **Project:** HealthBridge - Two-Way Healthcare Communication Bridge
> **Handoff To:** Antigravity (AI Coding Agent)
> **Created:** February 6, 2026
> **Deadline:** MVP by February 28, 2026
> **Owner:** Caleb (Rivrr Studio)

---

# TABLE OF CONTENTS

1. [Executive Summary](#executive-summary)
2. [Current State](#current-state)
3. [Target State](#target-state)
4. [Phase A: Validate ASL Recognition](#phase-a-validate-asl-recognition)
5. [Phase B: Doctor Experience](#phase-b-doctor-experience)
6. [Phase C: Text-to-ASL Avatar](#phase-c-text-to-asl-avatar)
7. [Master Task Table](#master-task-table)
8. [Technical Specifications](#technical-specifications)
9. [Code Review Checkpoints](#code-review-checkpoints)
10. [File Inventory](#file-inventory)

---

# EXECUTIVE SUMMARY

## The Problem
We have a **demo** that simulates two-way communication. We need a **working application** that actually:
1. Interprets real ASL → converts to text → shows to doctor
2. Doctor speaks → transcribed to text → converted to ASL avatar → shown to patient

## The Solution (3 Phases)

| Phase | Goal | Duration | Priority |
|-------|------|----------|----------|
| **A** | Validate ASL recognition actually works | 1-2 weeks | 🔴 Critical |
| **B** | Make doctor experience production-ready | 1 week | 🔴 Critical |
| **C** | Build text-to-ASL avatar system | 3-4 weeks | 🟡 High |

## Success Metrics
- **Phase A:** >70% accuracy on 20 common ASL medical phrases
- **Phase B:** Doctor can see patient input with confidence scores, request repeats
- **Phase C:** Patient sees signing avatar within 2 seconds of doctor speaking

---

# CURRENT STATE

## What's Built and Working ✅

| Component | File | Status | Notes |
|-----------|------|--------|-------|
| Audio → Text (Doctor speech) | `use-gemini-client.ts` | ✅ Working | Gemini 2.5 Flash WebSocket |
| Speaker Diarization | `use-speaker-diarization.ts` | ✅ Working | Doctor/Patient labels |
| Medical Jargon Detection | Gemini system instructions | ✅ Working | Auto-explains terms |
| Hand Detection | `use-hand-landmarker.ts` | ✅ Working | MediaPipe tracks hands |
| ASL UI Component | `ASLInput.tsx` | ✅ Working | Shows hand overlay |
| Demo Mode | `use-demo-mode.ts` | ✅ Working | Simulates conversation |
| Landing Page | `LandingPage.tsx` | ✅ Working | Marketing page |
| Video Rooms | `DoctorVideoRoom.tsx` | ✅ Working | LiveKit integration |

## What's Built but UNTESTED ⚠️

| Component | File | Status | Notes |
|-----------|------|--------|-------|
| ASL → Text Translation | `asl-translation-service.ts` | ⚠️ Untested | Gemini Vision API - never validated with real ASL |
| Sign Capture State Machine | `use-hand-landmarker.ts` | ⚠️ Basic | Needs better start/end detection |

## What's NOT Built ❌

| Component | Status | Notes |
|-----------|--------|-------|
| Text → ASL Translation | ❌ Not started | Need English → ASL gloss conversion |
| ASL Avatar System | ❌ Not started | Need 3D avatar or video synthesis |
| Confidence Scoring | ❌ Not started | Need to show translation reliability |
| "Ask to Repeat" Flow | ❌ Not started | When translation is uncertain |
| Doctor-optimized View | ❌ Not started | Larger text, alerts, actions |

---

# TARGET STATE

## Communication Flow Diagram

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                           HEALTHBRIDGE COMMUNICATION FLOW                         │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                   │
│  ╔══════════════════╗                              ╔══════════════════╗          │
│  ║  PATIENT (Deaf)  ║                              ║ DOCTOR (Hearing) ║          │
│  ╚══════════════════╝                              ╚══════════════════╝          │
│         │                                                   │                     │
│         │ Signs ASL                                         │ Speaks              │
│         ▼                                                   ▼                     │
│  ┌──────────────┐                                   ┌──────────────┐             │
│  │   Camera     │                                   │  Microphone  │             │
│  │   (WebRTC)   │                                   │  (WebRTC)    │             │
│  └──────┬───────┘                                   └──────┬───────┘             │
│         │                                                   │                     │
│         ▼                                                   ▼                     │
│  ┌──────────────┐                                   ┌──────────────┐             │
│  │  MediaPipe   │                                   │   Gemini     │             │
│  │ HandLandmark │                                   │  WebSocket   │             │
│  └──────┬───────┘                                   └──────┬───────┘             │
│         │ Hand coordinates                                  │ Audio stream        │
│         ▼                                                   ▼                     │
│  ┌──────────────┐                                   ┌──────────────┐             │
│  │ Frame Buffer │                                   │   Gemini     │             │
│  │ Sign Capture │                                   │  2.5 Flash   │             │
│  └──────┬───────┘                                   └──────┬───────┘             │
│         │ Sign complete                                     │ Text                │
│         ▼                                                   ▼                     │
│  ┌──────────────┐                                   ┌──────────────┐             │
│  │   Gemini     │                                   │  Text-to-ASL │             │
│  │   Vision     │                                   │  Translator  │             │
│  └──────┬───────┘                                   └──────┬───────┘             │
│         │ English text + confidence                        │ ASL gloss sequence  │
│         ▼                                                   ▼                     │
│  ┌──────────────┐                                   ┌──────────────┐             │
│  │   Doctor's   │◀──────────────────────────────────│  ASL Avatar  │             │
│  │   Screen     │                                   │   Renderer   │             │
│  └──────────────┘                                   └──────┬───────┘             │
│                                                             │ Animation/video    │
│                                                             ▼                     │
│                                                     ┌──────────────┐             │
│                                                     │  Patient's   │             │
│                                                     │   Screen     │             │
│                                                     └──────────────┘             │
│                                                                                   │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

# PHASE A: VALIDATE ASL RECOGNITION

> **Goal:** Prove that our ASL → Text pipeline actually works with real sign language
> **Duration:** 1-2 weeks
> **Exit Criteria:** >70% accuracy on 20 common medical ASL phrases

---

## A.1 Research & Discovery Tasks

### A.1.1 Research ASL video datasets for testing
| Field | Value |
|-------|-------|
| **Task Name** | Research ASL video datasets for testing (WLASL, How2Sign, ASL-LEX) |
| **Phase** | Research & Discovery |
| **Estimated Time** | 3 hours |
| **Priority** | 🔴 High |
| **Dependencies** | None |
| **Assigned To** | Antigravity |
| **Status** | To Do |

**Description:**
Find and document available ASL video datasets that can be used to test our recognition system.

**Acceptance Criteria:**
- [ ] List 3+ ASL datasets with download links
- [ ] Document which signs/words each dataset contains
- [ ] Identify 20 medical-relevant signs available in datasets
- [ ] Note licensing restrictions for each dataset

**Technical Details:**
```
Datasets to investigate:
1. WLASL (Word-Level ASL) - https://dxli94.github.io/WLASL/
   - 2000+ signs, largest public dataset

2. How2Sign - https://how2sign.github.io/
   - Continuous signing with English translations

3. ASL-LEX - https://asl-lex.org/
   - Lexical database with video examples

4. SignBank ASL - https://www.signbank.org/signpuddle/
   - Community contributed signs

Medical signs to prioritize:
- Pain, hurt, sick, help, doctor, nurse, medicine
- Heart, chest, head, stomach, dizzy, nausea
- Yes, no, more, less, when, where, how
- Emergency, allergic, breathe, swallow
```

**Output:** Create `/docs/ASL-DATASETS.md` with findings

---

### A.1.2 Research Gemini Vision API capabilities for ASL
| Field | Value |
|-------|-------|
| **Task Name** | Research Gemini Vision API capabilities and limitations for sign language |
| **Phase** | Research & Discovery |
| **Estimated Time** | 2 hours |
| **Priority** | 🔴 High |
| **Dependencies** | None |
| **Assigned To** | Antigravity |
| **Status** | To Do |

**Description:**
Document exactly what Gemini Vision can and cannot do with video/image analysis for ASL.

**Acceptance Criteria:**
- [ ] Document API rate limits and pricing
- [ ] Test maximum frames per request
- [ ] Document response time benchmarks
- [ ] Identify if Gemini has any ASL-specific training
- [ ] Compare 1.5 Pro vs 2.0 Flash for vision tasks

**Technical Details:**
```typescript
// Test these API configurations:
const models = [
  'gemini-1.5-pro',      // Best quality, slower
  'gemini-2.0-flash',    // Faster, may be less accurate
];

// Test frame counts:
const frameCounts = [3, 5, 8, 10, 15];

// Measure:
// - Response time per frame count
// - Accuracy correlation with frame count
// - Cost per request
```

**Output:** Create `/docs/GEMINI-VISION-ANALYSIS.md` with benchmarks

---

### A.1.3 Research alternative ASL recognition models
| Field | Value |
|-------|-------|
| **Task Name** | Research alternative ASL recognition models (SignGemma, OpenHands, custom) |
| **Phase** | Research & Discovery |
| **Estimated Time** | 4 hours |
| **Priority** | 🟡 Medium |
| **Dependencies** | A.1.2 |
| **Assigned To** | Antigravity |
| **Status** | To Do |

**Description:**
If Gemini Vision doesn't work well enough, we need backup options.

**Acceptance Criteria:**
- [ ] Evaluate SignGemma availability and accuracy
- [ ] Research OpenHands model
- [ ] Investigate Google's sign language research
- [ ] Document pros/cons of each approach
- [ ] Estimate integration effort for each

**Technical Details:**
```
Models to investigate:

1. SignGemma (Google)
   - Specialized for sign language
   - May not be publicly available yet
   - Check: https://ai.google/discover/signgemma/

2. OpenHands
   - Open source sign recognition
   - GitHub: search for latest repos

3. MediaPipe Gesture Recognition
   - Built-in gesture classifier
   - Could train custom ASL model

4. Custom approach
   - MediaPipe landmarks → custom ML model
   - Would need training data and time
```

**Output:** Create `/docs/ASL-MODEL-OPTIONS.md` with comparison matrix

---

## A.2 Testing & Validation Tasks

### A.2.1 Create ASL test video collection
| Field | Value |
|-------|-------|
| **Task Name** | Create ASL test video collection with 20 medical phrases |
| **Phase** | Testing & QA |
| **Estimated Time** | 4 hours |
| **Priority** | 🔴 High |
| **Dependencies** | A.1.1 |
| **Assigned To** | Antigravity |
| **Status** | To Do |

**Description:**
Gather or record 20 ASL video clips of common medical phrases for testing.

**Acceptance Criteria:**
- [ ] 20 video clips of distinct signs/phrases
- [ ] Each clip is 2-5 seconds long
- [ ] Mix of fingerspelling and signs
- [ ] Videos saved in `/test-data/asl-videos/`
- [ ] Ground truth labels in JSON file

**Technical Details:**
```
Folder structure:
/test-data/
  /asl-videos/
    /pain/
      pain_01.mp4
      pain_02.mp4
    /help/
      help_01.mp4
    /chest/
      chest_01.mp4
    ...
  ground-truth.json

ground-truth.json format:
{
  "videos": [
    {
      "filename": "pain/pain_01.mp4",
      "expected_text": "pain",
      "sign_type": "single_sign",
      "source": "WLASL"
    },
    {
      "filename": "chest_hurts/chest_hurts_01.mp4",
      "expected_text": "chest hurts",
      "sign_type": "phrase",
      "source": "recorded"
    }
  ]
}

Priority signs to collect:
1. pain
2. help
3. sick
4. doctor
5. medicine
6. heart
7. chest
8. head
9. stomach
10. dizzy
11. yes
12. no
13. more
14. emergency
15. allergic
16. breathe
17. nausea
18. tired
19. when
20. where
```

**Output:** `/test-data/asl-videos/` folder with 20+ clips and `ground-truth.json`

---

### A.2.2 Build ASL recognition accuracy test script
| Field | Value |
|-------|-------|
| **Task Name** | Build automated ASL recognition accuracy test script |
| **Phase** | Testing & QA |
| **Estimated Time** | 4 hours |
| **Priority** | 🔴 High |
| **Dependencies** | A.2.1 |
| **Assigned To** | Antigravity |
| **Status** | To Do |

**Description:**
Create a script that runs all test videos through our ASL pipeline and measures accuracy.

**Acceptance Criteria:**
- [ ] Script processes all videos in test folder
- [ ] Compares output to ground truth
- [ ] Calculates accuracy percentage
- [ ] Generates detailed report
- [ ] Logs failures with timestamps

**Technical Details:**
```typescript
// File: /scripts/test-asl-accuracy.ts

import { translateASLFrames } from '@/lib/asl-translation-service';
import * as fs from 'fs';
import * as path from 'path';

interface TestCase {
  filename: string;
  expected_text: string;
  sign_type: string;
  source: string;
}

interface TestResult {
  filename: string;
  expected: string;
  actual: string;
  confidence: string;
  match: boolean;
  response_time_ms: number;
}

async function runAccuracyTest() {
  const groundTruth = JSON.parse(
    fs.readFileSync('./test-data/ground-truth.json', 'utf-8')
  );

  const results: TestResult[] = [];

  for (const testCase of groundTruth.videos) {
    const videoPath = `./test-data/asl-videos/${testCase.filename}`;

    // Extract frames from video
    const frames = await extractFrames(videoPath, 5);

    // Run through our translation service
    const startTime = Date.now();
    const result = await translateASLFrames(frames);
    const responseTime = Date.now() - startTime;

    // Compare to expected
    const match = normalizeText(result.translation)
      .includes(normalizeText(testCase.expected_text));

    results.push({
      filename: testCase.filename,
      expected: testCase.expected_text,
      actual: result.translation,
      confidence: result.confidence,
      match,
      response_time_ms: responseTime,
    });

    console.log(`${match ? '✅' : '❌'} ${testCase.filename}: "${result.translation}" (expected: "${testCase.expected_text}")`);
  }

  // Calculate metrics
  const accuracy = results.filter(r => r.match).length / results.length * 100;
  const avgResponseTime = results.reduce((a, b) => a + b.response_time_ms, 0) / results.length;

  console.log('\n=== ACCURACY REPORT ===');
  console.log(`Total tests: ${results.length}`);
  console.log(`Passed: ${results.filter(r => r.match).length}`);
  console.log(`Failed: ${results.filter(r => !r.match).length}`);
  console.log(`Accuracy: ${accuracy.toFixed(1)}%`);
  console.log(`Avg response time: ${avgResponseTime.toFixed(0)}ms`);

  // Save detailed report
  fs.writeFileSync(
    './test-data/accuracy-report.json',
    JSON.stringify({ results, accuracy, avgResponseTime }, null, 2)
  );
}

function normalizeText(text: string): string {
  return text.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '');
}

async function extractFrames(videoPath: string, count: number): Promise<HandFrame[]> {
  // Implementation: use ffmpeg or browser canvas
  // Extract evenly-spaced frames from video
}

runAccuracyTest();
```

**Output:** `/scripts/test-asl-accuracy.ts` and test execution capability

---

### A.2.3 Run baseline accuracy test with current implementation
| Field | Value |
|-------|-------|
| **Task Name** | Run baseline accuracy test and document results |
| **Phase** | Testing & QA |
| **Estimated Time** | 2 hours |
| **Priority** | 🔴 High |
| **Dependencies** | A.2.2 |
| **Assigned To** | Antigravity |
| **Status** | To Do |

**Description:**
Run the accuracy test with our current Gemini Vision implementation to establish baseline.

**Acceptance Criteria:**
- [ ] Run test script against all 20 test videos
- [ ] Document accuracy percentage
- [ ] Identify which signs work vs fail
- [ ] Note any patterns in failures
- [ ] Decision: Continue with Gemini Vision or pivot?

**Technical Details:**
```
Expected output format:

=== BASELINE ACCURACY REPORT ===
Date: 2026-02-XX
Model: gemini-2.0-flash
Frame count: 5

Results by category:
- Single signs: XX% (X/10)
- Phrases: XX% (X/5)
- Fingerspelling: XX% (X/5)

Top failures:
1. "chest" → interpreted as "touch" (3/3 attempts)
2. "dizzy" → interpreted as "circle" (2/3 attempts)

Recommendations:
- If accuracy >70%: Proceed with optimization
- If accuracy 50-70%: Try more frames, better prompts
- If accuracy <50%: Pivot to alternative model
```

**Output:** `/test-data/baseline-accuracy-report.md`

---

### A.2.4 Test with increased frame counts
| Field | Value |
|-------|-------|
| **Task Name** | Test ASL recognition accuracy with increased frame counts (5, 8, 10, 15) |
| **Phase** | Testing & QA |
| **Estimated Time** | 3 hours |
| **Priority** | 🟡 Medium |
| **Dependencies** | A.2.3 |
| **Assigned To** | Antigravity |
| **Status** | To Do |

**Description:**
Test if sending more frames to Gemini Vision improves accuracy.

**Acceptance Criteria:**
- [ ] Run tests with 5, 8, 10, 15 frames
- [ ] Document accuracy at each level
- [ ] Document response time at each level
- [ ] Find optimal frames/accuracy tradeoff
- [ ] Update `asl-translation-service.ts` with optimal count

**Technical Details:**
```typescript
// Modify asl-translation-service.ts to accept frame count parameter

export async function translateASLFrames(
  frames: HandFrame[],
  options: {
    maxFrames?: number;  // Default: 5, test with 8, 10, 15
    model?: string;      // Default: gemini-2.0-flash
  } = {}
): Promise<ASLTranslationResult> {
  const { maxFrames = 5, model = 'gemini-2.0-flash' } = options;
  // ...
}
```

**Output:** Accuracy comparison table and updated service with optimal settings

---

### A.2.5 Test and optimize ASL prompt engineering
| Field | Value |
|-------|-------|
| **Task Name** | Test and optimize Gemini Vision prompt for ASL recognition |
| **Phase** | Testing & QA |
| **Estimated Time** | 4 hours |
| **Priority** | 🟡 Medium |
| **Dependencies** | A.2.3 |
| **Assigned To** | Antigravity |
| **Status** | To Do |

**Description:**
The prompt we send to Gemini Vision significantly affects accuracy. Test different prompts.

**Acceptance Criteria:**
- [ ] Test 5+ different prompt variations
- [ ] Document accuracy for each prompt
- [ ] Identify best-performing prompt
- [ ] Update `asl-translation-service.ts` with optimal prompt

**Technical Details:**
```typescript
// Current prompt in asl-translation-service.ts:
const currentPrompt = `
  Analyze these video frames showing American Sign Language (ASL).
  Identify the sign or phrase being communicated.
  Respond with JSON: { "translation": "...", "confidence": "high|medium|low" }
`;

// Test variations:
const prompts = [
  // Version A: More context
  `You are an expert ASL interpreter. These frames show a person signing in American Sign Language in a medical context. The person may be communicating symptoms, questions, or responses to a doctor. Identify what is being signed. Focus on hand shapes, movements, and positions. Respond with: { "translation": "the English meaning", "confidence": "high|medium|low", "reasoning": "brief explanation" }`,

  // Version B: Step-by-step
  `Analyze these ASL signing frames step by step:
   1. Identify the hand shape(s) in each frame
   2. Note the movement between frames
   3. Consider the location relative to the body
   4. Determine the most likely ASL sign or phrase
   Respond with: { "translation": "...", "confidence": "..." }`,

  // Version C: Medical vocabulary hint
  `These frames show ASL signing in a healthcare setting. Common signs include: pain, help, sick, doctor, medicine, heart, chest, head, dizzy, nausea, yes, no, emergency. What sign is being shown? Respond with: { "translation": "...", "confidence": "..." }`,

  // Version D: Minimal
  `What ASL sign is shown? JSON only: { "translation": "...", "confidence": "high|medium|low" }`,

  // Version E: Expert persona
  `As a certified ASL interpreter with medical terminology expertise, interpret this sign language. The signer is a patient communicating with healthcare staff. Provide your interpretation: { "translation": "...", "confidence": "...", "alternative_meanings": [...] }`,
];

// Test each prompt against the same video set
// Record accuracy for each
```

**Output:** `/docs/PROMPT-OPTIMIZATION.md` with results and updated service

---

## A.3 Build Tasks (Improving ASL Capture)

### A.3.1 Improve sign boundary detection in hand landmarker
| Field | Value |
|-------|-------|
| **Task Name** | Improve sign start/end detection in use-hand-landmarker.ts |
| **Phase** | Build |
| **Estimated Time** | 6 hours |
| **Priority** | 🔴 High |
| **Dependencies** | A.2.3 |
| **Assigned To** | Antigravity |
| **Status** | To Do |

**Description:**
Current implementation uses simple timing. Need smarter detection of when a sign starts and ends.

**Acceptance Criteria:**
- [ ] Detect sign start: hands enter frame with movement
- [ ] Detect sign end: hands pause or exit frame
- [ ] Handle continuous signing (multiple signs)
- [ ] Reduce false positives (random hand movements)
- [ ] Add movement velocity tracking

**Technical Details:**
```typescript
// File: src/hooks/use-hand-landmarker.ts

// Current simple state machine:
// - hands detected → start capture
// - hands still for X ms → end capture

// Improved state machine:
interface SignCaptureState {
  phase: 'idle' | 'preparing' | 'signing' | 'completing';

  // Movement tracking
  previousLandmarks: NormalizedLandmark[] | null;
  movementVelocity: number;
  velocityHistory: number[];  // Last N frames

  // Timing
  prepareStartTime: number | null;
  signStartTime: number | null;
  stillStartTime: number | null;

  // Frames
  capturedFrames: HandFrame[];
}

// State transitions:
// idle → preparing: Hands detected, any movement
// preparing → signing: Significant movement detected (velocity > threshold)
// preparing → idle: No significant movement for 500ms (was just resting hands)
// signing → completing: Movement velocity drops below threshold
// completing → idle: Still for 600ms, emit sign complete
// completing → signing: Movement resumes (sign wasn't done)

function calculateMovementVelocity(
  current: NormalizedLandmark[],
  previous: NormalizedLandmark[]
): number {
  // Calculate average displacement of all landmarks
  let totalDisplacement = 0;

  for (let i = 0; i < current.length; i++) {
    const dx = current[i].x - previous[i].x;
    const dy = current[i].y - previous[i].y;
    const dz = current[i].z - previous[i].z;
    totalDisplacement += Math.sqrt(dx*dx + dy*dy + dz*dz);
  }

  return totalDisplacement / current.length;
}

// Thresholds to tune:
const MOVEMENT_THRESHOLD = 0.02;      // Minimum velocity to consider "signing"
const PREPARE_TIMEOUT = 500;          // Ms before idle if no movement
const STILL_THRESHOLD = 0.005;        // Velocity below this = "still"
const COMPLETE_DELAY = 600;           // Ms of stillness to complete sign
const MIN_SIGN_DURATION = 300;        // Minimum sign length
const MAX_SIGN_DURATION = 5000;       // Maximum sign length
```

**Output:** Updated `use-hand-landmarker.ts` with improved state machine

---

### A.3.2 Add hand landmark smoothing and noise reduction
| Field | Value |
|-------|-------|
| **Task Name** | Add landmark smoothing to reduce jitter in hand tracking |
| **Phase** | Build |
| **Estimated Time** | 3 hours |
| **Priority** | 🟡 Medium |
| **Dependencies** | A.3.1 |
| **Assigned To** | Antigravity |
| **Status** | To Do |

**Description:**
MediaPipe landmarks can be jittery. Smooth them for better sign detection.

**Acceptance Criteria:**
- [ ] Implement exponential moving average smoothing
- [ ] Configurable smoothing factor
- [ ] Maintain responsiveness for fast movements
- [ ] Reduce false sign detections from jitter

**Technical Details:**
```typescript
// Add to use-hand-landmarker.ts

class LandmarkSmoother {
  private smoothedLandmarks: NormalizedLandmark[] | null = null;
  private smoothingFactor: number;

  constructor(smoothingFactor = 0.5) {
    // 0 = no smoothing, 1 = maximum smoothing
    this.smoothingFactor = smoothingFactor;
  }

  smooth(rawLandmarks: NormalizedLandmark[]): NormalizedLandmark[] {
    if (!this.smoothedLandmarks) {
      this.smoothedLandmarks = rawLandmarks;
      return rawLandmarks;
    }

    const result: NormalizedLandmark[] = [];

    for (let i = 0; i < rawLandmarks.length; i++) {
      result.push({
        x: this.ema(this.smoothedLandmarks[i].x, rawLandmarks[i].x),
        y: this.ema(this.smoothedLandmarks[i].y, rawLandmarks[i].y),
        z: this.ema(this.smoothedLandmarks[i].z, rawLandmarks[i].z),
      });
    }

    this.smoothedLandmarks = result;
    return result;
  }

  private ema(previous: number, current: number): number {
    return previous * this.smoothingFactor + current * (1 - this.smoothingFactor);
  }

  reset() {
    this.smoothedLandmarks = null;
  }
}
```

**Output:** Updated `use-hand-landmarker.ts` with smoothing

---

### A.3.3 Implement adaptive frame selection for API calls
| Field | Value |
|-------|-------|
| **Task Name** | Implement smart frame selection for Gemini Vision API calls |
| **Phase** | Build |
| **Estimated Time** | 4 hours |
| **Priority** | 🟡 Medium |
| **Dependencies** | A.3.1 |
| **Assigned To** | Antigravity |
| **Status** | To Do |

**Description:**
Don't just send evenly-spaced frames. Select frames that show key moments of the sign.

**Acceptance Criteria:**
- [ ] Detect key frames based on movement changes
- [ ] Include start, peak movement, and end frames
- [ ] Remove near-duplicate frames
- [ ] Optimize for API cost while maintaining accuracy

**Technical Details:**
```typescript
// File: src/lib/asl-translation-service.ts

interface FrameWithMetadata {
  frame: HandFrame;
  timestamp: number;
  movementScore: number;  // How much movement from previous frame
  isKeyFrame: boolean;
}

function selectKeyFrames(
  frames: FrameWithMetadata[],
  maxFrames: number = 5
): HandFrame[] {
  if (frames.length <= maxFrames) {
    return frames.map(f => f.frame);
  }

  // Always include first and last
  const selected: FrameWithMetadata[] = [
    frames[0],
    frames[frames.length - 1],
  ];

  // Find frames with highest movement (direction changes)
  const movementFrames = frames
    .slice(1, -1)
    .sort((a, b) => b.movementScore - a.movementScore);

  // Add top movement frames until we hit maxFrames
  for (const frame of movementFrames) {
    if (selected.length >= maxFrames) break;

    // Check it's not too close to already selected frames
    const tooClose = selected.some(
      s => Math.abs(s.timestamp - frame.timestamp) < 100 // 100ms minimum gap
    );

    if (!tooClose) {
      selected.push(frame);
    }
  }

  // Sort by timestamp
  selected.sort((a, b) => a.timestamp - b.timestamp);

  return selected.map(f => f.frame);
}
```

**Output:** Updated `asl-translation-service.ts` with smart frame selection

---

### A.3.4 Add confidence scoring to ASL translations
| Field | Value |
|-------|-------|
| **Task Name** | Implement detailed confidence scoring for ASL translations |
| **Phase** | Build |
| **Estimated Time** | 3 hours |
| **Priority** | 🔴 High |
| **Dependencies** | A.2.5 |
| **Assigned To** | Antigravity |
| **Status** | To Do |

**Description:**
Current confidence is just "high/medium/low" from Gemini. Need more nuanced scoring.

**Acceptance Criteria:**
- [ ] Score from 0-100 instead of categories
- [ ] Factor in: Gemini confidence, hand visibility, sign duration
- [ ] Provide alternative interpretations for low confidence
- [ ] UI shows confidence clearly to doctor

**Technical Details:**
```typescript
// File: src/lib/asl-translation-service.ts

interface DetailedConfidence {
  overall: number;           // 0-100
  category: 'high' | 'medium' | 'low' | 'very_low';
  factors: {
    modelConfidence: number; // From Gemini response
    handVisibility: number;  // % of frames with clear hands
    signDuration: number;    // Appropriate length?
    movementClarity: number; // Clear start/end?
  };
  alternatives: string[];    // Other possible interpretations
}

interface ASLTranslationResult {
  translation: string;
  confidence: DetailedConfidence;
  timestamp: string;
  processingTimeMs: number;
}

function calculateConfidence(
  geminiResponse: { translation: string; confidence: string; alternatives?: string[] },
  captureMetadata: {
    frameCount: number;
    handsVisibleCount: number;
    signDurationMs: number;
    movementVelocityAvg: number;
  }
): DetailedConfidence {
  // Model confidence: map Gemini's response
  const modelConfidence =
    geminiResponse.confidence === 'high' ? 90 :
    geminiResponse.confidence === 'medium' ? 60 :
    30;

  // Hand visibility: what % of frames had clear hand detection
  const handVisibility = (captureMetadata.handsVisibleCount / captureMetadata.frameCount) * 100;

  // Sign duration: penalize too short or too long
  const idealDuration = 1500; // 1.5 seconds
  const durationScore = Math.max(0, 100 - Math.abs(captureMetadata.signDurationMs - idealDuration) / 20);

  // Movement clarity: was there clear movement?
  const movementClarity = Math.min(100, captureMetadata.movementVelocityAvg * 5000);

  // Weighted average
  const overall = Math.round(
    modelConfidence * 0.5 +
    handVisibility * 0.2 +
    durationScore * 0.15 +
    movementClarity * 0.15
  );

  return {
    overall,
    category:
      overall >= 80 ? 'high' :
      overall >= 60 ? 'medium' :
      overall >= 40 ? 'low' :
      'very_low',
    factors: {
      modelConfidence,
      handVisibility,
      signDuration: durationScore,
      movementClarity,
    },
    alternatives: geminiResponse.alternatives || [],
  };
}
```

**Output:** Updated translation service with detailed confidence, updated TypeScript types

---

### A.3.5 Build visual feedback for sign capture quality
| Field | Value |
|-------|-------|
| **Task Name** | Build visual feedback component showing sign capture quality |
| **Phase** | Build |
| **Estimated Time** | 4 hours |
| **Priority** | 🟡 Medium |
| **Dependencies** | A.3.4 |
| **Assigned To** | Antigravity |
| **Status** | To Do |

**Description:**
Patient needs feedback that their sign is being captured properly.

**Acceptance Criteria:**
- [ ] Show hand tracking status (detected/not detected)
- [ ] Show sign capture progress (preparing/signing/processing)
- [ ] Visual indicator of capture quality
- [ ] "Sign again" prompt for low quality captures

**Technical Details:**
```tsx
// File: src/components/ASLCaptureStatus.tsx

interface ASLCaptureStatusProps {
  state: 'idle' | 'preparing' | 'signing' | 'processing' | 'complete';
  handsDetected: boolean;
  captureQuality: number;  // 0-100
  lastTranslation?: ASLTranslationResult;
}

export function ASLCaptureStatus({
  state,
  handsDetected,
  captureQuality,
  lastTranslation,
}: ASLCaptureStatusProps) {
  return (
    <div className="absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur rounded-lg p-3">
      {/* Hand detection indicator */}
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-3 h-3 rounded-full ${
          handsDetected ? 'bg-green-500' : 'bg-red-500'
        }`} />
        <span className="text-sm text-white/80">
          {handsDetected ? 'Hands detected' : 'Show your hands'}
        </span>
      </div>

      {/* State indicator */}
      {state === 'preparing' && (
        <div className="text-yellow-400 text-sm">
          Ready to capture...
        </div>
      )}

      {state === 'signing' && (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-red-400 text-sm font-medium">Recording sign</span>
          {/* Quality bar */}
          <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all"
              style={{ width: `${captureQuality}%` }}
            />
          </div>
        </div>
      )}

      {state === 'processing' && (
        <div className="flex items-center gap-2">
          <div className="animate-spin w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full" />
          <span className="text-purple-400 text-sm">Translating...</span>
        </div>
      )}

      {state === 'complete' && lastTranslation && (
        <div>
          <div className="flex items-center justify-between">
            <span className="text-white font-medium">
              "{lastTranslation.translation}"
            </span>
            <span className={`text-xs px-2 py-0.5 rounded ${
              lastTranslation.confidence.category === 'high'
                ? 'bg-green-500/20 text-green-400'
                : lastTranslation.confidence.category === 'medium'
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'bg-red-500/20 text-red-400'
            }`}>
              {lastTranslation.confidence.overall}% confident
            </span>
          </div>

          {lastTranslation.confidence.category === 'low' && (
            <button className="mt-2 text-sm text-purple-400 underline">
              Sign again for better accuracy?
            </button>
          )}
        </div>
      )}
    </div>
  );
}
```

**Output:** New `ASLCaptureStatus.tsx` component, integrated into `ASLInput.tsx`

---

## A.5 Unit Testing Tasks

### A.5.1 Write unit tests for hand landmarker hook
| Field | Value |
|-------|-------|
| **Task Name** | Write unit tests for use-hand-landmarker.ts (state machine, timing) |
| **Phase** | Testing & QA |
| **Estimated Time** | 4 hours |
| **Priority** | 🔴 High |
| **Dependencies** | A.3.1 |
| **Assigned To** | Antigravity |
| **Status** | To Do |

**Description:**
Test the sign capture state machine without needing real ASL knowledge.

**Acceptance Criteria:**
- [ ] Test state transitions: idle → preparing → signing → completing → idle
- [ ] Test timeout handling
- [ ] Test velocity threshold detection
- [ ] Test frame capture buffering
- [ ] Mock MediaPipe landmarks

**Technical Details:**
```typescript
// File: src/hooks/__tests__/use-hand-landmarker.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useHandLandmarker } from '../use-hand-landmarker';

// Mock MediaPipe
vi.mock('@mediapipe/tasks-vision', () => ({
  HandLandmarker: {
    createFromOptions: vi.fn().mockResolvedValue({
      detectForVideo: vi.fn().mockReturnValue({
        landmarks: [mockLandmarks],
        handednesses: [{ label: 'Right' }],
      }),
    }),
  },
  FilesetResolver: {
    forVisionTasks: vi.fn().mockResolvedValue({}),
  },
}));

describe('useHandLandmarker', () => {
  describe('state machine transitions', () => {
    it('should start in idle state', () => {
      const { result } = renderHook(() => useHandLandmarker());
      expect(result.current.captureState).toBe('idle');
    });

    it('should transition to preparing when hands detected', async () => {
      const { result } = renderHook(() => useHandLandmarker());
      // Simulate hand detection
      await act(async () => {
        result.current.simulateHandsDetected(true);
      });
      expect(result.current.captureState).toBe('preparing');
    });

    it('should transition to signing when movement exceeds threshold', async () => {
      // ... test significant movement detection
    });

    it('should transition to completing when movement stops', async () => {
      // ... test stillness detection
    });

    it('should call onSignComplete after completing delay', async () => {
      const onSignComplete = vi.fn();
      const { result } = renderHook(() =>
        useHandLandmarker({ onSignComplete })
      );
      // ... simulate full sign capture cycle
      expect(onSignComplete).toHaveBeenCalledWith(expect.any(Array));
    });
  });

  describe('frame buffering', () => {
    it('should capture frames during signing state', () => {
      // ...
    });

    it('should clear buffer when returning to idle', () => {
      // ...
    });

    it('should respect maxFrames limit', () => {
      // ...
    });
  });

  describe('velocity calculation', () => {
    it('should calculate movement velocity correctly', () => {
      const prev = [{ x: 0, y: 0, z: 0 }];
      const curr = [{ x: 0.1, y: 0.1, z: 0 }];
      const velocity = calculateVelocity(prev, curr);
      expect(velocity).toBeCloseTo(0.141, 2);
    });
  });
});
```

**Output:** `src/hooks/__tests__/use-hand-landmarker.test.ts`

---

### A.5.2 Write unit tests for ASL translation service
| Field | Value |
|-------|-------|
| **Task Name** | Write unit tests for asl-translation-service.ts (API mocking, errors) |
| **Phase** | Testing & QA |
| **Estimated Time** | 3 hours |
| **Priority** | 🔴 High |
| **Dependencies** | A.3.4 |
| **Assigned To** | Antigravity |
| **Status** | To Do |

**Description:**
Test the translation service with mocked Gemini API responses.

**Acceptance Criteria:**
- [ ] Test successful translation parsing
- [ ] Test confidence score calculation
- [ ] Test API error handling (rate limits, timeouts)
- [ ] Test frame selection logic
- [ ] Mock Gemini API responses

**Technical Details:**
```typescript
// File: src/lib/__tests__/asl-translation-service.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { translateASLFrames, calculateConfidence } from '../asl-translation-service';

// Mock Google GenAI
vi.mock('@google/genai', () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: vi.fn().mockReturnValue({
      generateContent: vi.fn(),
    }),
  })),
}));

describe('translateASLFrames', () => {
  const mockFrames = [
    { imageData: 'base64data1', timestamp: 0, landmarks: [] },
    { imageData: 'base64data2', timestamp: 100, landmarks: [] },
    { imageData: 'base64data3', timestamp: 200, landmarks: [] },
  ];

  it('should return translation from Gemini response', async () => {
    const mockResponse = {
      response: {
        text: () => JSON.stringify({
          translation: 'pain',
          confidence: 'high',
        }),
      },
    };
    // ... setup mock
    const result = await translateASLFrames(mockFrames);
    expect(result.translation).toBe('pain');
  });

  it('should handle malformed JSON response', async () => {
    const mockResponse = {
      response: { text: () => 'not valid json' },
    };
    // ... should return low confidence fallback
  });

  it('should handle API timeout', async () => {
    // Mock timeout error
    // Should return error result, not throw
  });

  it('should handle rate limit errors', async () => {
    // Mock 429 response
    // Should return appropriate error message
  });
});

describe('calculateConfidence', () => {
  it('should weight model confidence at 50%', () => {
    const result = calculateConfidence(
      { translation: 'test', confidence: 'high' },
      { frameCount: 5, handsVisibleCount: 5, signDurationMs: 1500, movementVelocityAvg: 0.02 }
    );
    expect(result.factors.modelConfidence).toBe(90);
  });

  it('should penalize low hand visibility', () => {
    const result = calculateConfidence(
      { translation: 'test', confidence: 'high' },
      { frameCount: 10, handsVisibleCount: 3, signDurationMs: 1500, movementVelocityAvg: 0.02 }
    );
    expect(result.factors.handVisibility).toBe(30);
    expect(result.overall).toBeLessThan(70);
  });

  it('should penalize too-short sign duration', () => {
    const result = calculateConfidence(
      { translation: 'test', confidence: 'high' },
      { frameCount: 5, handsVisibleCount: 5, signDurationMs: 200, movementVelocityAvg: 0.02 }
    );
    expect(result.factors.signDuration).toBeLessThan(50);
  });
});

describe('selectKeyFrames', () => {
  it('should always include first and last frames', () => {
    // ...
  });

  it('should select high-movement frames', () => {
    // ...
  });

  it('should respect minimum frame gap', () => {
    // ...
  });
});
```

**Output:** `src/lib/__tests__/asl-translation-service.test.ts`

---

## A.4 Code Review Checkpoints

### A.4.1 Phase A Code Review #1: Research Complete
| Field | Value |
|-------|-------|
| **Task Name** | Code Review: Phase A Research Complete |
| **Phase** | Monitoring & Iteration |
| **Estimated Time** | 1 hour |
| **Priority** | 🔴 High |
| **Dependencies** | A.1.1, A.1.2, A.1.3 |
| **Assigned To** | Caleb |
| **Status** | To Do |

**Review Checklist:**
- [ ] ASL-DATASETS.md is comprehensive
- [ ] GEMINI-VISION-ANALYSIS.md has concrete benchmarks
- [ ] ASL-MODEL-OPTIONS.md has clear recommendation
- [ ] Decision made: Continue with Gemini Vision or pivot?

---

### A.4.2 Phase A Code Review #2: Testing Complete
| Field | Value |
|-------|-------|
| **Task Name** | Code Review: Phase A Testing Complete |
| **Phase** | Monitoring & Iteration |
| **Estimated Time** | 1 hour |
| **Priority** | 🔴 High |
| **Dependencies** | A.2.3, A.2.4, A.2.5 |
| **Assigned To** | Caleb |
| **Status** | To Do |

**Review Checklist:**
- [ ] 20 test videos collected
- [ ] Accuracy test script runs successfully
- [ ] Baseline accuracy documented
- [ ] Prompt optimization tested
- [ ] GO/NO-GO decision: Is accuracy acceptable?

---

### A.4.3 Phase A Code Review #3: Build Complete
| Field | Value |
|-------|-------|
| **Task Name** | Code Review: Phase A Build Complete |
| **Phase** | Monitoring & Iteration |
| **Estimated Time** | 2 hours |
| **Priority** | 🔴 High |
| **Dependencies** | A.3.1, A.3.2, A.3.3, A.3.4, A.3.5 |
| **Assigned To** | Caleb |
| **Status** | To Do |

**Review Checklist:**
- [ ] `use-hand-landmarker.ts` improvements merged
- [ ] Smoothing and noise reduction working
- [ ] Frame selection optimized
- [ ] Confidence scoring detailed
- [ ] Visual feedback component working
- [ ] TypeScript compiles with no errors
- [ ] Re-run accuracy tests - improvement shown?

---

# PHASE B: DOCTOR EXPERIENCE

> **Goal:** Make the doctor's view production-ready with clear communication and actions
> **Duration:** 1 week
> **Exit Criteria:** Doctor can see patient ASL with confidence, request repeats, and respond effectively

---

## B.1 Planning & Design Tasks

### B.1.1 Design doctor dashboard layout and information hierarchy
| Field | Value |
|-------|-------|
| **Task Name** | Design doctor dashboard layout with ASL input display |
| **Phase** | Planning & Design |
| **Estimated Time** | 3 hours |
| **Priority** | 🔴 High |
| **Dependencies** | Phase A complete |
| **Assigned To** | Antigravity |
| **Status** | To Do |

**Description:**
Create wireframes/design for doctor's optimized view.

**Acceptance Criteria:**
- [ ] Wireframe showing all information zones
- [ ] Typography scale (larger for readability)
- [ ] Color coding for confidence levels
- [ ] Action buttons placement
- [ ] Mobile responsive consideration

**Technical Details:**
```
Doctor Dashboard Layout:

┌─────────────────────────────────────────────────────────────────┐
│  HealthBridge - Doctor View                    [End Session] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────┐  ┌──────────────────────────────┐ │
│  │                         │  │                              │ │
│  │    PATIENT VIDEO        │  │    PATIENT'S MESSAGE         │ │
│  │    (Large, prominent)   │  │    (What they just signed)   │ │
│  │                         │  │                              │ │
│  │    [ASL capture status] │  │  "My chest hurts"            │ │
│  │                         │  │  ████████░░ 85% confident    │ │
│  │                         │  │                              │ │
│  │                         │  │  [Ask to repeat] [Got it ✓]  │ │
│  └─────────────────────────┘  └──────────────────────────────┘ │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  CONVERSATION HISTORY                               🔊 ON │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  [10:32] Doctor: "How are you feeling today?"            │  │
│  │  [10:33] Patient (ASL): "Not good" ✓ High confidence     │  │
│  │  [10:34] Doctor: "Can you describe the pain?"            │  │
│  │  [10:35] Patient (ASL): "My chest hurts" ⚠️ 85%          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  MEDICAL TERMS DETECTED                                   │  │
│  │  "chest" - showed patient simplified explanation          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Output:** `/docs/DOCTOR-DASHBOARD-DESIGN.md` with wireframes

---

## B.2 Build Tasks

### B.2.1 Build dedicated DoctorDashboard component
| Field | Value |
|-------|-------|
| **Task Name** | Build DoctorDashboard component with optimized layout |
| **Phase** | Build |
| **Estimated Time** | 6 hours |
| **Priority** | 🔴 High |
| **Dependencies** | B.1.1 |
| **Assigned To** | Antigravity |
| **Status** | To Do |

**Description:**
Create a new dashboard component specifically optimized for doctors.

**Acceptance Criteria:**
- [ ] Large, clear display of current patient message
- [ ] Confidence indicator with visual scale
- [ ] Action buttons: "Ask to repeat", "Confirm understood"
- [ ] Conversation history with timestamps
- [ ] Medical terms detected section
- [ ] Sound notification toggle

**Technical Details:**
```tsx
// File: src/components/DoctorDashboard.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, RefreshCw, Check, AlertTriangle } from 'lucide-react';
import { SpeakerSegment } from '@/types/speaker';
import { DetailedConfidence } from '@/lib/asl-translation-service';

interface PatientMessage {
  text: string;
  confidence: DetailedConfidence;
  timestamp: string;
  inputType: 'asl' | 'audio';
  acknowledged: boolean;
}

interface DoctorDashboardProps {
  patientVideoStream: MediaStream | null;
  currentMessage: PatientMessage | null;
  conversationHistory: SpeakerSegment[];
  medicalTermsDetected: string[];
  onRequestRepeat: () => void;
  onAcknowledge: () => void;
  isPatientSigning: boolean;
}

export function DoctorDashboard({
  patientVideoStream,
  currentMessage,
  conversationHistory,
  medicalTermsDetected,
  onRequestRepeat,
  onAcknowledge,
  isPatientSigning,
}: DoctorDashboardProps) {
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Play notification sound when new message arrives
  useEffect(() => {
    if (currentMessage && soundEnabled && !currentMessage.acknowledged) {
      playNotificationSound();
    }
  }, [currentMessage, soundEnabled]);

  return (
    <div className="h-screen bg-slate-900 text-white p-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          Health<span className="text-emerald-400">Bridge</span> - Doctor View
        </h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-lg bg-slate-800"
          >
            {soundEnabled ? <Volume2 /> : <VolumeX />}
          </button>
          <button className="px-4 py-2 bg-red-500 rounded-lg font-medium">
            End Session
          </button>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Patient Video */}
        <div className="bg-slate-800 rounded-2xl p-4">
          <h2 className="text-lg font-medium mb-3">Patient Camera</h2>
          <div className="aspect-video bg-black rounded-xl overflow-hidden relative">
            {patientVideoStream ? (
              <video
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500">
                Waiting for patient...
              </div>
            )}

            {isPatientSigning && (
              <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-purple-500 rounded-full text-sm font-medium animate-pulse">
                Patient is signing...
              </div>
            )}
          </div>
        </div>

        {/* Current Message */}
        <div className="bg-slate-800 rounded-2xl p-4">
          <h2 className="text-lg font-medium mb-3">Patient's Message</h2>

          {currentMessage ? (
            <div className="space-y-4">
              {/* Main message */}
              <div className="bg-slate-700 rounded-xl p-6">
                <p className="text-3xl font-bold mb-4">
                  "{currentMessage.text}"
                </p>

                {/* Confidence bar */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-3 bg-slate-600 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        currentMessage.confidence.overall >= 80 ? 'bg-green-500' :
                        currentMessage.confidence.overall >= 60 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${currentMessage.confidence.overall}%` }}
                    />
                  </div>
                  <span className="text-lg font-medium">
                    {currentMessage.confidence.overall}%
                  </span>
                </div>

                {/* Low confidence warning */}
                {currentMessage.confidence.overall < 70 && (
                  <div className="mt-3 flex items-center gap-2 text-yellow-400">
                    <AlertTriangle className="w-5 h-5" />
                    <span>Low confidence - consider asking patient to repeat</span>
                  </div>
                )}

                {/* Alternative interpretations */}
                {currentMessage.confidence.alternatives.length > 0 && (
                  <div className="mt-3 text-sm text-slate-400">
                    Could also be: {currentMessage.confidence.alternatives.join(', ')}
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  onClick={onRequestRepeat}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-amber-500 hover:bg-amber-600 rounded-xl font-medium transition-colors"
                >
                  <RefreshCw className="w-5 h-5" />
                  Ask to Repeat
                </button>
                <button
                  onClick={onAcknowledge}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-500 hover:bg-emerald-600 rounded-xl font-medium transition-colors"
                >
                  <Check className="w-5 h-5" />
                  Got It
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 text-slate-500">
              Waiting for patient to sign...
            </div>
          )}
        </div>
      </div>

      {/* Conversation History */}
      <div className="bg-slate-800 rounded-2xl p-4 mb-6">
        <h2 className="text-lg font-medium mb-3">Conversation History</h2>
        <div className="max-h-48 overflow-y-auto space-y-2">
          {conversationHistory.map((segment, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg ${
                segment.speaker === 'doctor'
                  ? 'bg-blue-500/10 border-l-4 border-blue-500'
                  : 'bg-purple-500/10 border-l-4 border-purple-500'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium">
                  {segment.speaker === 'doctor' ? 'You' : 'Patient'}
                </span>
                <span className="text-sm text-slate-400">
                  {segment.timestamp}
                </span>
                {segment.inputType === 'asl' && (
                  <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded">
                    ASL
                  </span>
                )}
              </div>
              <p className="text-lg">{segment.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Medical Terms */}
      {medicalTermsDetected.length > 0 && (
        <div className="bg-slate-800 rounded-2xl p-4">
          <h2 className="text-lg font-medium mb-3">Medical Terms Explained to Patient</h2>
          <div className="flex flex-wrap gap-2">
            {medicalTermsDetected.map((term, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full"
              >
                {term}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function playNotificationSound() {
  const audio = new Audio('/sounds/notification.mp3');
  audio.volume = 0.5;
  audio.play().catch(() => {}); // Ignore autoplay errors
}
```

**Output:** `src/components/DoctorDashboard.tsx`

---

### B.2.2 Implement "Ask to Repeat" communication flow
| Field | Value |
|-------|-------|
| **Task Name** | Implement bidirectional "Ask to Repeat" request system |
| **Phase** | Build |
| **Estimated Time** | 4 hours |
| **Priority** | 🔴 High |
| **Dependencies** | B.2.1 |
| **Assigned To** | Antigravity |
| **Status** | To Do |

**Description:**
When doctor clicks "Ask to Repeat", patient should see a clear prompt to sign again.

**Acceptance Criteria:**
- [ ] Doctor clicks button → message sent to patient view
- [ ] Patient sees "Please sign again" prompt
- [ ] Prompt is visually prominent and accessible
- [ ] Prompt auto-dismisses when new sign captured
- [ ] Works over WebSocket/LiveKit data channel

**Technical Details:**
```typescript
// File: src/lib/session-communication.ts

// Message types between doctor and patient views
type SessionMessage =
  | { type: 'REQUEST_REPEAT'; reason?: string }
  | { type: 'ACKNOWLEDGE'; messageId: string }
  | { type: 'PATIENT_SIGNING'; status: boolean }
  | { type: 'NEW_TRANSLATION'; translation: ASLTranslationResult }
  | { type: 'DOCTOR_SPEAKING'; text: string };

// Use LiveKit Data Channel for real-time communication
import { Room, DataPacket_Kind } from 'livekit-client';

export class SessionCommunication {
  private room: Room;
  private onMessage: (message: SessionMessage) => void;

  constructor(room: Room, onMessage: (message: SessionMessage) => void) {
    this.room = room;
    this.onMessage = onMessage;

    // Listen for data messages
    room.on('dataReceived', (payload, participant) => {
      const message = JSON.parse(new TextDecoder().decode(payload));
      this.onMessage(message);
    });
  }

  sendMessage(message: SessionMessage) {
    const data = new TextEncoder().encode(JSON.stringify(message));
    this.room.localParticipant.publishData(data, DataPacket_Kind.RELIABLE);
  }

  requestRepeat(reason?: string) {
    this.sendMessage({ type: 'REQUEST_REPEAT', reason });
  }

  acknowledge(messageId: string) {
    this.sendMessage({ type: 'ACKNOWLEDGE', messageId });
  }
}
```

```tsx
// In patient view: RepeatRequestModal.tsx
export function RepeatRequestModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="bg-purple-600 rounded-3xl p-8 max-w-md text-center animate-bounce-gentle">
        <RefreshCw className="w-16 h-16 mx-auto mb-4 text-white" />
        <h2 className="text-3xl font-bold text-white mb-2">
          Please Sign Again
        </h2>
        <p className="text-xl text-white/80">
          The doctor didn't catch that clearly
        </p>
      </div>
    </div>
  );
}
```

**Output:** `src/lib/session-communication.ts`, `src/components/RepeatRequestModal.tsx`

---

### B.2.3 Add sound notifications for doctor
| Field | Value |
|-------|-------|
| **Task Name** | Add audio notification system for new patient messages |
| **Phase** | Build |
| **Estimated Time** | 2 hours |
| **Priority** | 🟡 Medium |
| **Dependencies** | B.2.1 |
| **Assigned To** | Antigravity |
| **Status** | To Do |

**Description:**
Doctors need audio alerts when patient sends a new message, especially if looking elsewhere.

**Acceptance Criteria:**
- [ ] Subtle sound when new message arrives
- [ ] Different sound for low-confidence message
- [ ] Toggle to enable/disable sounds
- [ ] Volume control
- [ ] Respects system do-not-disturb

**Technical Details:**
```typescript
// File: src/lib/notification-sounds.ts

export const NotificationSounds = {
  newMessage: '/sounds/message-received.mp3',
  lowConfidence: '/sounds/attention-needed.mp3',
  patientSigning: '/sounds/signing-started.mp3',
};

class SoundManager {
  private enabled: boolean = true;
  private volume: number = 0.5;
  private audioContext: AudioContext | null = null;

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  async play(sound: keyof typeof NotificationSounds) {
    if (!this.enabled) return;

    try {
      const audio = new Audio(NotificationSounds[sound]);
      audio.volume = this.volume;
      await audio.play();
    } catch (error) {
      console.warn('Could not play notification sound:', error);
    }
  }
}

export const soundManager = new SoundManager();
```

**Output:** `src/lib/notification-sounds.ts`, sound files in `/public/sounds/`

---

### B.2.4 Build real-time "Patient is signing" indicator
| Field | Value |
|-------|-------|
| **Task Name** | Build real-time signing status indicator for doctor view |
| **Phase** | Build |
| **Estimated Time** | 3 hours |
| **Priority** | 🟡 Medium |
| **Dependencies** | B.2.2 |
| **Assigned To** | Antigravity |
| **Status** | To Do |

**Description:**
Doctor should see when patient is actively signing, before translation is complete.

**Acceptance Criteria:**
- [ ] "Patient is signing..." appears in real-time
- [ ] Shows on patient video overlay
- [ ] Shows in message area
- [ ] Status sent via data channel from patient view
- [ ] Disappears when translation arrives or signing stops

**Technical Details:**
```typescript
// In patient's ASLInput component:
useEffect(() => {
  // Send signing status to doctor via data channel
  if (sessionCommunication) {
    sessionCommunication.sendMessage({
      type: 'PATIENT_SIGNING',
      status: isCapturing, // from useHandLandmarker
    });
  }
}, [isCapturing, sessionCommunication]);
```

**Output:** Updates to `ASLInput.tsx`, `DoctorDashboard.tsx`

---

### B.2.5 Create doctor onboarding tutorial
| Field | Value |
|-------|-------|
| **Task Name** | Create interactive onboarding tutorial for doctors |
| **Phase** | Build |
| **Estimated Time** | 4 hours |
| **Priority** | 🟡 Medium |
| **Dependencies** | B.2.1 |
| **Assigned To** | Antigravity |
| **Status** | To Do |

**Description:**
First-time doctors need to understand how the system works.

**Acceptance Criteria:**
- [ ] Step-by-step tutorial overlay
- [ ] Explains confidence scores
- [ ] Shows how to request repeat
- [ ] Demonstrates conversation flow
- [ ] Can be dismissed and re-accessed

**Technical Details:**
```tsx
// File: src/components/DoctorOnboarding.tsx

const ONBOARDING_STEPS = [
  {
    target: '.patient-video',
    title: 'Patient Camera',
    content: 'You'll see your patient here. When they sign, their hands will be tracked.',
  },
  {
    target: '.current-message',
    title: 'Patient Messages',
    content: 'When the patient signs, their message appears here with a confidence score.',
  },
  {
    target: '.confidence-bar',
    title: 'Confidence Score',
    content: 'Green = high confidence, Yellow = medium, Red = low. Ask for repeat if unsure.',
  },
  {
    target: '.repeat-button',
    title: 'Ask to Repeat',
    content: 'Click this if you didn't understand. The patient will see a prompt to sign again.',
  },
  {
    target: '.conversation-history',
    title: 'Conversation History',
    content: 'Full transcript of your session with the patient.',
  },
];
```

**Output:** `src/components/DoctorOnboarding.tsx`

---

## B.3 Code Review Checkpoints

### B.3.1 Phase B Code Review #1: Doctor Dashboard Complete
| Field | Value |
|-------|-------|
| **Task Name** | Code Review: Doctor Dashboard and Communication Flow |
| **Phase** | Monitoring & Iteration |
| **Estimated Time** | 2 hours |
| **Priority** | 🔴 High |
| **Dependencies** | B.2.1, B.2.2, B.2.3, B.2.4 |
| **Assigned To** | Caleb |
| **Status** | To Do |

**Review Checklist:**
- [ ] Doctor dashboard renders correctly
- [ ] Confidence scores display properly
- [ ] "Ask to repeat" flow works end-to-end
- [ ] Sound notifications work
- [ ] Real-time signing indicator works
- [ ] No TypeScript errors
- [ ] Responsive on different screen sizes

---

# PHASE C: TEXT-TO-ASL AVATAR

> **Goal:** Complete the two-way communication loop with a signing avatar
> **Duration:** 3-4 weeks
> **Exit Criteria:** Patient sees accurate ASL avatar within 2 seconds of doctor speaking

---

## C.1 Research Tasks

### C.1.1 Research text-to-sign translation approaches
| Field | Value |
|-------|-------|
| **Task Name** | Research English to ASL translation approaches and libraries |
| **Phase** | Research & Discovery |
| **Estimated Time** | 6 hours |
| **Priority** | 🔴 High |
| **Dependencies** | Phase B complete |
| **Assigned To** | Antigravity |
| **Status** | To Do |

**Description:**
ASL has different grammar than English. Research how to convert English text to ASL gloss/signs.

**Acceptance Criteria:**
- [ ] Document ASL grammar differences from English
- [ ] Research existing English→ASL translation tools
- [ ] Evaluate rule-based vs ML approaches
- [ ] Estimate accuracy and latency for each
- [ ] Recommend approach for MVP

**Technical Details:**
```
Key ASL Grammar Differences:
1. Word order: Topic-Comment (vs Subject-Verb-Object)
   English: "I am going to the store"
   ASL: "STORE I GO"

2. No articles: "a", "an", "the" are dropped
   English: "The doctor will see you"
   ASL: "DOCTOR SEE YOU"

3. Time established first:
   English: "I went to the hospital yesterday"
   ASL: "YESTERDAY HOSPITAL I GO"

4. Facial expressions carry grammar:
   Questions use eyebrow raise
   Negations use head shake

Approaches to research:

1. Rule-based conversion
   - Pattern matching and reordering
   - Simpler but less accurate
   - Example: SignWriting translators

2. Machine learning
   - Sequence-to-sequence models
   - More accurate but needs training data
   - Example: Google's sign language research

3. Hybrid
   - ML for understanding, rules for formatting
   - May be best balance

4. Commercial APIs
   - SignAll
   - SLAIT
   - Check availability and pricing
```

**Output:** `/docs/TEXT-TO-ASL-RESEARCH.md`

---

### C.1.2 Research ASL avatar rendering options
| Field | Value |
|-------|-------|
| **Task Name** | Research and evaluate ASL avatar rendering libraries and approaches |
| **Phase** | Research & Discovery |
| **Estimated Time** | 6 hours |
| **Priority** | 🔴 High |
| **Dependencies** | None |
| **Assigned To** | Antigravity |
| **Status** | To Do |

**Description:**
Evaluate options for rendering a signing avatar.

**Acceptance Criteria:**
- [ ] Evaluate 3D avatar libraries (ReadyPlayerMe, Mixamo, etc.)
- [ ] Evaluate pre-recorded video approaches
- [ ] Evaluate neural synthesis options
- [ ] Document cost, quality, latency for each
- [ ] Recommend approach for MVP

**Technical Details:**
```
Avatar Approaches:

1. 3D Avatar with Animation Data
   Libraries:
   - ReadyPlayerMe (avatar creation)
   - Mixamo (animation library - may not have ASL)
   - Three.js (rendering)
   - React Three Fiber (React integration)

   Pros: Scalable, customizable
   Cons: Need ASL motion capture data, uncanny valley risk

2. Pre-recorded Video Dictionary
   Approach:
   - Record human signing each word/phrase
   - Stitch videos together

   Pros: Natural, accurate
   Cons: Limited vocabulary, storage heavy, transitions

3. Neural Video Synthesis
   Technologies:
   - First Order Motion Model
   - Thin-Plate Spline Motion Model
   - Audio2Gesture networks

   Pros: Most natural
   Cons: Computationally expensive, still research-stage

4. Commercial Solutions
   - SignAll (enterprise)
   - HandTalk (Portuguese/Brazilian focus)
   - Check for medical vocabulary support

Evaluation Criteria:
- Sign accuracy (can Deaf users understand?)
- Latency (< 2 seconds target)
- Vocabulary coverage (medical terms)
- Cost (API pricing, storage, compute)
- Customization (can add new signs?)
```

**Output:** `/docs/ASL-AVATAR-RESEARCH.md`

---

### C.1.3 Research sign language motion capture data sources
| Field | Value |
|-------|-------|
| **Task Name** | Research sources for ASL motion capture / animation data |
| **Phase** | Research & Discovery |
| **Estimated Time** | 4 hours |
| **Priority** | 🟡 Medium |
| **Dependencies** | C.1.2 |
| **Assigned To** | Antigravity |
| **Status** | To Do |

**Description:**
If using 3D avatar, need animation data for signs.

**Acceptance Criteria:**
- [ ] Find ASL motion capture datasets
- [ ] Identify if medical signs are included
- [ ] Document format and licensing
- [ ] Estimate effort to convert/use

**Technical Details:**
```
Potential sources:

1. ASL-LEX (asl-lex.org)
   - Has video, may be able to extract poses

2. How2Sign dataset
   - Continuous signing with pose data

3. SignWriting databases
   - Written form, need to animate

4. Custom capture
   - Use MediaPipe to capture from ASL videos
   - Convert to animation data

5. Academic partnerships
   - Gallaudet University
   - Rochester Institute of Technology
   - NTID (National Technical Institute for the Deaf)
```

**Output:** `/docs/ASL-MOTION-DATA-SOURCES.md`

---

## C.2 Planning & Design Tasks

### C.2.1 Design avatar system architecture
| Field | Value |
|-------|-------|
| **Task Name** | Design complete avatar system architecture |
| **Phase** | Planning & Design |
| **Estimated Time** | 4 hours |
| **Priority** | 🔴 High |
| **Dependencies** | C.1.1, C.1.2 |
| **Assigned To** | Antigravity |
| **Status** | To Do |

**Description:**
Create technical architecture for the entire text-to-avatar pipeline.

**Acceptance Criteria:**
- [ ] Data flow diagram
- [ ] Component breakdown
- [ ] API contracts defined
- [ ] Latency budget per component
- [ ] Fallback strategies

**Technical Details:**
```
Pipeline Architecture:

Doctor speaks
    │
    ▼
┌────────────────────┐
│ Gemini WebSocket   │
│ (existing)         │
└─────────┬──────────┘
          │ English text
          ▼
┌────────────────────┐
│ Text Preprocessor  │ - Clean text
│                    │ - Split sentences
│                    │ - Identify medical terms
└─────────┬──────────┘
          │ Clean text
          ▼
┌────────────────────┐
│ ASL Translator     │ - English → ASL gloss
│                    │ - Grammar conversion
│                    │ - Word → sign mapping
└─────────┬──────────┘
          │ Sign sequence
          ▼
┌────────────────────┐
│ Animation Resolver │ - Map signs to animations
│                    │ - Handle unknown words
│                    │ - Fingerspelling fallback
└─────────┬──────────┘
          │ Animation data
          ▼
┌────────────────────┐
│ Avatar Renderer    │ - Three.js/React Three Fiber
│                    │ - Smooth transitions
│                    │ - Real-time playback
└─────────┬──────────┘
          │ Video/canvas
          ▼
Patient sees avatar

Latency Budget (target: 2s total):
- Text preprocessing: 50ms
- ASL translation: 200ms
- Animation resolution: 100ms
- First animation frame: 100ms
- Buffer: 550ms
- Total: 1000ms target (2s max)
```

**Output:** `/docs/AVATAR-ARCHITECTURE.md`

---

### C.2.2 Design sign vocabulary database schema
| Field | Value |
|-------|-------|
| **Task Name** | Design database schema for sign vocabulary and animations |
| **Phase** | Planning & Design |
| **Estimated Time** | 3 hours |
| **Priority** | 🔴 High |
| **Dependencies** | C.2.1 |
| **Assigned To** | Antigravity |
| **Status** | To Do |

**Description:**
Need a database structure to store signs and their animations.

**Acceptance Criteria:**
- [ ] Schema supports word → sign mapping
- [ ] Handles synonyms and variations
- [ ] Supports medical vocabulary tagging
- [ ] Includes animation metadata
- [ ] Supports fingerspelling letters

**Technical Details:**
```typescript
// File: src/types/sign-vocabulary.ts

interface SignEntry {
  id: string;
  gloss: string;              // ASL gloss representation (e.g., "PAIN")
  englishWords: string[];     // English words that map to this sign
  category: SignCategory;
  animationData: AnimationData;
  metadata: {
    difficulty: 'basic' | 'intermediate' | 'advanced';
    isMedical: boolean;
    frequency: number;        // How common in healthcare context
    variations: string[];     // Regional/dialect variations
  };
}

type SignCategory =
  | 'medical'
  | 'emotion'
  | 'question'
  | 'time'
  | 'pronoun'
  | 'action'
  | 'description'
  | 'number'
  | 'fingerspelling';

interface AnimationData {
  type: 'mocap' | 'keyframe' | 'video';
  source: string;             // File path or URL
  duration: number;           // milliseconds
  transitions: {
    inBlendFrames: number;
    outBlendFrames: number;
  };
  handedness: 'one' | 'two';
  facialExpression?: 'neutral' | 'question' | 'emphasis' | 'negative';
}

// Database collections:
// 1. signs - Main vocabulary
// 2. fingerspelling - A-Z letters
// 3. numbers - 0-100+
// 4. phrases - Common multi-sign combinations
// 5. medical_terms - Healthcare-specific

// Example entries:
const painSign: SignEntry = {
  id: 'sign_pain_001',
  gloss: 'PAIN',
  englishWords: ['pain', 'hurt', 'ache', 'sore'],
  category: 'medical',
  animationData: {
    type: 'mocap',
    source: '/animations/signs/pain.glb',
    duration: 800,
    transitions: { inBlendFrames: 5, outBlendFrames: 5 },
    handedness: 'two',
    facialExpression: 'emphasis',
  },
  metadata: {
    difficulty: 'basic',
    isMedical: true,
    frequency: 95,
    variations: [],
  },
};
```

**Output:** `/docs/SIGN-DATABASE-SCHEMA.md`, `src/types/sign-vocabulary.ts`

---

## C.3 Build Tasks

### C.3.1 Build English-to-ASL text translator service
| Field | Value |
|-------|-------|
| **Task Name** | Build service to convert English text to ASL gloss sequence |
| **Phase** | Build |
| **Estimated Time** | 12 hours |
| **Priority** | 🔴 High |
| **Dependencies** | C.2.1 |
| **Assigned To** | Antigravity |
| **Status** | To Do |

**Description:**
Convert English sentences to ASL word order and format.

**Acceptance Criteria:**
- [ ] Handles basic sentence structures
- [ ] Removes articles (a, an, the)
- [ ] Reorders to Topic-Comment structure
- [ ] Marks questions and negations
- [ ] Handles medical vocabulary
- [ ] Fallback to fingerspelling for unknown words

**Technical Details:**
```typescript
// File: src/lib/english-to-asl.ts

interface ASLGloss {
  signs: GlossSign[];
  originalText: string;
  grammarNotes: string[];
}

interface GlossSign {
  gloss: string;
  type: 'sign' | 'fingerspell' | 'number';
  emphasis?: boolean;
  facialMarker?: 'question' | 'negative' | 'rhetorical';
}

export function translateToASL(englishText: string): ASLGloss {
  // Step 1: Tokenize and tag parts of speech
  const tokens = tokenize(englishText);
  const tagged = tagPartsOfSpeech(tokens);

  // Step 2: Remove articles
  const noArticles = tagged.filter(t => !['a', 'an', 'the'].includes(t.word.toLowerCase()));

  // Step 3: Identify time references and move to front
  const { timeWords, otherWords } = separateTimeWords(noArticles);

  // Step 4: Reorder to ASL grammar
  const reordered = reorderToASL(timeWords, otherWords);

  // Step 5: Map to sign glosses
  const signs = reordered.map(word => mapToGloss(word));

  // Step 6: Add facial markers for questions/negations
  const withMarkers = addFacialMarkers(signs, englishText);

  return {
    signs: withMarkers,
    originalText: englishText,
    grammarNotes: generateGrammarNotes(englishText, withMarkers),
  };
}

// Example transformations:
// "The doctor will see you now"
// → [DOCTOR, SEE, YOU, NOW]

// "Are you feeling pain in your chest?"
// → [PAIN, CHEST, YOU, FEEL, (question marker)]

// "Yesterday I took my medicine"
// → [YESTERDAY, MEDICINE, I, TAKE]

// "I don't understand"
// → [UNDERSTAND, I, (negative marker)]
```

**Output:** `src/lib/english-to-asl.ts` with comprehensive translation logic

---

### C.3.2 Build sign vocabulary database
| Field | Value |
|-------|-------|
| **Task Name** | Build sign vocabulary database with 100+ medical signs |
| **Phase** | Build |
| **Estimated Time** | 8 hours |
| **Priority** | 🔴 High |
| **Dependencies** | C.2.2, C.1.3 |
| **Assigned To** | Antigravity |
| **Status** | To Do |

**Description:**
Create the vocabulary database with at least 100 signs relevant to healthcare.

**Acceptance Criteria:**
- [ ] 100+ sign entries
- [ ] All 26 fingerspelling letters
- [ ] Numbers 0-20
- [ ] 50+ medical terms
- [ ] Common pronouns and question words
- [ ] JSON format, easily extensible

**Technical Details:**
```
Priority vocabulary list:

Medical (50 signs):
- Body parts: head, chest, stomach, back, arm, leg, hand, throat, ear, eye
- Symptoms: pain, hurt, dizzy, nausea, tired, fever, cough, breathe
- Actions: take, give, swallow, inject, examine, test
- Medical: doctor, nurse, hospital, medicine, pill, surgery
- Conditions: allergic, sick, healthy, better, worse
- Questions: where, when, how-much, how-long

Common (30 signs):
- Pronouns: I, you, he, she, we, they, it
- Questions: what, why, how, when, where, who
- Responses: yes, no, maybe, please, thank-you
- Time: now, today, yesterday, tomorrow, morning, night
- Descriptions: big, small, more, less, same, different

Actions (20 signs):
- feel, see, hear, understand, know, want, need, help
- come, go, sit, stand, wait, stop, start

Fingerspelling: A-Z (26)
Numbers: 0-20 (21)

Total: ~127 signs minimum
```

**Output:** `src/data/sign-vocabulary.json`, data loader utility

---

### C.3.3 Set up 3D avatar rendering with React Three Fiber
| Field | Value |
|-------|-------|
| **Task Name** | Set up 3D avatar rendering environment with React Three Fiber |
| **Phase** | Build |
| **Estimated Time** | 8 hours |
| **Priority** | 🔴 High |
| **Dependencies** | C.1.2 |
| **Assigned To** | Antigravity |
| **Status** | To Do |

**Description:**
Set up the 3D rendering pipeline for the signing avatar.

**Acceptance Criteria:**
- [ ] React Three Fiber installed and configured
- [ ] Basic avatar model loaded
- [ ] Avatar renders in component
- [ ] Performance optimized for real-time
- [ ] Lighting and camera configured

**Technical Details:**
```tsx
// File: src/components/ASLAvatar.tsx

'use client';

import React, { useRef, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';

interface ASLAvatarProps {
  currentAnimation: string | null;
  onAnimationComplete: () => void;
  isPaused: boolean;
}

function Avatar({ currentAnimation, onAnimationComplete }: ASLAvatarProps) {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF('/models/avatar.glb');
  const { actions, mixer } = useAnimations(animations, group);

  useEffect(() => {
    if (currentAnimation && actions[currentAnimation]) {
      const action = actions[currentAnimation];
      action.reset().play();
      action.clampWhenFinished = true;
      action.loop = THREE.LoopOnce;

      // Handle animation complete
      const onFinished = () => onAnimationComplete();
      mixer.addEventListener('finished', onFinished);

      return () => {
        mixer.removeEventListener('finished', onFinished);
      };
    }
  }, [currentAnimation, actions, mixer, onAnimationComplete]);

  return (
    <group ref={group}>
      <primitive object={scene} />
    </group>
  );
}

export function ASLAvatarCanvas(props: ASLAvatarProps) {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 1.5, 2], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />

        <Suspense fallback={<LoadingPlaceholder />}>
          <Avatar {...props} />
        </Suspense>

        {/* Optional: allow user to rotate view */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  );
}

function LoadingPlaceholder() {
  return (
    <mesh>
      <boxGeometry args={[1, 2, 0.5]} />
      <meshStandardMaterial color="gray" />
    </mesh>
  );
}
```

**Output:** `src/components/ASLAvatar.tsx`, dependencies installed

---

### C.3.4 Build animation sequencer for sign playback
| Field | Value |
|-------|-------|
| **Task Name** | Build animation sequencer to play sign sequences smoothly |
| **Phase** | Build |
| **Estimated Time** | 10 hours |
| **Priority** | 🔴 High |
| **Dependencies** | C.3.3 |
| **Assigned To** | Antigravity |
| **Status** | To Do |

**Description:**
Orchestrate multiple sign animations with smooth transitions.

**Acceptance Criteria:**
- [ ] Queues multiple signs
- [ ] Smooth blending between signs
- [ ] Handles fingerspelling sequences
- [ ] Adjustable playback speed
- [ ] Progress callback for UI sync
- [ ] Pause/resume support

**Technical Details:**
```typescript
// File: src/lib/animation-sequencer.ts

interface AnimationQueueItem {
  signId: string;
  gloss: string;
  animationPath: string;
  duration: number;
  facialExpression?: string;
}

interface SequencerState {
  queue: AnimationQueueItem[];
  currentIndex: number;
  isPlaying: boolean;
  isPaused: boolean;
  playbackSpeed: number;
}

type SequencerCallback = {
  onSignStart: (sign: AnimationQueueItem, index: number) => void;
  onSignComplete: (sign: AnimationQueueItem, index: number) => void;
  onSequenceComplete: () => void;
  onProgress: (progress: number) => void;
};

export class AnimationSequencer {
  private state: SequencerState;
  private callbacks: SequencerCallback;
  private animationMixer: THREE.AnimationMixer;

  constructor(mixer: THREE.AnimationMixer, callbacks: SequencerCallback) {
    this.animationMixer = mixer;
    this.callbacks = callbacks;
    this.state = {
      queue: [],
      currentIndex: -1,
      isPlaying: false,
      isPaused: false,
      playbackSpeed: 1.0,
    };
  }

  loadSequence(signs: AnimationQueueItem[]) {
    this.state.queue = signs;
    this.state.currentIndex = -1;
  }

  play() {
    if (this.state.queue.length === 0) return;

    this.state.isPlaying = true;
    this.state.isPaused = false;
    this.playNext();
  }

  private playNext() {
    this.state.currentIndex++;

    if (this.state.currentIndex >= this.state.queue.length) {
      this.state.isPlaying = false;
      this.callbacks.onSequenceComplete();
      return;
    }

    const currentSign = this.state.queue[this.state.currentIndex];
    this.callbacks.onSignStart(currentSign, this.state.currentIndex);

    // Calculate progress
    const progress = (this.state.currentIndex / this.state.queue.length) * 100;
    this.callbacks.onProgress(progress);

    // Play the animation
    this.playAnimation(currentSign);
  }

  private playAnimation(sign: AnimationQueueItem) {
    // Implementation depends on avatar system
    // After animation completes, call handleAnimationComplete
  }

  private handleAnimationComplete() {
    const completedSign = this.state.queue[this.state.currentIndex];
    this.callbacks.onSignComplete(completedSign, this.state.currentIndex);

    if (!this.state.isPaused) {
      // Small delay between signs for natural pacing
      setTimeout(() => this.playNext(), 150);
    }
  }

  pause() {
    this.state.isPaused = true;
    this.animationMixer.timeScale = 0;
  }

  resume() {
    this.state.isPaused = false;
    this.animationMixer.timeScale = this.state.playbackSpeed;
  }

  setSpeed(speed: number) {
    this.state.playbackSpeed = Math.max(0.5, Math.min(2.0, speed));
    if (!this.state.isPaused) {
      this.animationMixer.timeScale = this.state.playbackSpeed;
    }
  }

  stop() {
    this.state.isPlaying = false;
    this.state.currentIndex = -1;
  }
}
```

**Output:** `src/lib/animation-sequencer.ts`

---

### C.3.5 Build avatar player UI component
| Field | Value |
|-------|-------|
| **Task Name** | Build avatar player UI with controls for patient view |
| **Phase** | Build |
| **Estimated Time** | 6 hours |
| **Priority** | 🔴 High |
| **Dependencies** | C.3.4 |
| **Assigned To** | Antigravity |
| **Status** | To Do |

**Description:**
Patient-facing UI for watching the signing avatar.

**Acceptance Criteria:**
- [ ] Large, prominent avatar display
- [ ] Progress indicator for sentence
- [ ] Speed control (slower/faster)
- [ ] Replay button
- [ ] Current word/sign highlighted
- [ ] Text transcript sync

**Technical Details:**
```tsx
// File: src/components/AvatarPlayer.tsx

'use client';

import React, { useState } from 'react';
import { Play, Pause, RotateCcw, Minus, Plus } from 'lucide-react';
import { ASLAvatarCanvas } from './ASLAvatar';
import { ASLGloss } from '@/lib/english-to-asl';

interface AvatarPlayerProps {
  glossSequence: ASLGloss | null;
  autoPlay?: boolean;
}

export function AvatarPlayer({ glossSequence, autoPlay = true }: AvatarPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [currentSignIndex, setCurrentSignIndex] = useState(0);
  const [speed, setSpeed] = useState(1.0);
  const [progress, setProgress] = useState(0);

  const handleSignStart = (index: number) => {
    setCurrentSignIndex(index);
  };

  const handleProgress = (p: number) => {
    setProgress(p);
  };

  const handleComplete = () => {
    setIsPlaying(false);
    setProgress(100);
  };

  const replay = () => {
    setCurrentSignIndex(0);
    setProgress(0);
    setIsPlaying(true);
  };

  return (
    <div className="bg-slate-800 rounded-2xl overflow-hidden">
      {/* Avatar viewport */}
      <div className="aspect-video bg-gradient-to-b from-slate-700 to-slate-800">
        <ASLAvatarCanvas
          currentAnimation={
            glossSequence?.signs[currentSignIndex]?.gloss || null
          }
          onAnimationComplete={() => {/* handled by sequencer */}}
          isPaused={!isPlaying}
        />
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-slate-700">
        <div
          className="h-full bg-purple-500 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Controls */}
      <div className="p-4">
        {/* Current text being signed */}
        {glossSequence && (
          <div className="mb-4">
            <p className="text-white/50 text-sm mb-1">Doctor said:</p>
            <p className="text-white text-lg">
              "{glossSequence.originalText}"
            </p>
          </div>
        )}

        {/* Sign sequence visualization */}
        {glossSequence && (
          <div className="flex flex-wrap gap-2 mb-4">
            {glossSequence.signs.map((sign, index) => (
              <span
                key={index}
                className={`px-2 py-1 rounded text-sm transition-all ${
                  index === currentSignIndex
                    ? 'bg-purple-500 text-white scale-110'
                    : index < currentSignIndex
                      ? 'bg-slate-600 text-white/50'
                      : 'bg-slate-700 text-white/70'
                }`}
              >
                {sign.gloss}
              </span>
            ))}
          </div>
        )}

        {/* Control buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 rounded-full bg-purple-500 hover:bg-purple-600"
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <button
              onClick={replay}
              className="p-2 rounded-full bg-slate-700 hover:bg-slate-600"
            >
              <RotateCcw size={20} />
            </button>
          </div>

          {/* Speed control */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSpeed(Math.max(0.5, speed - 0.25))}
              className="p-1 rounded bg-slate-700"
            >
              <Minus size={16} />
            </button>
            <span className="text-white/70 w-12 text-center">
              {speed}x
            </span>
            <button
              onClick={() => setSpeed(Math.min(2.0, speed + 0.25))}
              className="p-1 rounded bg-slate-700"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Output:** `src/components/AvatarPlayer.tsx`

---

### C.3.6 Integrate avatar into patient view
| Field | Value |
|-------|-------|
| **Task Name** | Integrate avatar player into CinematicVideoRoom patient view |
| **Phase** | Build |
| **Estimated Time** | 4 hours |
| **Priority** | 🔴 High |
| **Dependencies** | C.3.5, C.3.1 |
| **Assigned To** | Antigravity |
| **Status** | To Do |

**Description:**
Add the avatar to the main patient view, showing doctor's speech as ASL.

**Acceptance Criteria:**
- [ ] Avatar appears when doctor speaks
- [ ] Position is visible but not blocking
- [ ] Can be minimized/maximized
- [ ] Text transcript still available
- [ ] Smooth transition when new speech arrives

**Technical Details:**
```tsx
// In CinematicVideoRoom.tsx:

// Add state for avatar
const [doctorSpeechForAvatar, setDoctorSpeechForAvatar] = useState<ASLGloss | null>(null);
const [showAvatar, setShowAvatar] = useState(true);

// When doctor's speech is transcribed:
useEffect(() => {
  const lastDoctorSegment = speakerSegments
    .filter(s => s.speaker === 'doctor')
    .slice(-1)[0];

  if (lastDoctorSegment) {
    const gloss = translateToASL(lastDoctorSegment.text);
    setDoctorSpeechForAvatar(gloss);
  }
}, [speakerSegments]);

// Add avatar to UI:
{showAvatar && doctorSpeechForAvatar && (
  <div className="absolute bottom-4 left-4 w-80">
    <AvatarPlayer
      glossSequence={doctorSpeechForAvatar}
      autoPlay={true}
    />
  </div>
)}
```

**Output:** Updated `CinematicVideoRoom.tsx` with avatar integration

---

### C.3.7 Build fingerspelling animation system
| Field | Value |
|-------|-------|
| **Task Name** | Build fingerspelling animation system for unknown words |
| **Phase** | Build |
| **Estimated Time** | 6 hours |
| **Priority** | 🟡 Medium |
| **Dependencies** | C.3.3 |
| **Assigned To** | Antigravity |
| **Status** | To Do |

**Description:**
When a word isn't in the vocabulary, fingerspell it letter by letter.

**Acceptance Criteria:**
- [ ] All 26 letters animated
- [ ] Smooth transitions between letters
- [ ] Appropriate pacing (not too fast)
- [ ] Works integrated with sign sequence

**Technical Details:**
```typescript
// File: src/lib/fingerspelling.ts

const FINGERSPELL_DURATION = 400; // ms per letter
const TRANSITION_DURATION = 100; // ms between letters

interface FingerspellSequence {
  letters: string[];
  totalDuration: number;
  animations: AnimationQueueItem[];
}

export function createFingerspellSequence(word: string): FingerspellSequence {
  const letters = word.toUpperCase().split('').filter(c => /[A-Z]/.test(c));

  const animations: AnimationQueueItem[] = letters.map((letter, index) => ({
    signId: `fs_${letter}`,
    gloss: letter,
    animationPath: `/animations/fingerspell/${letter}.glb`,
    duration: FINGERSPELL_DURATION,
  }));

  return {
    letters,
    totalDuration: letters.length * (FINGERSPELL_DURATION + TRANSITION_DURATION),
    animations,
  };
}

// In english-to-asl.ts, modify mapToGloss:
function mapToGloss(word: TaggedWord): GlossSign | GlossSign[] {
  const sign = vocabulary.findByEnglish(word.word);

  if (sign) {
    return { gloss: sign.gloss, type: 'sign' };
  }

  // Unknown word: fingerspell it
  const fs = createFingerspellSequence(word.word);
  return fs.letters.map(letter => ({
    gloss: letter,
    type: 'fingerspell',
  }));
}
```

**Output:** `src/lib/fingerspelling.ts`, fingerspelling animations

---

## C.4 Testing Tasks

### C.4.1 Test avatar rendering performance
| Field | Value |
|-------|-------|
| **Task Name** | Test and optimize avatar rendering performance |
| **Phase** | Testing & QA |
| **Estimated Time** | 4 hours |
| **Priority** | 🔴 High |
| **Dependencies** | C.3.3 |
| **Assigned To** | Antigravity |
| **Status** | To Do |

**Description:**
Ensure avatar renders smoothly at 60fps on target devices.

**Acceptance Criteria:**
- [ ] 60fps on desktop Chrome/Firefox/Safari
- [ ] 30fps minimum on mobile
- [ ] No frame drops during animation transitions
- [ ] Memory usage stable over time

---

### C.4.2 Test end-to-end avatar pipeline
| Field | Value |
|-------|-------|
| **Task Name** | Test complete pipeline: Doctor speech → ASL avatar |
| **Phase** | Testing & QA |
| **Estimated Time** | 4 hours |
| **Priority** | 🔴 High |
| **Dependencies** | C.3.6 |
| **Assigned To** | Antigravity |
| **Status** | To Do |

**Description:**
Test the entire flow from doctor speaking to patient seeing avatar.

**Acceptance Criteria:**
- [ ] Latency < 2 seconds total
- [ ] Text correctly converted to ASL
- [ ] Avatar plays correct signs
- [ ] Unknown words fingerspelled
- [ ] No crashes or hangs

---

### C.4.3 User testing with Deaf community members
| Field | Value |
|-------|-------|
| **Task Name** | Conduct user testing sessions with Deaf community members |
| **Phase** | Testing & QA |
| **Estimated Time** | 8 hours |
| **Priority** | 🔴 High |
| **Dependencies** | C.3.6 |
| **Assigned To** | Caleb + Antigravity |
| **Status** | To Do |

**Description:**
Get feedback from actual Deaf users on avatar accuracy and usability.

**Acceptance Criteria:**
- [ ] Test with 3+ Deaf individuals
- [ ] Document comprehension rate
- [ ] Collect qualitative feedback
- [ ] Identify top issues to fix
- [ ] Validate medical signs are accurate

---

### C.4.4 Write unit tests for English-to-ASL translator
| Field | Value |
|-------|-------|
| **Task Name** | Write unit tests for english-to-asl.ts (grammar rules, edge cases) |
| **Phase** | Testing & QA |
| **Estimated Time** | 4 hours |
| **Priority** | 🔴 High |
| **Dependencies** | C.3.1 |
| **Assigned To** | Antigravity |
| **Status** | To Do |

**Description:**
Test the English → ASL grammar conversion WITHOUT needing to know ASL. Tests verify the **rules** work correctly.

**Acceptance Criteria:**
- [ ] Test article removal ("the", "a", "an")
- [ ] Test time-word reordering
- [ ] Test question marker addition
- [ ] Test negation handling
- [ ] Test unknown word → fingerspelling fallback

**Technical Details:**
```typescript
// File: src/lib/__tests__/english-to-asl.test.ts

import { describe, it, expect } from 'vitest';
import { translateToASL } from '../english-to-asl';

describe('translateToASL', () => {
  describe('article removal', () => {
    it('should remove "the"', () => {
      const result = translateToASL('The doctor is here');
      const glosses = result.signs.map(s => s.gloss);
      expect(glosses).not.toContain('THE');
      expect(glosses).toContain('DOCTOR');
    });

    it('should remove "a" and "an"', () => {
      const result = translateToASL('I need a doctor and an appointment');
      const glosses = result.signs.map(s => s.gloss);
      expect(glosses).not.toContain('A');
      expect(glosses).not.toContain('AN');
    });
  });

  describe('time word reordering', () => {
    it('should move "yesterday" to the front', () => {
      const result = translateToASL('I went to the hospital yesterday');
      expect(result.signs[0].gloss).toBe('YESTERDAY');
    });

    it('should move "tomorrow" to the front', () => {
      const result = translateToASL('The appointment is tomorrow');
      expect(result.signs[0].gloss).toBe('TOMORROW');
    });
  });

  describe('question handling', () => {
    it('should add question marker for questions', () => {
      const result = translateToASL('Where does it hurt?');
      const hasQuestionMarker = result.signs.some(
        s => s.facialMarker === 'question'
      );
      expect(hasQuestionMarker).toBe(true);
    });
  });

  describe('negation handling', () => {
    it('should handle "not" with negative marker', () => {
      const result = translateToASL('I do not understand');
      const hasNegativeMarker = result.signs.some(
        s => s.facialMarker === 'negative'
      );
      expect(hasNegativeMarker).toBe(true);
    });
  });

  describe('unknown word fallback', () => {
    it('should fingerspell unknown medical terms', () => {
      const result = translateToASL('I have tachycardia');
      const fingerspelled = result.signs.filter(s => s.type === 'fingerspell');
      expect(fingerspelled.length).toBeGreaterThan(0);
    });
  });

  describe('medical vocabulary', () => {
    it('should recognize common medical terms', () => {
      const result = translateToASL('I have chest pain');
      const glosses = result.signs.map(s => s.gloss);
      expect(glosses).toContain('CHEST');
      expect(glosses).toContain('PAIN');
    });
  });
});
```

**Why this works without knowing ASL:**
We're testing that our **rules** are applied correctly. The rules are based on documented ASL grammar:
- Articles don't exist in ASL → we test they're removed
- Time comes first → we test word order
- Questions need markers → we test markers are added

We're NOT testing if the output is "correct ASL" — that requires Deaf community validation (C.4.6).

**Output:** `src/lib/__tests__/english-to-asl.test.ts`

---

### C.4.5 Write unit tests for animation sequencer
| Field | Value |
|-------|-------|
| **Task Name** | Write unit tests for animation-sequencer.ts (queue, transitions) |
| **Phase** | Testing & QA |
| **Estimated Time** | 3 hours |
| **Priority** | 🟡 Medium |
| **Dependencies** | C.3.4 |
| **Assigned To** | Antigravity |
| **Status** | To Do |

**Description:**
Test the animation queue and playback logic.

**Acceptance Criteria:**
- [ ] Test queue management (add, clear, play order)
- [ ] Test playback controls (play, pause, resume)
- [ ] Test speed adjustments
- [ ] Test callback firing (onSignStart, onComplete)
- [ ] Test transition blending

**Output:** `src/lib/__tests__/animation-sequencer.test.ts`

---

### C.4.6 Hire Deaf consultant to review sign vocabulary
| Field | Value |
|-------|-------|
| **Task Name** | Hire Deaf consultant to review sign vocabulary accuracy |
| **Phase** | Testing & QA |
| **Estimated Time** | 4 hours (coordination) + consultant time |
| **Priority** | 🔴 High |
| **Dependencies** | C.3.2 |
| **Assigned To** | Caleb |
| **Status** | To Do |

**Description:**
We CANNOT validate ASL accuracy ourselves. We need a Deaf ASL expert to review our vocabulary.

**Acceptance Criteria:**
- [ ] Find qualified Deaf ASL consultant (interpreter certification preferred)
- [ ] Review all 100+ signs in vocabulary database
- [ ] Document any incorrect or offensive signs
- [ ] Get recommendations for medical vocabulary gaps
- [ ] Budget: $500-1500 depending on scope

**Where to Find Consultants:**
- Registry of Interpreters for the Deaf (RID): https://rid.org/
- National Association of the Deaf (NAD): https://www.nad.org/
- Gallaudet University consulting: https://www.gallaudet.edu/
- Deaf-owned consulting firms (search "Deaf ASL consulting")
- Local Deaf community centers

**What to Ask Them to Review:**
1. Is each sign accurate for the intended meaning?
2. Are there regional variations we should note?
3. Are any signs outdated or potentially offensive?
4. What medical signs are we missing?
5. Is our avatar's signing understandable?

**Output:** Consultant report documenting accuracy and recommendations

---

## C.5 Code Review Checkpoints

### C.5.1 Phase C Code Review #1: Research Complete
| Field | Value |
|-------|-------|
| **Task Name** | Code Review: Avatar Research and Design Complete |
| **Phase** | Monitoring & Iteration |
| **Estimated Time** | 2 hours |
| **Priority** | 🔴 High |
| **Dependencies** | C.1.1, C.1.2, C.2.1, C.2.2 |
| **Assigned To** | Caleb |
| **Status** | To Do |

**Review Checklist:**
- [ ] Text-to-ASL approach selected and documented
- [ ] Avatar technology selected
- [ ] Architecture designed and approved
- [ ] Database schema defined
- [ ] GO/NO-GO: Proceed with build?

---

### C.5.2 Phase C Code Review #2: Core Build Complete
| Field | Value |
|-------|-------|
| **Task Name** | Code Review: Avatar Core Components Built |
| **Phase** | Monitoring & Iteration |
| **Estimated Time** | 3 hours |
| **Priority** | 🔴 High |
| **Dependencies** | C.3.1 through C.3.5 |
| **Assigned To** | Caleb |
| **Status** | To Do |

**Review Checklist:**
- [ ] English-to-ASL translation working
- [ ] Vocabulary database populated
- [ ] 3D avatar renders correctly
- [ ] Animation sequencer works
- [ ] Player UI functional
- [ ] TypeScript compiles clean

---

### C.5.3 Phase C Code Review #3: Integration Complete
| Field | Value |
|-------|-------|
| **Task Name** | Code Review: Full Avatar Integration |
| **Phase** | Monitoring & Iteration |
| **Estimated Time** | 2 hours |
| **Priority** | 🔴 High |
| **Dependencies** | C.3.6, C.3.7, C.4.1, C.4.2 |
| **Assigned To** | Caleb |
| **Status** | To Do |

**Review Checklist:**
- [ ] Avatar integrated in patient view
- [ ] Fingerspelling working
- [ ] Performance acceptable
- [ ] End-to-end pipeline tested
- [ ] Ready for user testing

---

# TESTING STRATEGY

## The "I Don't Know ASL" Problem

**Challenge:** How do we validate ASL recognition and avatar output if we don't know ASL?

### Solution 1: Use Labeled Datasets for Input Testing

| Dataset | What It Has | How We Use It |
|---------|-------------|---------------|
| **WLASL** | 2000+ signs with English labels | Test ASL → Text accuracy |
| **How2Sign** | Continuous signing with transcripts | Test phrase recognition |
| **ASL-LEX** | Lexical database with videos | Medical vocabulary testing |

**Process:**
1. Download videos from datasets
2. Run through our Gemini Vision pipeline
3. Compare output to known labels
4. Calculate accuracy percentage

This lets us test **input recognition** without knowing ASL.

### Solution 2: Deaf Community Validation for Output

For the **avatar output** (text → ASL), we CANNOT validate ourselves. We need:

| Validation Method | When | Who |
|-------------------|------|-----|
| **Deaf consultant review** | After C.3.2 (vocabulary built) | Hire ASL expert |
| **User testing sessions** | After C.3.6 (avatar integrated) | 3+ Deaf users |
| **ASL accuracy certification** | Before production | Professional interpreter |

**Budget consideration:** Plan for $500-2000 for Deaf community consultation.

### Solution 3: Automated Regression Tests

Even without ASL knowledge, we can test:
- Does the system crash?
- Does it return valid JSON?
- Is latency acceptable?
- Does the avatar render?

---

## Unit Test Coverage

### Required Test Files

| File | Tests | Priority |
|------|-------|----------|
| `use-hand-landmarker.test.ts` | Hand detection state machine | 🔴 High |
| `asl-translation-service.test.ts` | API calls, error handling, confidence scoring | 🔴 High |
| `english-to-asl.test.ts` | Grammar conversion, word order | 🔴 High |
| `animation-sequencer.test.ts` | Queue management, transitions | 🟡 Medium |
| `session-communication.test.ts` | Message passing | 🟡 Medium |

---

# MASTER TASK TABLE

## Complete Task List for Notion Import

| ID | Task Name | Phase | Dev Phase | Priority | Est. Hours | Dependencies | Status |
|----|-----------|-------|-----------|----------|------------|--------------|--------|
| **PHASE A: ASL RECOGNITION VALIDATION** |
| A.1.1 | Research ASL video datasets for testing (WLASL, How2Sign, ASL-LEX) | Research | A | 🔴 High | 3 | - | To Do |
| A.1.2 | Research Gemini Vision API capabilities and limitations for sign language | Research | A | 🔴 High | 2 | - | To Do |
| A.1.3 | Research alternative ASL recognition models (SignGemma, OpenHands, custom) | Research | A | 🟡 Medium | 4 | A.1.2 | To Do |
| A.2.1 | Create ASL test video collection with 20 medical phrases | Testing | A | 🔴 High | 4 | A.1.1 | To Do |
| A.2.2 | Build automated ASL recognition accuracy test script | Testing | A | 🔴 High | 4 | A.2.1 | To Do |
| A.2.3 | Run baseline accuracy test and document results | Testing | A | 🔴 High | 2 | A.2.2 | To Do |
| A.2.4 | Test ASL recognition accuracy with increased frame counts (5, 8, 10, 15) | Testing | A | 🟡 Medium | 3 | A.2.3 | To Do |
| A.2.5 | Test and optimize Gemini Vision prompt for ASL recognition | Testing | A | 🟡 Medium | 4 | A.2.3 | To Do |
| A.3.1 | Improve sign start/end detection in use-hand-landmarker.ts | Build | A | 🔴 High | 6 | A.2.3 | To Do |
| A.3.2 | Add landmark smoothing to reduce jitter in hand tracking | Build | A | 🟡 Medium | 3 | A.3.1 | To Do |
| A.3.3 | Implement smart frame selection for Gemini Vision API calls | Build | A | 🟡 Medium | 4 | A.3.1 | To Do |
| A.3.4 | Implement detailed confidence scoring for ASL translations | Build | A | 🔴 High | 3 | A.2.5 | To Do |
| A.3.5 | Build visual feedback component showing sign capture quality | Build | A | 🟡 Medium | 4 | A.3.4 | To Do |
| A.4.1 | Code Review: Phase A Research Complete | Review | A | 🔴 High | 1 | A.1.* | To Do |
| A.4.2 | Code Review: Phase A Testing Complete | Review | A | 🔴 High | 1 | A.2.* | To Do |
| A.4.3 | Code Review: Phase A Build Complete | Review | A | 🔴 High | 2 | A.3.* | To Do |
| A.5.1 | Write unit tests for use-hand-landmarker.ts (state machine, timing) | Testing | A | 🔴 High | 4 | A.3.1 | To Do |
| A.5.2 | Write unit tests for asl-translation-service.ts (API mocking, errors) | Testing | A | 🔴 High | 3 | A.3.4 | To Do |
| **PHASE B: DOCTOR EXPERIENCE** |
| B.1.1 | Design doctor dashboard layout with ASL input display | Planning | B | 🔴 High | 3 | Phase A | To Do |
| B.2.1 | Build DoctorDashboard component with optimized layout | Build | B | 🔴 High | 6 | B.1.1 | To Do |
| B.2.2 | Implement bidirectional "Ask to Repeat" request system | Build | B | 🔴 High | 4 | B.2.1 | To Do |
| B.2.3 | Add audio notification system for new patient messages | Build | B | 🟡 Medium | 2 | B.2.1 | To Do |
| B.2.4 | Build real-time signing status indicator for doctor view | Build | B | 🟡 Medium | 3 | B.2.2 | To Do |
| B.2.5 | Create interactive onboarding tutorial for doctors | Build | B | 🟡 Medium | 4 | B.2.1 | To Do |
| B.3.1 | Code Review: Doctor Dashboard and Communication Flow | Review | B | 🔴 High | 2 | B.2.* | To Do |
| **PHASE C: TEXT-TO-ASL AVATAR** |
| C.1.1 | Research English to ASL translation approaches and libraries | Research | C | 🔴 High | 6 | Phase B | To Do |
| C.1.2 | Research and evaluate ASL avatar rendering libraries and approaches | Research | C | 🔴 High | 6 | - | To Do |
| C.1.3 | Research sources for ASL motion capture / animation data | Research | C | 🟡 Medium | 4 | C.1.2 | To Do |
| C.2.1 | Design complete avatar system architecture | Planning | C | 🔴 High | 4 | C.1.1, C.1.2 | To Do |
| C.2.2 | Design database schema for sign vocabulary and animations | Planning | C | 🔴 High | 3 | C.2.1 | To Do |
| C.3.1 | Build service to convert English text to ASL gloss sequence | Build | C | 🔴 High | 12 | C.2.1 | To Do |
| C.3.2 | Build sign vocabulary database with 100+ medical signs | Build | C | 🔴 High | 8 | C.2.2, C.1.3 | To Do |
| C.3.3 | Set up 3D avatar rendering environment with React Three Fiber | Build | C | 🔴 High | 8 | C.1.2 | To Do |
| C.3.4 | Build animation sequencer to play sign sequences smoothly | Build | C | 🔴 High | 10 | C.3.3 | To Do |
| C.3.5 | Build avatar player UI with controls for patient view | Build | C | 🔴 High | 6 | C.3.4 | To Do |
| C.3.6 | Integrate avatar player into CinematicVideoRoom patient view | Build | C | 🔴 High | 4 | C.3.5, C.3.1 | To Do |
| C.3.7 | Build fingerspelling animation system for unknown words | Build | C | 🟡 Medium | 6 | C.3.3 | To Do |
| C.4.1 | Test and optimize avatar rendering performance | Testing | C | 🔴 High | 4 | C.3.3 | To Do |
| C.4.2 | Test complete pipeline: Doctor speech → ASL avatar | Testing | C | 🔴 High | 4 | C.3.6 | To Do |
| C.4.3 | Conduct user testing sessions with Deaf community members | Testing | C | 🔴 High | 8 | C.3.6 | To Do |
| C.4.4 | Write unit tests for english-to-asl.ts (grammar rules, edge cases) | Testing | C | 🔴 High | 4 | C.3.1 | To Do |
| C.4.5 | Write unit tests for animation-sequencer.ts (queue, transitions) | Testing | C | 🟡 Medium | 3 | C.3.4 | To Do |
| C.4.6 | Hire Deaf consultant to review sign vocabulary accuracy | Testing | C | 🔴 High | 4 | C.3.2 | To Do |
| C.5.1 | Code Review: Avatar Research and Design Complete | Review | C | 🔴 High | 2 | C.1.*, C.2.* | To Do |
| C.5.2 | Code Review: Avatar Core Components Built | Review | C | 🔴 High | 3 | C.3.1-C.3.5 | To Do |
| C.5.3 | Code Review: Full Avatar Integration | Review | C | 🔴 High | 2 | C.3.6-C.4.2 | To Do |

---

## Summary Statistics

| Phase | Research | Planning | Build | Testing | Review | Total Tasks | Total Hours |
|-------|----------|----------|-------|---------|--------|-------------|-------------|
| **A** | 3 | 0 | 5 | 5 | 3 | 16 | 45 |
| **B** | 0 | 1 | 5 | 0 | 1 | 7 | 24 |
| **C** | 3 | 2 | 7 | 3 | 3 | 18 | 81 |
| **Total** | 6 | 3 | 17 | 8 | 7 | **41** | **150** |

---

# TECHNICAL SPECIFICATIONS

## Environment Setup

```bash
# Required dependencies to add
npm install @react-three/fiber @react-three/drei three
npm install @types/three --save-dev

# For testing
npm install vitest @testing-library/react --save-dev

# For video processing (accuracy tests)
npm install fluent-ffmpeg --save-dev
```

## File Structure After All Phases

```
src/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── session/
│   │   └── page.tsx                # Patient video room
│   ├── doctor/
│   │   └── page.tsx                # Doctor dashboard
│   └── api/
│       ├── livekit-token/
│       └── health/
├── components/
│   ├── CinematicVideoRoom.tsx      # Patient main view
│   ├── DoctorDashboard.tsx         # NEW: Doctor optimized view
│   ├── ASLInput.tsx                # ASL camera input
│   ├── ASLCaptureStatus.tsx        # NEW: Sign capture feedback
│   ├── ASLAvatar.tsx               # NEW: 3D avatar renderer
│   ├── AvatarPlayer.tsx            # NEW: Avatar with controls
│   ├── RepeatRequestModal.tsx      # NEW: "Sign again" prompt
│   ├── DoctorOnboarding.tsx        # NEW: Tutorial overlay
│   ├── MedicalTermsCarousel.tsx
│   ├── DoctorVideoRoom.tsx
│   └── ...
├── hooks/
│   ├── use-gemini-client.ts
│   ├── use-hand-landmarker.ts      # UPDATED: Better detection
│   ├── use-speaker-diarization.ts
│   ├── use-demo-mode.ts
│   └── use-session-timeout.ts
├── lib/
│   ├── asl-translation-service.ts  # UPDATED: Confidence scoring
│   ├── english-to-asl.ts           # NEW: Text → ASL gloss
│   ├── animation-sequencer.ts      # NEW: Sign playback
│   ├── fingerspelling.ts           # NEW: Letter animations
│   ├── session-communication.ts    # NEW: Doctor↔Patient messaging
│   ├── notification-sounds.ts      # NEW: Audio alerts
│   └── demo-transcript.ts
├── data/
│   └── sign-vocabulary.json        # NEW: 100+ signs
├── types/
│   ├── speaker.ts
│   └── sign-vocabulary.ts          # NEW: Sign database types
└── ...

public/
├── models/
│   └── avatar.glb                  # NEW: 3D avatar model
├── animations/
│   ├── signs/                      # NEW: Sign animations
│   └── fingerspell/                # NEW: A-Z animations
└── sounds/
    ├── notification.mp3            # NEW
    └── attention-needed.mp3        # NEW

docs/
├── ASL-DATASETS.md                 # NEW: Research output
├── GEMINI-VISION-ANALYSIS.md       # NEW: API benchmarks
├── ASL-MODEL-OPTIONS.md            # NEW: Model comparison
├── PROMPT-OPTIMIZATION.md          # NEW: Best prompts
├── DOCTOR-DASHBOARD-DESIGN.md      # NEW: Wireframes
├── TEXT-TO-ASL-RESEARCH.md         # NEW: Translation research
├── ASL-AVATAR-RESEARCH.md          # NEW: Avatar options
├── ASL-MOTION-DATA-SOURCES.md      # NEW: Animation data
├── AVATAR-ARCHITECTURE.md          # NEW: System design
└── SIGN-DATABASE-SCHEMA.md         # NEW: Database design

test-data/
├── asl-videos/                     # NEW: Test video clips
├── ground-truth.json               # NEW: Expected translations
├── accuracy-report.json            # NEW: Test results
└── baseline-accuracy-report.md     # NEW: Initial benchmark

scripts/
└── test-asl-accuracy.ts            # NEW: Accuracy testing
```

---

# CODE REVIEW CHECKPOINTS

## Review Schedule

| Checkpoint | After Tasks | Reviewer | Duration | Decision |
|------------|-------------|----------|----------|----------|
| A.4.1 | A.1.* (Research) | Caleb | 1 hr | Continue/Pivot on ASL approach |
| A.4.2 | A.2.* (Testing) | Caleb | 1 hr | GO/NO-GO on Gemini Vision |
| A.4.3 | A.3.* (Build) | Caleb | 2 hrs | Approve Phase A completion |
| B.3.1 | B.2.* (Build) | Caleb | 2 hrs | Approve doctor experience |
| C.5.1 | C.1.*, C.2.* | Caleb | 2 hrs | Approve avatar approach |
| C.5.2 | C.3.1-C.3.5 | Caleb | 3 hrs | Approve core avatar build |
| C.5.3 | C.3.6-C.4.2 | Caleb | 2 hrs | Approve for user testing |

---

# INFRASTRUCTURE REQUIREMENTS

## Database Needs

| Purpose | Current State | Production Need |
|---------|---------------|-----------------|
| Sign vocabulary | JSON file (`sign-vocabulary.json`) | ✅ JSON is fine for MVP |
| User accounts | ❌ None | Supabase Auth (stretch) |
| Session logs | ❌ None | Supabase Postgres (stretch) |
| Analytics | ❌ None | Vercel Analytics (stretch) |

**For Phase A-C: No database required.** The sign vocabulary is a static JSON file.

## Required Assets (Caleb Must Provide or Source)

| Asset | Purpose | Where to Get | Status |
|-------|---------|--------------|--------|
| `avatar.glb` | 3D signing avatar model | ReadyPlayerMe or Mixamo | ❌ Need |
| `/animations/signs/*.glb` | Sign animation files | Motion capture or create | ❌ Need |
| `/animations/fingerspell/*.glb` | A-Z letter animations | Motion capture or create | ❌ Need |
| `/sounds/notification.mp3` | Doctor alert sound | Freesound.org | ❌ Need |
| Test ASL videos | Accuracy testing | WLASL dataset download | ❌ Need |

**CRITICAL:** Without avatar and animation assets, Phase C cannot complete.

### Option A: Use Placeholder Avatar
For overnight coding, create placeholder animations:
```typescript
// Placeholder: just log the sign, no actual animation
console.log(`[AVATAR PLACEHOLDER] Would sign: ${gloss}`);
```

### Option B: Source Assets First
Before starting Phase C:
1. Download ReadyPlayerMe avatar
2. Find/create basic sign animations
3. Or pivot to video-dictionary approach

## Environment Variables Required

```bash
# .env.local (Caleb must verify these exist)
NEXT_PUBLIC_GEMINI_API_KEY=xxx        # Required for ASL recognition
NEXT_PUBLIC_LIVEKIT_URL=xxx           # Required for video
LIVEKIT_API_KEY=xxx                   # Required for video
LIVEKIT_API_SECRET=xxx                # Required for video
```

## NPM Dependencies to Add

```bash
# Required for Phase A-C (run before starting)
npm install vitest @testing-library/react @testing-library/react-hooks --save-dev
npm install @react-three/fiber @react-three/drei three
npm install @types/three --save-dev
```

---

# SELF-HEALING & AUTONOMOUS OPERATION

## Pre-Flight Checklist (Run Before Overnight)

```bash
# 1. Verify dependencies
npm install

# 2. Verify TypeScript compiles
npx tsc --noEmit

# 3. Verify dev server starts
npm run dev &
sleep 10
curl http://localhost:3000 || echo "FAIL: Dev server didn't start"
kill %1

# 4. Verify environment variables
node -e "
  const required = ['NEXT_PUBLIC_GEMINI_API_KEY', 'NEXT_PUBLIC_LIVEKIT_URL'];
  const missing = required.filter(k => !process.env[k]);
  if (missing.length) {
    console.error('MISSING ENV VARS:', missing);
    process.exit(1);
  }
  console.log('All env vars present');
"

# 5. Verify test framework works
npm run test -- --run --reporter=verbose 2>&1 | head -20
```

## Error Recovery Strategies

### If Build Fails
```bash
# Strategy 1: Clear cache and retry
rm -rf .next node_modules/.cache
npm run build

# Strategy 2: Check for TypeScript errors
npx tsc --noEmit 2>&1 | head -50

# Strategy 3: Rollback last change
git diff HEAD~1 --name-only
git checkout HEAD~1 -- <problem-file>
```

### If Tests Fail
```bash
# Run failing test in isolation
npm run test -- --run <test-file> --reporter=verbose

# Check test output for specific error
# Common issues:
# - Mock not set up correctly
# - Async timing issues (add await/act)
# - Import path wrong
```

### If API Calls Fail (Gemini)
```typescript
// Built-in retry logic (add to asl-translation-service.ts)
async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      console.warn(`Retry ${i + 1}/${retries} after error:`, error);
      await new Promise(r => setTimeout(r, delay * (i + 1)));
    }
  }
  throw new Error('Should not reach here');
}
```

### If Dependency Install Fails
```bash
# Clear npm cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# If specific package fails, try alternative
# e.g., if @react-three/fiber fails:
npm install three react-three-fiber  # older package name
```

## Autonomous Operation Rules for Antigravity

1. **Always commit working code** - Don't leave broken state
2. **Run tests after each task** - `npm run test -- --run`
3. **Run TypeScript check after each task** - `npx tsc --noEmit`
4. **If stuck for 30+ minutes, document blocker and move to next task**
5. **Create placeholder implementations if assets missing**
6. **Log decisions in DECISIONS.md**

## Blocking Issues (Stop and Wait for Caleb)

These issues CANNOT be resolved autonomously:
1. ❌ Missing API keys (need Caleb to provide)
2. ❌ Missing avatar/animation assets (need sourcing decision)
3. ❌ Deaf consultant hiring (need Caleb approval)
4. ❌ Budget decisions (need Caleb approval)
5. ❌ Architecture changes that affect other systems

If blocked, create `/docs/BLOCKED.md` with:
- What task is blocked
- What's needed to unblock
- Suggested alternatives

---

# HANDOFF INSTRUCTIONS FOR ANTIGRAVITY

## How to Use This Document

1. **Start with Phase A** - Don't skip ahead. We need to validate ASL recognition works before building more.

2. **Work task by task** - Each task has:
   - Clear acceptance criteria
   - Technical details with code examples
   - Dependencies listed
   - Estimated time

3. **Create output files** - Most tasks specify an output file. Create it.

4. **Stop at code reviews** - When you hit a review checkpoint (A.4.1, A.4.2, etc.), pause and notify Caleb.

5. **Document decisions** - If you make a technical decision, document it in the relevant `/docs/` file.

6. **Test as you go** - Don't wait until the end to test. Each build task should include testing.

## Critical Success Factors

1. **ASL Recognition Accuracy** - If we can't get >70% accuracy, the whole product fails. Phase A is critical.

2. **Latency** - Target <2 seconds for avatar to start signing after doctor speaks.

3. **User Feedback** - We MUST test with actual Deaf users before considering this "done".

## Communication

- Push code frequently (at least daily)
- Create PRs for each major task
- Note any blockers immediately
- Ask questions early, not late

---

**This document is the source of truth. When in doubt, refer here.**

*Created: February 6, 2026*
*For: Antigravity (AI Coding Agent)*
*Owner: Caleb (Rivrr Studio)*

---

# PHASE E: GEMINI 3 HACKATHON EXCLUSIVES

> **Goal:** Leverage Gemini 3's reasoning, multimodal, and long-context capabilities for "Wow" features.
> **Priority:** Hackathon Stretch Goals (High Impact)

## E.1 Smart Synthesis & History (Long Context)
Leverage the 1M+ token context window to process entire patient histories.
- **Task:** Upload full patient history PDF/text.
- **Action:** Allow doctor to ask: "Has the patient complained about this specific left-side pain before?"
- **Gemini Role:** Reasoning across massive context to find patterns.

## E.2 Medical Object Triage (Multimodal Reasoning)
Allow patients to show objects to the camera for identification and context checking.
- **Task:** Vision analysis of pill bottles, wounds, or medical devices.
- **Action:** Compare visual input against medical records (e.g., "Patient is holding Tylenol, but prescribed Ibuprofen").
- **Gemini Role:** Multimodal reasoning (Vision + Text + Medical Context).

