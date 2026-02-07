# Phase C Research: Text-to-ASL Translation

## C.1.1 English-to-ASL Translation Approaches

### ASL Grammar Differences from English

| English | ASL | Rule |
|---------|-----|------|
| "I am going to the store" | STORE I GO | Topic-Comment order |
| "The doctor will see you" | DOCTOR SEE YOU | Drop articles |
| "I went to the hospital yesterday" | YESTERDAY HOSPITAL I GO | Time established first |
| "Is it hurting?" | HURT? (eyebrow raise) | Facial grammar for questions |

### Translation Approaches Evaluated

| Approach | Pros | Cons | Latency | Accuracy | MVP? |
|----------|------|------|---------|----------|------|
| **Rule-based (Recommended)** | Fast, predictable, no API cost | Limited vocabulary | <100ms | 70-80% | ✅ |
| **ML Seq2Seq** | Higher accuracy | Needs training data, slow | 500ms+ | 85-90% | ❌ |
| **Commercial API** | High quality | Cost, dependency | 200-500ms | 90%+ | ❌ |
| **Gemini LLM** | Flexible, good quality | API cost, latency | 1-2s | 85% | ⚠️ |

### Available Tools

| Tool | Type | License | URL |
|------|------|---------|-----|
| **sign-language-translator** | Python lib | Apache 2.0 | github.com |
| **Hand Talk** | Commercial app | Proprietary | handtalk.me |
| **XlatorHub** | Online ASL gloss | Free tier | xlatorhub.com |
| **HIX AI** | ASL gloss API | Commercial | hix.ai |

### Recommended MVP Approach

1. **Use Gemini LLM** for English→ASL gloss conversion
   - Prompt: "Convert to ASL gloss with Topic-Comment order, drop articles"
   - Example: "The doctor will see you now" → "DOCTOR NOW YOU SEE"

2. **Build fallback dictionary** for common medical phrases
   - Pre-mapped translations for reliability
   - e.g., "Does it hurt?" → "PAIN YOU?"

---

## C.1.2 ASL Avatar Rendering Options

### Options Evaluated

| Option | Tech | Latency | Quality | Cost | MVP? |
|--------|------|---------|---------|------|------|
| **Three.js + ReadyPlayerMe** | WebGL | Fast | High | Free | ✅ |
| **Pre-recorded video clips** | Video | Instant | Very High | High production | ⚠️ |
| **Hand Talk SDK** | Proprietary | 200ms | High | $$$ | ❌ |
| **Neural synthesis** | ML | 2-5s | Variable | Compute cost | ❌ |

### Recommended: Three.js + React Three Fiber

**Architecture:**
```
Doctor Text → Gemini (gloss) → Sign Lookup → Animation Queue → Avatar Render
```

**Components:**
- **ReadyPlayerMe**: Free customizable 3D avatar (GLB format)
- **Mixamo**: Free animations (can import custom ASL)
- **Three.js/R3F**: WebGL rendering in React
- **AnimationMixer**: Sequence sign animations

**Workflow:**
1. Create avatar in ReadyPlayerMe → export .glb
2. Import to Blender → add hand bones if needed
3. Create ASL animations in Blender (or use motion capture)
4. Export to .glb with animations
5. Load in React Three Fiber, control with AnimationMixer

---

## C.1.3 ASL Motion Capture & Datasets

### Available Datasets

| Dataset | Content | License | Access |
|---------|---------|---------|--------|
| **ASL3DWord** (SignAvatar) | 3D joint rotations, body/hands/face | Research | Open |
| **SignAvatars** | 3D meshes + poses, 2D/3D keypoints | Research | Open |
| **WLASL** | 2000 word videos | C-UDA | Open |

### Research Projects

| Project | Capability | Code Available |
|---------|------------|---------------|
| **SignAvatar** | 3D motion reconstruction | ✅ GitHub |
| **GenASL** (Amazon) | Speech→ASL avatar | Partial |
| **SignPose** | 2D→3D pose conversion | Planned |

---

## MVP Recommendation

### Phase 1: Minimal Avatar (1-2 weeks)
1. Use Gemini to convert doctor text → ASL gloss
2. Map gloss words to pre-recorded video clips (20-30 common medical words)
3. Play video sequence in UI

### Phase 2: 3D Avatar (2-3 weeks)
1. Create ReadyPlayerMe avatar
2. Create 50 key sign animations in Blender
3. Build React Three Fiber player component
4. Animate sequences with smooth transitions

### Critical Path
1. ⚠️ **Sign animations are the bottleneck** - need to create or acquire
2. Consider partnering with Deaf community for authentic animations
3. Start with fingerspelling fallback for unknown words

---

## Next Steps

- [ ] C.2.1 Design avatar component architecture
- [ ] C.2.2 Design sign vocabulary schema
- [ ] C.3.1 Build Gemini English→Gloss service
