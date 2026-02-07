# Kiro Testing Handoff - HealthBridge

## Purpose
This document enables Kiro to take over unit testing responsibilities for the HealthBridge project.

---

## Project Context
HealthBridge is a medical communication assistant enabling ASL (American Sign Language) translation between patients and doctors using Gemini Vision API.

## Testing Status

### Phase A (Complete)
- ✅ 41 unit tests passing
- Test files: `src/hooks/__tests__/`, `src/lib/__tests__/`
- Run: `npm run test`

### Phase B (Doctor Dashboard)
- ❓ Needs test coverage verification
- Components to test: Doctor dashboard, translation display, patient indicators

### Phase C (Text-to-ASL Avatar)
- 🔜 Future - needs C.4.1-C.4.6 testing tasks

---

## Test Commands

```bash
# Install dependencies
npm install

# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm run test -- src/lib/__tests__/confidence-scorer.test.ts

# Run ASL accuracy tests (requires video files)
npm run test:asl-accuracy
```

---

## Testing Tasks for Kiro

### Immediate (Phase B)
1. **Verify Phase B test coverage**
   - Check if doctor dashboard components have tests
   - Add tests for `DoctorDashboard.tsx` if missing
   - Add tests for real-time translation display

2. **Test files to create if missing:**
   - `src/components/__tests__/DoctorDashboard.test.tsx`
   - `src/components/__tests__/ASLCaptureStatus.test.tsx`

### Future (Phase C)
- C.4.4: Unit tests for Text-to-ASL translation
- C.4.5: Unit tests for avatar components

---

## Test Framework
- **Vitest** (Jest-compatible)
- **React Testing Library** for components
- **jsdom** environment

## Config Files
- `vitest.config.ts` - test configuration
- `src/test/setup.ts` - global mocks

---

## Getting Started

1. Clone and install:
```bash
cd health-bridge
npm install
```

2. Run existing tests:
```bash
npm run test:run
```

3. Check coverage:
```bash
npm run test:coverage
```

4. Add new tests following existing patterns in `src/lib/__tests__/`
