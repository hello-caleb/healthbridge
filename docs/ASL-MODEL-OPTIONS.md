# ASL Recognition Model Options

> **Created:** February 6, 2026  
> **Task:** A.1.3 - Research alternative ASL recognition models  
> **Purpose:** Evaluate alternatives to Gemini Vision if accuracy is insufficient

---

## Model Comparison Matrix

| Model | Availability | ASL-Specific | Accuracy | Integration Effort | Cost |
|-------|--------------|--------------|----------|-------------------|------|
| **Gemini Vision** | ✅ Available | ❌ No | Medium | ✅ Implemented | $0.15/M tokens |
| **SignGemma** | ⚠️ Preview | ✅ Yes | High | 🟡 Medium | TBD |
| **OpenHands** | ✅ Open Source | ✅ Yes | Medium-High | 🔴 High | Free |
| **MediaPipe + Custom** | ✅ Available | ❌ No (trainable) | Variable | 🔴 High | Free |

---

## 1. SignGemma (Google)

**Status:** Preview available (May 2025), full release Q4 2025

### Overview
Google's on-device AI model specifically designed for real-time sign language translation.

### Key Features
- Optimized for American Sign Language (ASL)
- On-device processing (no internet required)
- Translates to text or synthesized speech
- Vision transformer for hand shapes, facial expressions, motion
- Minimal latency

### Availability
- **Preview Access**: API keys available on request
- **Developer Portal**: developers.google.com/signgemma
- **Access Program**: Via DeepMind portal
- **Full Release**: Expected Q4 2025

### Pros
| Pro | Impact |
|-----|--------|
| ASL-specific training | High accuracy |
| On-device processing | Privacy, speed |
| Google-backed | Long-term support |
| API access available | Easy integration |

### Cons
| Con | Impact |
|-----|--------|
| Preview only (Feb 2026) | May have bugs |
| Limited documentation | Integration challenges |
| ASL-focused | May not generalize |

### Integration Effort: Medium (1-2 weeks)
- Request API access
- Replace Gemini Vision calls with SignGemma
- Update frame processing pipeline
- Test and validate

### Recommendation
**🟢 RECOMMEND: Apply for SignGemma preview access immediately.**

---

## 2. OpenHands

**Status:** ✅ Open Source (2022)

### Overview
Open-source library for word-level sign language recognition across multiple languages. Uses pose-based recognition.

**GitHub:** Search "OpenHands sign language" on GitHub

### Key Features
- Supports ASL, Argentinian, Chinese, Greek, Indian, Turkish SL
- Pose-based recognition (uses skeletal data)
- Self-supervised pretraining
- Cross-lingual transfer capabilities
- Pre-trained checkpoints available

### Architecture
```
Video → Pose Extraction → Pose Model → Sign Recognition
        (MediaPipe)       (OpenHands)   (Word output)
```

### Pros
| Pro | Impact |
|-----|--------|
| Open source | Free, modifiable |
| Multi-language | Extensible |
| Pose-based | Efficient |
| Research-backed | Validated methods |

### Cons
| Con | Impact |
|-----|--------|
| Requires setup | Complex integration |
| Pose-based only | May miss facial expressions |
| 2022 release | May need updates |
| Word-level only | No phrases |

### Integration Effort: High (2-4 weeks)
- Set up Python environment
- Integrate with Next.js (possibly via API)
- Convert MediaPipe output to OpenHands format
- Deploy model inference

### Recommendation
**🟡 CONSIDER: Good fallback if SignGemma/Gemini fail.**

---

## 3. MediaPipe + Custom Model

**Status:** ✅ Available (already integrated)

### Current State
We already use MediaPipe HandLandmarker for hand detection. Could train a custom classifier on top.

### Architecture
```
Video → MediaPipe → Landmarks → Custom ML Model → Sign
                    (21 points)  (TensorFlow.js)    (Word)
```

### Approach Options

#### A. TensorFlow.js Classifier
- Train on landmark sequences
- Client-side inference
- Requires labeled training data

#### B. Landmark Heuristics
- Rule-based sign detection
- Match against known sign patterns
- Fast but limited vocabulary

### Pros
| Pro | Impact |
|-----|--------|
| Already integrated | Minimal new code |
| Client-side | Fast, private |
| Full control | Customizable |

### Cons
| Con | Impact |
|-----|--------|
| Requires training data | High effort |
| Limited by landmarks | May miss nuances |
| Custom development | Time-intensive |
| No phrase support | Word-level only |

### Integration Effort: High (3-6 weeks)
- Collect and label training data
- Train TensorFlow.js model
- Integrate with existing pipeline
- Iterate on accuracy

### Recommendation
**🔴 NOT RECOMMENDED for hackathon timeline.**

---

## 4. Hybrid Approach (Recommended)

### Strategy
Use multiple models in a tiered system:

```
                     ┌─────────────┐
                     │   Patient   │
                     │   Signs     │
                     └──────┬──────┘
                            │
                     ┌──────▼──────┐
                     │  MediaPipe  │
                     │  Detection  │
                     └──────┬──────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
       ┌──────▼──────┐ ┌────▼────┐ ┌──────▼──────┐
       │ SignGemma   │ │ Gemini  │ │ Local Dict  │
       │ (Primary)   │ │ (Backup)│ │ (Common)    │
       └──────┬──────┘ └────┬────┘ └──────┬──────┘
              │             │             │
              └─────────────┼─────────────┘
                            │
                     ┌──────▼──────┐
                     │  Confidence │
                     │   Scoring   │
                     └──────┬──────┘
                            │
                     ┌──────▼──────┐
                     │   Doctor    │
                     │   Display   │
                     └─────────────┘
```

### Tier 1: Local Dictionary (Fastest)
- Pre-defined common medical signs
- Pattern matching on landmarks
- Instant response

### Tier 2: SignGemma (Primary)
- ASL-specific model
- High accuracy
- On-device processing

### Tier 3: Gemini Vision (Fallback)
- Current implementation
- When SignGemma unavailable/uncertain
- Cloud-based

---

## Action Items

1. **Immediate: Apply for SignGemma access**
   - Visit developers.google.com/signgemma
   - Request API key for healthcare accessibility research

2. **Short-term: Continue with Gemini Vision**
   - Optimize current implementation (A.2.x tasks)
   - Measure baseline accuracy

3. **Medium-term: Integrate SignGemma**
   - When access granted, add as primary model
   - Keep Gemini Vision as fallback

4. **Stretch: Explore OpenHands**
   - If both SignGemma and Gemini fail to meet accuracy targets
   - Lower priority given timeline

---

## Summary Recommendation

| Priority | Model | Action |
|----------|-------|--------|
| 🔴 Now | Gemini Vision | Continue development, measure accuracy |
| 🟠 ASAP | SignGemma | Apply for preview access today |
| 🟡 If needed | OpenHands | Evaluate if accuracy <70% |
| 🟢 Future | Custom | Post-hackathon optimization |

**Bottom Line:** Apply for SignGemma access immediately. Continue with Gemini Vision while waiting. SignGemma is the most promising option for production-quality ASL recognition.
