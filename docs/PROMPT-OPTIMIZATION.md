# Prompt Optimization for ASL Translation

> **Task:** A.2.5 - Optimize prompts for Gemini Vision ASL recognition  
> **Status:** Prompt variations created, pending A/B testing

---

## Current Prompt (Baseline)

```
You are an ASL (American Sign Language) interpreter assistant for a healthcare communication app.

Your task is to analyze video frames showing a person signing in ASL and translate their signs to English.

IMPORTANT GUIDELINES:
1. Focus on identifying the ASL sign being made based on hand positions, shapes, and movements
2. If you can identify the sign, respond with JUST the English word or short phrase
3. If you cannot identify the sign clearly, respond with "[unclear]"
4. Never make up or guess medical diagnoses - only translate what is signed
5. Common healthcare-related ASL signs include: pain, hurt, help, medicine, doctor, hospital, sick, better, worse, head, stomach, heart, breathing, dizzy, tired

RESPONSE FORMAT:
- Single word or short phrase only
- No explanations or caveats
- Example responses: "pain", "my head hurts", "I need help", "[unclear]"
```

---

## Prompt Variations to Test

### V1: Minimal (Speed Focus)

```typescript
const PROMPT_V1_MINIMAL = `Identify the ASL sign in these frames. Respond with only the English word. If unclear, say "[unclear]".`;
```

**Hypothesis:** Shorter prompt = faster response, but may lose context.

---

### V2: Medical Vocabulary Emphasis

```typescript
const PROMPT_V2_MEDICAL = `You are an ASL interpreter in a medical setting.

Analyze these video frames of someone signing in ASL. The patient is likely communicating about:
- Pain/symptoms: pain, hurt, ache, sick, dizzy, nausea, tired
- Body parts: head, chest, stomach, heart, back, arm, leg
- Requests: help, doctor, medicine, emergency
- Responses: yes, no, more, when, where

Respond with ONLY the English translation. Single word or short phrase.
If you cannot identify the sign, respond with "[unclear]".`;
```

**Hypothesis:** Medical vocabulary hints improve medical sign recognition.

---

### V3: Visual Description Focus

```typescript
const PROMPT_V3_VISUAL = `Describe what you see in these ASL signing frames:
1. Hand shape (flat, fist, pointing, spread fingers, etc.)
2. Hand position relative to body (head, chest, stomach, neutral)
3. Motion direction (up, down, circular, tapping)

Then provide the most likely ASL word/phrase based on these observations.
Format: [description] --> [translation]
If uncertain, respond: [description] --> [unclear]`;
```

**Hypothesis:** Forcing visual analysis may improve accuracy.

---

### V4: Two-Stage Analysis

```typescript
const PROMPT_V4_TWOSTAGE = `STEP 1: Describe the hand movements you observe:
- Starting position
- Motion/movement
- Ending position
- Facial expression (if visible)

STEP 2: Based on your observations, what ASL sign is being made?

Respond in this format:
OBSERVATION: [your observations]
TRANSLATION: [single word or phrase, or "[unclear]"]`;
```

**Hypothesis:** Chain-of-thought may improve reasoning.

---

### V5: Confidence-Weighted

```typescript
const PROMPT_V5_CONFIDENCE = `Analyze these ASL signing frames and provide:
1. Your translation (single word or phrase)
2. Confidence level (1-5, where 5 is certain)

Format: TRANSLATION | CONFIDENCE
Examples: "pain | 4", "help | 5", "[unclear] | 1"

Only translate what you clearly see. Never guess.`;
```

**Hypothesis:** Explicit confidence may reduce false positives.

---

### V6: Few-Shot Examples

```typescript
const PROMPT_V6_FEWSHOT = `Translate the ASL sign shown in these frames.

Examples:
- Hand tapping forehead twice → "headache"
- Fist on chest, circular motion → "sorry"
- Flat hand rubbing stomach → "stomach"
- Index finger pointing at palm → "pain"

Now analyze the provided frames and respond with just the English word or phrase.
If the sign is unclear, respond with "[unclear]".`;
```

**Hypothesis:** Few-shot examples may prime better recognition.

---

## Implementation

### Prompt Configurations

```typescript
// src/lib/asl-prompts.ts

export const ASL_PROMPTS = {
  baseline: ASL_SYSTEM_PROMPT,
  minimal: PROMPT_V1_MINIMAL,
  medical: PROMPT_V2_MEDICAL,
  visual: PROMPT_V3_VISUAL,
  twostage: PROMPT_V4_TWOSTAGE,
  confidence: PROMPT_V5_CONFIDENCE,
  fewshot: PROMPT_V6_FEWSHOT,
} as const;

export type PromptVariant = keyof typeof ASL_PROMPTS;
```

### Usage

```typescript
import { ASL_PROMPTS, PromptVariant } from '@/lib/asl-prompts';

// In asl-translation-service.ts
export interface ASLConfig {
  // ... existing config
  promptVariant?: PromptVariant;
}
```

---

## Expected Results

| Variant | Expected Accuracy | Expected Latency | Pros | Cons |
|---------|------------------|------------------|------|------|
| baseline | 50-60% | ~800ms | Balanced | Generic |
| minimal | 40-50% | ~500ms | Fast | Less context |
| medical | 55-70% | ~900ms | Medical focus | May miss non-medical |
| visual | 50-65% | ~1200ms | Detailed | Slower, verbose |
| twostage | 55-70% | ~1500ms | Better reasoning | Much slower |
| confidence | 50-65% | ~900ms | Quality filter | Extra parsing |
| fewshot | 60-75% | ~1000ms | Primed examples | May bias towards examples |

---

## Testing Protocol

1. Run each prompt variant against 20 test signs
2. Measure: accuracy, latency, false positive rate
3. Score using `ground-truth.json` criteria
4. Select best-performing prompt for production

---

## Next Steps

1. Implement prompt selector in `asl-translation-service.ts`
2. Add prompt variant to `ASLConfig`
3. Run A/B tests when videos are available
4. Document actual results
5. Update default prompt based on findings
