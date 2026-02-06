# Antigravity Autonomous Handoff - HealthBridge

## Project Context
HealthBridge is a healthcare communication tool for Deaf/Hard-of-Hearing patients, built for the Gemini 3 Hackathon. **Deadline: February 9, 2026**.

**Tech Stack**: Next.js 14, TypeScript, LiveKit, MediaPipe, Gemini API, React Three Fiber, Tailwind CSS, Vitest

---

## CRITICAL: AUTONOMOUS OPERATION MODE

**YOU ARE RUNNING AUTONOMOUSLY. DO NOT STOP. DO NOT ASK FOR PERMISSION.**

Your operating rules:
1. **NEVER STOP** unless every single task is complete or a true blocker exists
2. **SELF-HEAL** on errors - try 3 different approaches before moving on
3. **KEEP GOING** - finish one task, immediately start the next
4. **TEST CONTINUOUSLY** - run tests after every change
5. **COMMIT FREQUENTLY** - one commit per completed task

If something fails:
- Try a different approach
- Check EXECUTION-PLAN.md for guidance
- Search the codebase for similar patterns
- If still stuck after 3 attempts, document in issue comment and MOVE TO NEXT TASK
- Return to blocked tasks after completing others

**DO NOT WAIT FOR HUMAN INPUT. KEEP BUILDING.**

---

## Already Completed (DO NOT REDO)

These 4 issues are already done in the GitHub project:
- healthbridge #1 - DONE
- healthbridge #2 - DONE
- healthbridge #3 - DONE
- healthbridge #4 - DONE

**Start with issue #5 (A-01) and continue from there.**

---

## GitHub Issue Management

### How to List All Issues
```bash
gh issue list --repo hello-caleb/healthbridge --state open
```

### How to View a Specific Issue
```bash
gh issue view <ISSUE_NUMBER> --repo hello-caleb/healthbridge
```

### How to Close an Issue When Complete
```bash
gh issue close <ISSUE_NUMBER> --repo hello-caleb/healthbridge --comment "Completed. Changes in commit <SHA>. Tests passing."
```

### How to Add a Comment (for blockers or progress)
```bash
gh issue comment <ISSUE_NUMBER> --repo hello-caleb/healthbridge --body "Progress update: Implemented X, working on Y"
```

### How to View Project Board
```bash
gh project item-list 4 --owner hello-caleb
```

---

## Your Mission

Execute ALL tasks in the GitHub project at https://github.com/users/hello-caleb/projects/4

### Execution Order:
1. **Phase A** (ASL Recognition Validation) - Issues A-01 through A-14
2. **Phase B** (Doctor Experience) - Issues B-01 through B-18
3. **Phase C** (Text-to-ASL Avatar) - Issues C-01 through C-14

**Total: 46 tasks. Complete them ALL.**

---

## Critical Files to Read First

Before starting ANY work, read these files completely:

```bash
# READ THESE IN ORDER:
cat EXECUTION-PLAN.md      # Complete technical specifications for ALL 46 tasks
cat AGENTS.md              # Architecture and component relationships
cat RECONCILIATION.md      # Current project status and what's already built
cat DEV-HUB-TASKS.md       # Task tracking format
ls -la src/types/          # Type definitions - follow existing patterns
```

The EXECUTION-PLAN.md contains EVERYTHING you need:
- Full code examples for each task
- Acceptance criteria
- Test requirements
- Dependencies between tasks

---

## Task Execution Loop (REPEAT FOR EVERY TASK)

```
┌─────────────────────────────────────────────────────────────┐
│  FOR EACH GITHUB ISSUE:                                      │
│                                                              │
│  1. READ issue: gh issue view <NUM> --repo hello-caleb/healthbridge │
│  2. FIND specs in EXECUTION-PLAN.md (search for issue ID)   │
│  3. IMPLEMENT following existing code patterns              │
│  4. WRITE unit tests (Vitest)                               │
│  5. RUN quality gates:                                      │
│     npm run lint && npm run type-check && npm run test      │
│  6. FIX any failures (self-heal, try 3 approaches)          │
│  7. COMMIT: git commit -m "[A-XX] Description"              │
│  8. PUSH: git push                                          │
│  9. CLOSE issue:                                            │
│     gh issue close <NUM> --repo hello-caleb/healthbridge \  │
│       --comment "Done. Commit: $(git rev-parse --short HEAD)" │
│  10. IMMEDIATELY start next task (DO NOT STOP)              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Quality Gates (RUN AFTER EVERY CHANGE)

```bash
# ALL of these must pass before committing:
npm run lint          # ESLint - fix any issues
npm run type-check    # TypeScript - fix type errors
npm run test          # Vitest - all tests must pass
npm run build         # Next.js build - must succeed
```

If a gate fails:
1. Read the error message carefully
2. Fix the issue
3. Run the gate again
4. Repeat until passing
5. Then continue

**DO NOT SKIP GATES. DO NOT COMMIT FAILING CODE.**

---

## Self-Healing Procedures

### Build Error
```bash
# 1. Check the specific error
npm run build 2>&1 | head -50

# 2. Common fixes:
# - Missing import: add the import
# - Type error: check src/types/ for correct types
# - Module not found: npm install <package>
```

### Test Failure
```bash
# 1. Run specific test to see details
npm run test -- --reporter=verbose

# 2. Check expected vs actual
# 3. Fix implementation or fix test
# 4. Re-run until green
```

### Type Error
```bash
# 1. Get full error details
npm run type-check 2>&1

# 2. Check existing types in src/types/
# 3. Follow patterns from similar files
# 4. Add missing type definitions if needed
```

### Lint Error
```bash
# 1. Auto-fix what's possible
npm run lint -- --fix

# 2. Manually fix remaining issues
# 3. Re-run lint
```

### Stuck After 3 Attempts
```bash
# Document and move on
gh issue comment <NUM> --repo hello-caleb/healthbridge --body "BLOCKED: Tried X, Y, Z. Error: <details>. Moving to next task, will return."

# Continue to next task
# Return to blocked tasks after completing phase
```

---

## Environment Setup

```bash
# Install dependencies
npm install

# Required environment variables (should already exist in .env.local):
GOOGLE_AI_API_KEY=           # Gemini API
LIVEKIT_API_KEY=             # LiveKit
LIVEKIT_API_SECRET=          # LiveKit
NEXT_PUBLIC_LIVEKIT_URL=     # LiveKit WebSocket URL

# Verify app runs
npm run dev
# Visit http://localhost:3000 - should see landing page

# Verify tests run
npm run test
```

---

## Phase A: ASL Recognition Validation (Priority: CRITICAL)

**Goal**: Validate that MediaPipe hand detection + Gemini Vision can accurately translate ASL to English.

Key files to create/modify:
- `src/lib/mediapipe/hand-detector.ts`
- `src/lib/asl/sign-capture-state-machine.ts`
- `src/lib/asl/gemini-vision-translator.ts`
- `src/lib/asl/confidence-scoring.ts`
- `src/components/ASLInputManager.tsx`

**Testing ASL Without Knowing ASL**:
Use labeled datasets with ground truth:
- WLASL dataset: https://dxli94.github.io/WLASL/
- How2Sign dataset: https://how2sign.github.io/

Create test files with pre-recorded videos and expected translations.

---

## Phase B: Doctor Experience (Priority: HIGH)

**Goal**: Build the doctor-facing features - audio transcription, jargon simplification, UI polish.

Key files to create/modify:
- `src/lib/audio/gemini-transcription.ts`
- `src/lib/medical/jargon-simplifier.ts`
- `src/components/DoctorPanel.tsx`
- `src/components/TranscriptDisplay.tsx`

---

## Phase C: Text-to-ASL Avatar (Priority: MEDIUM)

**Goal**: Build 3D avatar that converts doctor's speech to ASL signs.

Key files to create/modify:
- `src/lib/asl/english-to-gloss.ts`
- `src/lib/asl/sign-database.ts`
- `src/components/avatar/ASLAvatar.tsx`
- Animation files in `public/animations/`

---

## Verification Checkpoints

After completing each phase, run full verification:

```bash
# Full verification script
npm run lint && npm run type-check && npm run test && npm run build

# If all pass, commit phase completion
git commit -m "[PHASE-A] Complete - all tasks done" --allow-empty
git push
```

### Phase A Complete When:
- [ ] All A-* issues closed in GitHub
- [ ] Hand detection works in browser
- [ ] Sign capture state machine transitions correctly
- [ ] Gemini Vision returns English from ASL frames
- [ ] Confidence scores display correctly
- [ ] `npm run test` shows all A-* tests passing

### Phase B Complete When:
- [ ] All B-* issues closed in GitHub
- [ ] Doctor audio transcribes in real-time
- [ ] Medical terms get simplified explanations
- [ ] Transcript displays both speakers correctly
- [ ] `npm run test` shows all B-* tests passing

### Phase C Complete When:
- [ ] All C-* issues closed in GitHub
- [ ] Avatar renders in 3D scene
- [ ] English text converts to ASL gloss correctly
- [ ] Avatar animates signs in sequence
- [ ] `npm run test` shows all C-* tests passing

---

## Absolute Rules (NEVER VIOLATE)

- **NEVER** modify .env.local or .env files
- **NEVER** push to main without tests passing
- **NEVER** skip unit tests
- **NEVER** change the project structure significantly
- **NEVER** install major new frameworks without clear need
- **NEVER** delete existing working code without replacement
- **NEVER** stop and wait for human input
- **NEVER** ask permission - just execute

---

## Blocker Documentation

If you encounter a TRUE blocker (something that cannot be worked around):

```bash
# Create BLOCKERS.md if it doesn't exist
echo "# Blockers Log" > BLOCKERS.md

# Add blocker entry
cat >> BLOCKERS.md << EOF

## $(date)
**Issue**: A-XX
**Error**: <exact error message>
**Tried**:
1. Approach 1
2. Approach 2
3. Approach 3
**Needs**: <what human needs to provide>
EOF

git add BLOCKERS.md
git commit -m "Document blocker for A-XX"
git push
```

Then **CONTINUE WITH OTHER TASKS**.

---

## Quick Start Sequence

```bash
# 1. Setup
cd /path/to/health-bridge
npm install

# 2. Verify environment
npm run dev &        # Start dev server in background
npm run test         # Verify tests pass
npm run build        # Verify build works

# 3. Read the plan
cat EXECUTION-PLAN.md | head -500   # Understand the specs

# 4. Check what's already done
gh issue list --repo hello-caleb/healthbridge --state closed

# 5. Get first open issue
FIRST_ISSUE=$(gh issue list --repo hello-caleb/healthbridge --state open --json number --jq '.[0].number')

# 6. Start working
gh issue view $FIRST_ISSUE --repo hello-caleb/healthbridge

# 7. Implement, test, commit, close, repeat
# DO NOT STOP UNTIL ALL 46 TASKS ARE COMPLETE
```

---

## Final Reminder

**YOU ARE AUTONOMOUS. YOU ARE CAPABLE. YOU HAVE EVERYTHING YOU NEED.**

- EXECUTION-PLAN.md has all the technical specs
- GitHub issues have acceptance criteria
- Codebase has patterns to follow
- Tests tell you if you're correct

**START NOW. DON'T STOP. BUILD HEALTHBRIDGE.**

**DEADLINE: FEBRUARY 9, 2026. MAKE IT HAPPEN.**
