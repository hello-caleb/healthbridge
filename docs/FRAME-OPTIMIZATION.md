# Frame Count Optimization

> **Task:** A.2.4 - Test frame counts (5, 8, 10, 15)  
> **Status:** Configuration implemented, pending video tests

---

## Configuration Added

Updated `src/lib/asl-translation-service.ts` with:

### ASLConfig Interface

```typescript
interface ASLConfig {
    maxFrames: 5 | 8 | 10 | 15;
    model: 'gemini-2.0-flash' | 'gemini-2.5-flash' | 'gemini-2.5-pro';
    imageQuality: number;
    verbose: boolean;
}
```

### Pre-defined Configurations

| Config | Frames | Model | Use Case |
|--------|--------|-------|----------|
| `FAST_ASL_CONFIG` | 5 | gemini-2.0-flash | Real-time feedback |
| `DEFAULT_ASL_CONFIG` | 8 | gemini-2.0-flash | Balanced (new default) |
| `ACCURACY_ASL_CONFIG` | 15 | gemini-2.5-flash | Maximum accuracy |

---

## Expected Results (To Be Validated)

| Frames | Expected Accuracy | Expected Latency | Notes |
|--------|------------------|------------------|-------|
| 5 | 40-55% | 500-800ms | May miss motion details |
| 8 | 50-65% | 700-1100ms | Better sign capture |
| 10 | 55-70% | 900-1300ms | Good balance |
| 15 | 60-75% | 1200-1800ms | Best coverage |

---

## Usage

### Runtime Configuration

```typescript
import { setASLConfig, translateASLFrames } from '@/lib/asl-translation-service';

// Change default config
setASLConfig({ maxFrames: 10 });

// Or override per-call
const result = await translateASLFrames(frames, { maxFrames: 15 });
```

### A/B Testing

```typescript
// Test different configs
const results5 = await translateASLFrames(frames, { maxFrames: 5 });
const results8 = await translateASLFrames(frames, { maxFrames: 8 });
const results10 = await translateASLFrames(frames, { maxFrames: 10 });
const results15 = await translateASLFrames(frames, { maxFrames: 15 });

// Compare accuracy and latency
console.log('5 frames:', results5.latencyMs, 'ms');
console.log('8 frames:', results8.latencyMs, 'ms');
console.log('10 frames:', results10.latencyMs, 'ms');
console.log('15 frames:', results15.latencyMs, 'ms');
```

---

## Changes Made

1. **Default frames**: Increased from 5 → 8
2. **Latency tracking**: Added `latencyMs` to results
3. **Frame tracking**: Added `framesUsed` to results
4. **Model tracking**: Added `modelUsed` to results
5. **Verbose mode**: Optional detailed logging
6. **Runtime config**: `setASLConfig()` and `getASLConfig()`

---

## Next Steps

1. Download WLASL test videos
2. Run accuracy tests with each frame count
3. Document actual results in this file
4. Update default based on findings
