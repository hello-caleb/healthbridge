# ASL Test Video Collection

Test videos and ground truth labels for validating the ASL recognition pipeline.

## Contents

- `ground-truth.json` - Test manifest with 20 medical ASL signs
- `*.mp4` - Video clips of each sign (see Download Instructions)

## Signs Included (20 Total)

### High Priority (14 signs)
| Sign | Category | Notes |
|------|----------|-------|
| pain | symptom | Core medical sign |
| help | request | Emergency/request |
| sick | condition | General condition |
| doctor | role | Role identification |
| medicine | treatment | Treatment-related |
| heart | body_part | Cardiac reference |
| chest | body_part | Location indicator |
| head | body_part | Location indicator |
| stomach | body_part | Location indicator |
| yes | response | Confirmation |
| no | response | Negation |
| emergency | urgency | Critical situations |
| allergic | condition | Allergy disclosure |
| breathe | symptom | Respiratory |

### Medium Priority (6 signs)
| Sign | Category |
|------|----------|
| dizzy | symptom |
| more | modifier |
| nausea | symptom |
| tired | symptom |
| when | question |
| where | question |

## Download Instructions

### Option 1: WLASL Dataset (Recommended)

```bash
# Clone WLASL repository
git clone https://github.com/dxli94/WLASL.git /tmp/wlasl

# Copy relevant videos (requires WLASL dataset download)
# See WLASL README for download instructions
```

### Option 2: Record Custom Videos

Use the `scripts/record-test-sign.ts` script to record your own test videos:

```bash
npm run record-test-sign -- --sign pain
```

### Option 3: Manual Collection

1. Visit https://asl-lex.org/visualization/
2. Search for each sign
3. Download reference video
4. Save as `{sign}_01.mp4` in this folder

## File Naming Convention

```
{sign}_{variant}.mp4
```

Examples:
- `pain_01.mp4` - First variant of "pain" sign
- `pain_02.mp4` - Second variant (different signer)
- `help_01.mp4` - First variant of "help" sign

## Ground Truth Format

```json
{
  "id": "sign_001",
  "sign": "pain",
  "expected_translation": "pain",
  "alternate_translations": ["hurt", "ache"],
  "video_file": "pain_01.mp4"
}
```

## Usage

Run accuracy tests:

```bash
npm run test:asl-accuracy
```

Or programmatically:

```typescript
import groundTruth from './test-data/asl-videos/ground-truth.json';

for (const sign of groundTruth.signs) {
  const result = await translateASL(sign.video_file);
  const isMatch = sign.alternate_translations.includes(result);
}
```

## Accuracy Thresholds

| Level | Score | Notes |
|-------|-------|-------|
| Minimum | 60% | Below this is unacceptable |
| Target | 80% | Goal for MVP |
| Excellent | 90%+ | Production-ready |

## License Compliance

⚠️ Videos from WLASL/How2Sign are for **research use only**.

- Do not redistribute
- Do not use commercially
- Cite sources if publishing results
