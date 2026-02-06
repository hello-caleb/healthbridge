# ASL Video Datasets for Testing

> **Created:** February 6, 2026  
> **Task:** A.1.1 - Research ASL video datasets for testing  
> **Purpose:** Identify datasets to validate ASL → Text recognition pipeline

---

## Dataset Summary

| Dataset | Size | Type | License | Best For |
|---------|------|------|---------|----------|
| **WLASL** | 2,000+ signs | Word-level | C-UDA (non-commercial) | Single sign testing |
| **How2Sign** | 80+ hours | Continuous | CC BY-NC 4.0 | Phrase/sentence testing |
| **ASL-LEX** | 2,700+ signs | Lexical database | CC BY-NC 4.0 | Sign reference/lookup |
| **SignBank** | Community-contributed | Variable | Mixed | Additional examples |

---

## 1. WLASL (Word-Level ASL)

**URL:** https://dxli94.github.io/WLASL/  
**GitHub:** https://github.com/dxli94/WLASL

### Overview
WLASL is the **largest** video dataset for Word-Level American Sign Language recognition, featuring 2,000+ common words in ASL. Released at WACV 2020 and received Best Paper Honorable Mention.

### Contents
- 2,000+ distinct ASL signs
- Multiple video examples per sign
- Pre-trained I3D and Pose-TGCN models available
- Training code released

### License
**Computational Use of Data Agreement (C-UDA)**
- ✅ Academic and computational use
- ❌ No commercial usage
- ⚠️ Must cite paper if used

### Medical Signs Available
Based on WLASL word list, the following medical-relevant signs are likely available:
- pain, hurt, sick, help
- doctor, nurse, medicine
- heart, head, stomach
- yes, no, more, less

### Download
Clone repository and follow README instructions.

### Citation
```bibtex
@inproceedings{li2020word,
  title={Word-level Deep Sign Language Recognition from Video: A New Large-scale Dataset and Methods Comparison},
  author={Li, Dongxu and Rodriguez, Cristian and Yu, Xin and Li, Hongdong},
  booktitle={WACV},
  pages={1459--1469},
  year={2020}
}
```

---

## 2. How2Sign

**URL:** https://how2sign.github.io/  
**GitHub:** https://github.com/how2sign/how2sign.github.io

### Overview
First large-scale **multimodal and multiview continuous** American Sign Language dataset. Contains 80+ hours of sign language videos with parallel modalities.

### Contents
- 80+ hours of ASL video
- Multiview recordings (multiple camera angles)
- Depth data
- 2D & 3D skeletons
- Gloss annotation
- English translation

### Modalities
| Modality | Train | Val | Test |
|----------|-------|-----|------|
| Green Screen RGB | 290G | 16G | 23G |
| 2D Keypoints | 31G | 1.7G | 2.2G |
| 3D Keypoints | 22G | 1.2G | 1.6G |
| Annotations | 5.6M | 311K | 423K |

### License
**Creative Commons Attribution-NonCommercial 4.0 (CC BY-NC 4.0)**
- ✅ Research use with attribution
- ❌ No commercial use
- ⚠️ May have unintended biases (see paper)

### Medical Relevance
Continuous signing is more realistic for medical consultations where patients communicate in full sentences, not isolated signs.

### Download
Use provided download script or Google Drive links.

---

## 3. ASL-LEX

**URL:** https://asl-lex.org/  
**Download:** https://asl-lex.org/download.html

### Overview
A comprehensive **lexical database** of American Sign Language with 2,700+ signs and 60+ features per sign. Includes video examples and rich linguistic annotations.

### Contents
- 2,700+ ASL signs (ASL-LEX 2.0)
- 60+ features per sign
- Video examples
- Interactive visualization tool
- Phonological properties
- Iconicity ratings

### License
**Creative Commons Attribution-NonCommercial 4.0 (CC BY-NC 4.0)**
- ✅ Research/educational use
- ❌ No commercial redistribution

### Use Case
Best for:
- Looking up specific sign videos
- Understanding sign properties
- Building sign vocabulary reference

### Visualization
Interactive lexicon explorer available at: https://asl-lex.org/visualization/

---

## 4. SignBank / SignPuddle

**URL:** https://www.signbank.org/signpuddle/

### Overview
Community-contributed sign language dictionaries using SignWriting notation.

### Contents
- Multiple sign languages (not just ASL)
- Community-submitted videos
- Variable quality

### License
Mixed - varies by contribution

### Use Case
Supplementary resource for additional sign examples, but quality/accuracy may vary.

---

## Medical Signs to Prioritize (20 Priority Signs)

Based on dataset availability and medical relevance:

| # | Sign | Priority | Notes |
|---|------|----------|-------|
| 1 | pain | 🔴 High | Core symptom |
| 2 | help | 🔴 High | Emergency/request |
| 3 | sick | 🔴 High | General condition |
| 4 | doctor | 🔴 High | Role identification |
| 5 | medicine | 🔴 High | Treatment |
| 6 | heart | 🔴 High | Organ/symptom |
| 7 | chest | 🔴 High | Location |
| 8 | head | 🔴 High | Location |
| 9 | stomach | 🔴 High | Location |
| 10 | dizzy | 🟡 Medium | Symptom |
| 11 | yes | 🔴 High | Response |
| 12 | no | 🔴 High | Response |
| 13 | more | 🟡 Medium | Modifier |
| 14 | emergency | 🔴 High | Urgency |
| 15 | allergic | 🔴 High | Medical condition |
| 16 | breathe | 🔴 High | Symptom/action |
| 17 | nausea | 🟡 Medium | Symptom |
| 18 | tired | 🟡 Medium | Symptom |
| 19 | when | 🟡 Medium | Question |
| 20 | where | 🟡 Medium | Question |

---

## Recommendations

### For HealthBridge Testing

1. **Start with WLASL** - Best for isolated sign testing
   - Download via GitHub
   - Focus on the 20 priority signs above
   - Use pre-trained models as baseline

2. **Graduate to How2Sign** - For phrase/sentence testing
   - More realistic medical consultation simulation
   - Provides ground truth translations

3. **Use ASL-LEX as Reference** - For sign verification
   - When unsure about sign accuracy
   - For expanding vocabulary

### Next Steps (Task A.2.1)

1. Download WLASL dataset
2. Extract videos for 20 priority signs
3. Create `/test-data/asl-videos/` folder structure
4. Generate `ground-truth.json` manifest

---

## License Compliance Checklist

- [x] All datasets are non-commercial research use only
- [x] HealthBridge is for hackathon/research - compliant
- [ ] Add citations to README before public release
- [ ] Remove test data before any commercial deployment
