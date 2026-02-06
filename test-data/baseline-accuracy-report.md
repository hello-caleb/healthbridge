# Baseline Accuracy Report

> **Created:** February 6, 2026  
> **Task:** A.2.3 - Run baseline accuracy tests  
> **Status:** PENDING VIDEO DOWNLOAD

---

## Current Status

⚠️ **Baseline testing requires video files to be downloaded.**

The test infrastructure is ready. To run baseline tests:

1. Download WLASL videos (see `/test-data/asl-videos/README.md`)
2. Place videos in `/test-data/asl-videos/`
3. Run: `npm run test:asl-accuracy`

---

## Expected Baseline Performance

Based on Gemini Vision API research, expected baseline accuracy with current implementation:

| Metric | Expected | Reasoning |
|--------|----------|-----------|
| **Overall Accuracy** | 40-60% | General vision model, no ASL training |
| **High-Priority Signs** | 50-70% | Common signs may be recognizable |
| **Response Time** | 500-1500ms | Gemini 2.0 Flash typical latency |

---

## Current Configuration

| Setting | Value |
|---------|-------|
| Model | `gemini-2.0-flash` |
| Max Frames | 5 |
| Image Format | JPEG base64 |
| Frame Selection | Evenly distributed |

---

## Test Readiness Checklist

- [x] Ground truth labels created (20 signs)
- [x] Test script implemented
- [x] Scoring algorithm defined
- [ ] WLASL videos downloaded
- [ ] Baseline test executed
- [ ] Results documented

---

## Next Steps After Video Download

1. Run `npm run test:asl-accuracy`
2. Document actual accuracy in this file
3. Based on results:
   - **>70%:** Proceed to optimization (A.2.4, A.2.5)
   - **50-70%:** Try more frames, better prompts
   - **<50%:** Consider SignGemma or OpenHands pivot

---

## Placeholder Results

*(To be updated after running tests)*

```
🤟 ASL Accuracy Test Suite
==========================

Running 20 tests...

📊 Test Results
===============

Total Tests: 20
Passed: TBD
Failed: TBD
Missing Videos: 20

Accuracy: TBD%
Status: PENDING
Average Latency: TBD ms
```

---

## Manual Test Results (If Available)

If manual testing was performed before video download:

| Sign | Result | Notes |
|------|--------|-------|
| (test pending) | - | - |

---

## Files Created

- `/test-data/asl-videos/ground-truth.json` - 20 test cases
- `/scripts/test-asl-accuracy.ts` - Test runner
- `package.json` - Added `test:asl-accuracy` script
