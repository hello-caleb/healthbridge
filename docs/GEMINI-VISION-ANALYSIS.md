# Gemini Vision API Analysis for ASL Recognition

> **Created:** February 6, 2026  
> **Task:** A.1.2 - Research Gemini Vision API capabilities for sign language  
> **Purpose:** Document API capabilities, limitations, and benchmarks for ASL translation

---

## API Summary

| Model | Best For | Input Cost | RPM (Free) | Max Request Size |
|-------|----------|------------|------------|------------------|
| **Gemini 2.5 Flash** | Fast ASL, cost-effective | $0.15/M tokens | 5-15 | 20MB |
| **Gemini 2.5 Pro** | High accuracy | $1.25/M tokens | 5 | 20MB |
| **Gemini 2.0 Flash** | Current implementation | $0.15/M tokens | 15 | 20MB |

---

## Current Implementation

**File:** `src/lib/asl-translation-service.ts`

| Setting | Value | Notes |
|---------|-------|-------|
| Model | `gemini-2.0-flash` | Good balance of speed/accuracy |
| Max Frames | 5 | Evenly distributed key frames |
| Image Format | JPEG base64 | Inline data |
| Response Format | Text (parsed) | Expects word/phrase |

---

## Rate Limits & Pricing (2025/2026)

### Free Tier

| Model | Requests/Min | Requests/Day | Tokens/Min |
|-------|--------------|--------------|------------|
| Gemini 2.5 Flash | 15 | 1,500 | 1,000,000 |
| Gemini 2.5 Pro | 5 | 100 | 250,000 |
| Gemini 2.0 Flash | 15 | 1,000 | 1,000,000 |

### Paid Tier Pricing

| Model | Input (per 1M tokens) | Output (per 1M tokens) |
|-------|----------------------|------------------------|
| Gemini 2.5 Flash | $0.15 | $0.60 |
| Gemini 2.5 Pro | $1.25 (≤200K), $2.50 (>200K) | $10.00 |
| Gemini 2.0 Flash | ~$0.15 | ~$0.60 |

### Cost Estimate per ASL Translation

- **5 JPEG frames** (~50KB each) = ~250KB = ~250K tokens input
- **Cost per call**: ~$0.04 (Flash) to ~$0.31 (Pro)
- **At 100 translations/day**: ~$4 (Flash) to ~$31 (Pro)

---

## Request Limits

### Maximum Images per Request

| Constraint | Limit |
|------------|-------|
| Total request size | **20MB** |
| Inline image data | 20MB combined |
| Recommended for large files | Use File API instead |

### Practical Frame Limits

| Frame Size | Max Frames (at 20MB) | Recommended |
|------------|---------------------|-------------|
| 100KB JPEG | ~200 frames | 5-15 frames |
| 500KB JPEG | ~40 frames | 5-10 frames |
| 1MB JPEG | ~20 frames | 5-8 frames |

**Recommendation:** Use 5-10 frames at <100KB each for optimal balance.

---

## Response Time Benchmarks

| Model | Typical Response | Notes |
|-------|-----------------|-------|
| Gemini 2.0 Flash | 500-1500ms | Good for real-time |
| Gemini 2.5 Flash | 300-1000ms | Faster |
| Gemini 2.5 Pro | 1000-3000ms | More accurate but slower |

**For real-time ASL:** Use Flash models to stay under 1 second response.

---

## ASL-Specific Training

### Does Gemini Have ASL-Specific Training?

**No confirmed ASL-specific training.** Gemini Vision is a general multimodal model.

| Capability | Available | Notes |
|------------|-----------|-------|
| Hand detection | ✅ Yes | Can identify hands in images |
| Gesture recognition | ⚠️ Limited | General gestures, not ASL-specific |
| ASL vocabulary | ❌ No | No built-in ASL dictionary |
| Fingerspelling | ⚠️ Limited | May struggle with ASL alphabet |
| Continuous signing | ❌ Poor | Designed for discrete queries |

### Alternative: SignGemma

Google has research on **SignGemma**, a sign language-specific model, but:
- Not publicly available as of Feb 2026
- May require special access
- Worth monitoring: https://ai.google/discover/signgemma/

---

## Model Comparison for ASL

### Gemini 2.5 Flash vs Gemini 2.5 Pro

| Factor | 2.5 Flash | 2.5 Pro | Winner for ASL |
|--------|-----------|---------|----------------|
| Speed | 300-1000ms | 1000-3000ms | Flash |
| Cost | $0.15/M tokens | $1.25/M tokens | Flash |
| Accuracy | Good | Better | Pro |
| Real-time viable | ✅ Yes | ⚠️ Borderline | Flash |

### Recommendation

**Use Gemini 2.5 Flash for ASL recognition:**
- Fast enough for near-real-time (<1s)
- Cost-effective for frequent calls
- Accuracy difference may be minimal for ASL

**Consider Gemini 2.5 Pro for:**
- Critical medical translations
- When user requests "repeat with more precision"
- Batch processing (non-real-time)

---

## Optimal Configuration for HealthBridge

### Recommended Settings

```typescript
// asl-translation-service.ts configuration
const config = {
  model: 'gemini-2.5-flash', // Upgrade from 2.0
  maxFrames: 8,              // Increase from 5 for better accuracy
  imageQuality: 0.7,         // JPEG quality (reduces size)
  maxImageSize: 100 * 1024,  // 100KB per frame max
  timeout: 2000,             // 2s timeout
};
```

### Frame Selection Strategy

1. **Start frame** - First detection of hand movement
2. **Peak frames** - Highest velocity moments (mid-sign)
3. **End frame** - Sign completion / hands at rest
4. **Even distribution** - Fill remaining slots evenly

---

## Testing Recommendations

### A/B Test These Configurations

| Test | Model | Frames | Expected |
|------|-------|--------|----------|
| Baseline | gemini-2.0-flash | 5 | Current accuracy |
| Test A | gemini-2.5-flash | 5 | Faster? |
| Test B | gemini-2.5-flash | 8 | More accurate? |
| Test C | gemini-2.5-flash | 10 | Further improvement? |
| Test D | gemini-2.5-pro | 5 | Best accuracy? |

### Prompt Variations to Test

See Task A.2.5 for detailed prompt testing plan.

---

## Limitations & Mitigations

| Limitation | Mitigation |
|------------|------------|
| No ASL training | Use detailed prompts with medical vocabulary hints |
| May miss nuance | Add "confidence" field, allow "ask to repeat" |
| Rate limits | Implement request queuing and caching |
| Cost at scale | Consider caching common signs, batch processing |
| Continuous signing | Process as discrete segments |

---

## Action Items

- [ ] Upgrade `asl-translation-service.ts` to use `gemini-2.5-flash`
- [ ] Increase frame count from 5 to 8
- [ ] Add configurable model selection for accuracy modes
- [ ] Implement response time logging for benchmarks
- [ ] Create prompt variations for A.2.5 testing

---

## References

- [Gemini API Pricing](https://ai.google.dev/pricing)
- [Gemini Vision Documentation](https://ai.google.dev/gemini-api/docs/vision)
- [Rate Limits](https://ai.google.dev/gemini-api/docs/rate-limits)
