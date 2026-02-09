#!/bin/bash

# HealthBridge GitHub Issues Creator
# Run this script locally to create all Phase A, B, C tasks as GitHub issues
# and add them to your project board.

# Configuration
REPO="hello-caleb/healthbridge"  # Fixed: no hyphen
PROJECT_NUMBER=4

echo "🏥 HealthBridge Task Creator"
echo "============================"
echo ""

# Check if gh is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed."
    echo "Install it: https://cli.github.com/"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "❌ Not authenticated with GitHub CLI."
    echo "Run: gh auth login"
    exit 1
fi

echo "✅ GitHub CLI authenticated"
echo ""

# Function to create issue and add to project
create_task() {
    local title="$1"
    local phase="$2"
    local priority="$3"
    local estimate="$4"
    local body="$5"
    local labels="$6"

    echo "Creating: $title"

    # Create the issue
    issue_url=$(gh issue create \
        --repo "$REPO" \
        --title "$title" \
        --body "$body" \
        --label "$labels" \
        2>&1)

    if [[ $issue_url == *"github.com"* ]]; then
        echo "  ✅ Created: $issue_url"

        # Extract issue number
        issue_number=$(echo "$issue_url" | grep -oE '[0-9]+$')

        # Add to project
        gh project item-add "$PROJECT_NUMBER" --owner hello-caleb --url "$issue_url" 2>/dev/null
        echo "  ✅ Added to project"
    else
        echo "  ❌ Failed: $issue_url"
    fi
    echo ""
}

# Create labels if they don't exist
echo "Creating labels..."
gh label create "phase-a" --repo "$REPO" --color "1d76db" --description "Phase A: ASL Recognition Validation" 2>/dev/null || true
gh label create "phase-b" --repo "$REPO" --color "0e8a16" --description "Phase B: Doctor Experience" 2>/dev/null || true
gh label create "phase-c" --repo "$REPO" --color "5319e7" --description "Phase C: Text-to-ASL Avatar" 2>/dev/null || true
gh label create "research" --repo "$REPO" --color "fbca04" --description "Research & Discovery" 2>/dev/null || true
gh label create "build" --repo "$REPO" --color "d93f0b" --description "Build task" 2>/dev/null || true
gh label create "testing" --repo "$REPO" --color "0052cc" --description "Testing & QA" 2>/dev/null || true
gh label create "review" --repo "$REPO" --color "006b75" --description "Code Review checkpoint" 2>/dev/null || true
gh label create "high-priority" --repo "$REPO" --color "b60205" --description "High priority" 2>/dev/null || true
echo ""

echo "=========================================="
echo "PHASE A: ASL Recognition Validation"
echo "=========================================="
echo ""

# A.1.1
create_task \
    "[A.1.1] Research ASL video datasets for testing (WLASL, How2Sign, ASL-LEX)" \
    "A" \
    "high" \
    "3h" \
    "## Description
Find and document available ASL video datasets for testing our recognition system.

## Acceptance Criteria
- [ ] List 3+ ASL datasets with download links
- [ ] Document which signs/words each dataset contains
- [ ] Identify 20 medical-relevant signs available in datasets
- [ ] Note licensing restrictions for each dataset

## Technical Details
Datasets to investigate:
1. WLASL (Word-Level ASL) - https://dxli94.github.io/WLASL/
2. How2Sign - https://how2sign.github.io/
3. ASL-LEX - https://asl-lex.org/
4. SignBank ASL

## Output
Create \`/docs/ASL-DATASETS.md\` with findings

## Estimate
3 hours" \
    "phase-a,research,high-priority"

# A.1.2
create_task \
    "[A.1.2] Research Gemini Vision API capabilities for sign language" \
    "A" \
    "high" \
    "2h" \
    "## Description
Document exactly what Gemini Vision can and cannot do with video/image analysis for ASL.

## Acceptance Criteria
- [ ] Document API rate limits and pricing
- [ ] Test maximum frames per request
- [ ] Document response time benchmarks
- [ ] Identify if Gemini has any ASL-specific training
- [ ] Compare 1.5 Pro vs 2.0 Flash for vision tasks

## Output
Create \`/docs/GEMINI-VISION-ANALYSIS.md\` with benchmarks

## Estimate
2 hours" \
    "phase-a,research,high-priority"

# A.1.3
create_task \
    "[A.1.3] Research alternative ASL recognition models (SignGemma, OpenHands)" \
    "A" \
    "medium" \
    "4h" \
    "## Description
If Gemini Vision doesn't work well enough, we need backup options.

## Acceptance Criteria
- [ ] Evaluate SignGemma availability and accuracy
- [ ] Research OpenHands model
- [ ] Investigate Google's sign language research
- [ ] Document pros/cons of each approach
- [ ] Estimate integration effort for each

## Dependencies
A.1.2

## Output
Create \`/docs/ASL-MODEL-OPTIONS.md\` with comparison matrix

## Estimate
4 hours" \
    "phase-a,research"

# A.2.1
create_task \
    "[A.2.1] Create ASL test video collection with 20 medical phrases" \
    "A" \
    "high" \
    "4h" \
    "## Description
Gather or record 20 ASL video clips of common medical phrases for testing.

## Acceptance Criteria
- [ ] 20 video clips of distinct signs/phrases
- [ ] Each clip is 2-5 seconds long
- [ ] Mix of fingerspelling and signs
- [ ] Videos saved in \`/test-data/asl-videos/\`
- [ ] Ground truth labels in JSON file

## Priority Signs
pain, help, sick, doctor, medicine, heart, chest, head, stomach, dizzy, yes, no, more, emergency, allergic, breathe, nausea, tired, when, where

## Dependencies
A.1.1

## Output
\`/test-data/asl-videos/\` folder with 20+ clips and \`ground-truth.json\`

## Estimate
4 hours" \
    "phase-a,testing,high-priority"

# A.2.2
create_task \
    "[A.2.2] Build automated ASL recognition accuracy test script" \
    "A" \
    "high" \
    "4h" \
    "## Description
Create a script that runs all test videos through our ASL pipeline and measures accuracy.

## Acceptance Criteria
- [ ] Script processes all videos in test folder
- [ ] Compares output to ground truth
- [ ] Calculates accuracy percentage
- [ ] Generates detailed report
- [ ] Logs failures with timestamps

## Dependencies
A.2.1

## Output
\`/scripts/test-asl-accuracy.ts\`

## Estimate
4 hours" \
    "phase-a,testing,high-priority"

# A.2.3
create_task \
    "[A.2.3] Run baseline accuracy test and document results" \
    "A" \
    "high" \
    "2h" \
    "## Description
Run the accuracy test with our current Gemini Vision implementation to establish baseline.

## Acceptance Criteria
- [ ] Run test script against all 20 test videos
- [ ] Document accuracy percentage
- [ ] Identify which signs work vs fail
- [ ] Note any patterns in failures
- [ ] Decision: Continue with Gemini Vision or pivot?

## Dependencies
A.2.2

## Output
\`/test-data/baseline-accuracy-report.md\`

## Estimate
2 hours

## DECISION POINT
If accuracy >70%: Proceed with optimization
If accuracy 50-70%: Try more frames, better prompts
If accuracy <50%: Pivot to alternative model" \
    "phase-a,testing,high-priority"

# A.2.4
create_task \
    "[A.2.4] Test ASL recognition with increased frame counts (5, 8, 10, 15)" \
    "A" \
    "medium" \
    "3h" \
    "## Description
Test if sending more frames to Gemini Vision improves accuracy.

## Acceptance Criteria
- [ ] Run tests with 5, 8, 10, 15 frames
- [ ] Document accuracy at each level
- [ ] Document response time at each level
- [ ] Find optimal frames/accuracy tradeoff
- [ ] Update asl-translation-service.ts with optimal count

## Dependencies
A.2.3

## Estimate
3 hours" \
    "phase-a,testing"

# A.2.5
create_task \
    "[A.2.5] Test and optimize Gemini Vision prompt for ASL recognition" \
    "A" \
    "medium" \
    "4h" \
    "## Description
The prompt we send to Gemini Vision significantly affects accuracy. Test different prompts.

## Acceptance Criteria
- [ ] Test 5+ different prompt variations
- [ ] Document accuracy for each prompt
- [ ] Identify best-performing prompt
- [ ] Update asl-translation-service.ts with optimal prompt

## Dependencies
A.2.3

## Output
\`/docs/PROMPT-OPTIMIZATION.md\`

## Estimate
4 hours" \
    "phase-a,testing"

# A.3.1
create_task \
    "[A.3.1] Improve sign start/end detection in use-hand-landmarker.ts" \
    "A" \
    "high" \
    "6h" \
    "## Description
Current implementation uses simple timing. Need smarter detection of when a sign starts and ends.

## Acceptance Criteria
- [ ] Detect sign start: hands enter frame with movement
- [ ] Detect sign end: hands pause or exit frame
- [ ] Handle continuous signing (multiple signs)
- [ ] Reduce false positives (random hand movements)
- [ ] Add movement velocity tracking

## Technical Details
Implement improved state machine:
- idle → preparing: Hands detected
- preparing → signing: Significant movement (velocity > threshold)
- signing → completing: Movement stops
- completing → idle: Still for 600ms

## Dependencies
A.2.3

## Output
Updated \`src/hooks/use-hand-landmarker.ts\`

## Estimate
6 hours" \
    "phase-a,build,high-priority"

# A.3.2
create_task \
    "[A.3.2] Add landmark smoothing to reduce jitter in hand tracking" \
    "A" \
    "medium" \
    "3h" \
    "## Description
MediaPipe landmarks can be jittery. Smooth them for better sign detection.

## Acceptance Criteria
- [ ] Implement exponential moving average smoothing
- [ ] Configurable smoothing factor
- [ ] Maintain responsiveness for fast movements
- [ ] Reduce false sign detections from jitter

## Dependencies
A.3.1

## Estimate
3 hours" \
    "phase-a,build"

# A.3.3
create_task \
    "[A.3.3] Implement smart frame selection for Gemini Vision API calls" \
    "A" \
    "medium" \
    "4h" \
    "## Description
Don't just send evenly-spaced frames. Select frames that show key moments of the sign.

## Acceptance Criteria
- [ ] Detect key frames based on movement changes
- [ ] Include start, peak movement, and end frames
- [ ] Remove near-duplicate frames
- [ ] Optimize for API cost while maintaining accuracy

## Dependencies
A.3.1

## Estimate
4 hours" \
    "phase-a,build"

# A.3.4
create_task \
    "[A.3.4] Implement detailed confidence scoring for ASL translations" \
    "A" \
    "high" \
    "3h" \
    "## Description
Current confidence is just high/medium/low from Gemini. Need more nuanced scoring.

## Acceptance Criteria
- [ ] Score from 0-100 instead of categories
- [ ] Factor in: Gemini confidence, hand visibility, sign duration
- [ ] Provide alternative interpretations for low confidence
- [ ] UI shows confidence clearly to doctor

## Dependencies
A.2.5

## Estimate
3 hours" \
    "phase-a,build,high-priority"

# A.3.5
create_task \
    "[A.3.5] Build visual feedback component for sign capture quality" \
    "A" \
    "medium" \
    "4h" \
    "## Description
Patient needs feedback that their sign is being captured properly.

## Acceptance Criteria
- [ ] Show hand tracking status (detected/not detected)
- [ ] Show sign capture progress (preparing/signing/processing)
- [ ] Visual indicator of capture quality
- [ ] \"Sign again\" prompt for low quality captures

## Dependencies
A.3.4

## Output
\`src/components/ASLCaptureStatus.tsx\`

## Estimate
4 hours" \
    "phase-a,build"

# A.5.1
create_task \
    "[A.5.1] Write unit tests for use-hand-landmarker.ts" \
    "A" \
    "high" \
    "4h" \
    "## Description
Test the sign capture state machine without needing real ASL knowledge.

## Acceptance Criteria
- [ ] Test state transitions: idle → preparing → signing → completing → idle
- [ ] Test timeout handling
- [ ] Test velocity threshold detection
- [ ] Test frame capture buffering
- [ ] Mock MediaPipe landmarks

## Dependencies
A.3.1

## Output
\`src/hooks/__tests__/use-hand-landmarker.test.ts\`

## Estimate
4 hours" \
    "phase-a,testing,high-priority"

# A.5.2
create_task \
    "[A.5.2] Write unit tests for asl-translation-service.ts" \
    "A" \
    "high" \
    "3h" \
    "## Description
Test the translation service with mocked Gemini API responses.

## Acceptance Criteria
- [ ] Test successful translation parsing
- [ ] Test confidence score calculation
- [ ] Test API error handling (rate limits, timeouts)
- [ ] Test frame selection logic
- [ ] Mock Gemini API responses

## Dependencies
A.3.4

## Output
\`src/lib/__tests__/asl-translation-service.test.ts\`

## Estimate
3 hours" \
    "phase-a,testing,high-priority"

# A.4.1
create_task \
    "[A.4.1] CODE REVIEW: Phase A Research Complete" \
    "A" \
    "high" \
    "1h" \
    "## Review Checkpoint

## Checklist
- [ ] ASL-DATASETS.md is comprehensive
- [ ] GEMINI-VISION-ANALYSIS.md has concrete benchmarks
- [ ] ASL-MODEL-OPTIONS.md has clear recommendation
- [ ] Decision made: Continue with Gemini Vision or pivot?

## Dependencies
A.1.1, A.1.2, A.1.3

## Assigned To
Caleb" \
    "phase-a,review,high-priority"

# A.4.2
create_task \
    "[A.4.2] CODE REVIEW: Phase A Testing Complete" \
    "A" \
    "high" \
    "1h" \
    "## Review Checkpoint

## Checklist
- [ ] 20 test videos collected
- [ ] Accuracy test script runs successfully
- [ ] Baseline accuracy documented
- [ ] Prompt optimization tested
- [ ] GO/NO-GO decision: Is accuracy acceptable?

## Dependencies
A.2.3, A.2.4, A.2.5

## Assigned To
Caleb" \
    "phase-a,review,high-priority"

# A.4.3
create_task \
    "[A.4.3] CODE REVIEW: Phase A Build Complete" \
    "A" \
    "high" \
    "2h" \
    "## Review Checkpoint

## Checklist
- [ ] use-hand-landmarker.ts improvements merged
- [ ] Smoothing and noise reduction working
- [ ] Frame selection optimized
- [ ] Confidence scoring detailed
- [ ] Visual feedback component working
- [ ] TypeScript compiles with no errors
- [ ] Re-run accuracy tests - improvement shown?

## Dependencies
A.3.*, A.5.*

## Assigned To
Caleb" \
    "phase-a,review,high-priority"

echo "=========================================="
echo "PHASE B: Doctor Experience"
echo "=========================================="
echo ""

# B.1.1
create_task \
    "[B.1.1] Design doctor dashboard layout with ASL input display" \
    "B" \
    "high" \
    "3h" \
    "## Description
Create wireframes/design for doctor's optimized view.

## Acceptance Criteria
- [ ] Wireframe showing all information zones
- [ ] Typography scale (larger for readability)
- [ ] Color coding for confidence levels
- [ ] Action buttons placement
- [ ] Mobile responsive consideration

## Dependencies
Phase A complete

## Output
\`/docs/DOCTOR-DASHBOARD-DESIGN.md\`

## Estimate
3 hours" \
    "phase-b,research,high-priority"

# B.2.1
create_task \
    "[B.2.1] Build DoctorDashboard component with optimized layout" \
    "B" \
    "high" \
    "6h" \
    "## Description
Create a new dashboard component specifically optimized for doctors.

## Acceptance Criteria
- [ ] Large, clear display of current patient message
- [ ] Confidence indicator with visual scale
- [ ] Action buttons: \"Ask to repeat\", \"Confirm understood\"
- [ ] Conversation history with timestamps
- [ ] Medical terms detected section
- [ ] Sound notification toggle

## Dependencies
B.1.1

## Output
\`src/components/DoctorDashboard.tsx\`

## Estimate
6 hours" \
    "phase-b,build,high-priority"

# B.2.2
create_task \
    "[B.2.2] Implement bidirectional 'Ask to Repeat' request system" \
    "B" \
    "high" \
    "4h" \
    "## Description
When doctor clicks \"Ask to Repeat\", patient should see a clear prompt to sign again.

## Acceptance Criteria
- [ ] Doctor clicks button → message sent to patient view
- [ ] Patient sees \"Please sign again\" prompt
- [ ] Prompt is visually prominent and accessible
- [ ] Prompt auto-dismisses when new sign captured
- [ ] Works over WebSocket/LiveKit data channel

## Dependencies
B.2.1

## Output
\`src/lib/session-communication.ts\`
\`src/components/RepeatRequestModal.tsx\`

## Estimate
4 hours" \
    "phase-b,build,high-priority"

# B.2.3
create_task \
    "[B.2.3] Add audio notification system for new patient messages" \
    "B" \
    "medium" \
    "2h" \
    "## Description
Doctors need audio alerts when patient sends a new message.

## Acceptance Criteria
- [ ] Subtle sound when new message arrives
- [ ] Different sound for low-confidence message
- [ ] Toggle to enable/disable sounds
- [ ] Volume control

## Dependencies
B.2.1

## Output
\`src/lib/notification-sounds.ts\`

## Estimate
2 hours" \
    "phase-b,build"

# B.2.4
create_task \
    "[B.2.4] Build real-time 'Patient is signing' indicator" \
    "B" \
    "medium" \
    "3h" \
    "## Description
Doctor should see when patient is actively signing, before translation is complete.

## Acceptance Criteria
- [ ] \"Patient is signing...\" appears in real-time
- [ ] Shows on patient video overlay
- [ ] Shows in message area
- [ ] Status sent via data channel from patient view
- [ ] Disappears when translation arrives

## Dependencies
B.2.2

## Estimate
3 hours" \
    "phase-b,build"

# B.2.5
create_task \
    "[B.2.5] Create interactive onboarding tutorial for doctors" \
    "B" \
    "medium" \
    "4h" \
    "## Description
First-time doctors need to understand how the system works.

## Acceptance Criteria
- [ ] Step-by-step tutorial overlay
- [ ] Explains confidence scores
- [ ] Shows how to request repeat
- [ ] Demonstrates conversation flow
- [ ] Can be dismissed and re-accessed

## Output
\`src/components/DoctorOnboarding.tsx\`

## Estimate
4 hours" \
    "phase-b,build"

# B.3.1
create_task \
    "[B.3.1] CODE REVIEW: Doctor Dashboard Complete" \
    "B" \
    "high" \
    "2h" \
    "## Review Checkpoint

## Checklist
- [ ] Doctor dashboard renders correctly
- [ ] Confidence scores display properly
- [ ] \"Ask to repeat\" flow works end-to-end
- [ ] Sound notifications work
- [ ] Real-time signing indicator works
- [ ] No TypeScript errors
- [ ] Responsive on different screen sizes

## Dependencies
B.2.*

## Assigned To
Caleb" \
    "phase-b,review,high-priority"

echo "=========================================="
echo "PHASE C: Text-to-ASL Avatar"
echo "=========================================="
echo ""

# C.1.1
create_task \
    "[C.1.1] Research English to ASL translation approaches" \
    "C" \
    "high" \
    "6h" \
    "## Description
ASL has different grammar than English. Research how to convert English text to ASL gloss/signs.

## Acceptance Criteria
- [ ] Document ASL grammar differences from English
- [ ] Research existing English→ASL translation tools
- [ ] Evaluate rule-based vs ML approaches
- [ ] Estimate accuracy and latency for each
- [ ] Recommend approach for MVP

## Key ASL Grammar Differences
1. Word order: Topic-Comment (vs Subject-Verb-Object)
2. No articles: \"a\", \"an\", \"the\" are dropped
3. Time established first
4. Facial expressions carry grammar

## Dependencies
Phase B complete

## Output
\`/docs/TEXT-TO-ASL-RESEARCH.md\`

## Estimate
6 hours" \
    "phase-c,research,high-priority"

# C.1.2
create_task \
    "[C.1.2] Research ASL avatar rendering libraries and approaches" \
    "C" \
    "high" \
    "6h" \
    "## Description
Evaluate options for rendering a signing avatar.

## Acceptance Criteria
- [ ] Evaluate 3D avatar libraries (ReadyPlayerMe, Mixamo)
- [ ] Evaluate pre-recorded video approaches
- [ ] Evaluate neural synthesis options
- [ ] Document cost, quality, latency for each
- [ ] Recommend approach for MVP

## Options to Evaluate
1. 3D Avatar with Animation Data (Three.js, React Three Fiber)
2. Pre-recorded Video Dictionary
3. Neural Video Synthesis
4. Commercial Solutions (SignAll, HandTalk)

## Output
\`/docs/ASL-AVATAR-RESEARCH.md\`

## Estimate
6 hours" \
    "phase-c,research,high-priority"

# C.1.3
create_task \
    "[C.1.3] Research ASL motion capture / animation data sources" \
    "C" \
    "medium" \
    "4h" \
    "## Description
If using 3D avatar, we need animation data for signs.

## Acceptance Criteria
- [ ] Find ASL motion capture datasets
- [ ] Identify if medical signs are included
- [ ] Document format and licensing
- [ ] Estimate effort to convert/use

## Dependencies
C.1.2

## Output
\`/docs/ASL-MOTION-DATA-SOURCES.md\`

## Estimate
4 hours" \
    "phase-c,research"

# C.2.1
create_task \
    "[C.2.1] Design complete avatar system architecture" \
    "C" \
    "high" \
    "4h" \
    "## Description
Create technical architecture for the entire text-to-avatar pipeline.

## Acceptance Criteria
- [ ] Data flow diagram
- [ ] Component breakdown
- [ ] API contracts defined
- [ ] Latency budget per component (target: <2s total)
- [ ] Fallback strategies

## Dependencies
C.1.1, C.1.2

## Output
\`/docs/AVATAR-ARCHITECTURE.md\`

## Estimate
4 hours" \
    "phase-c,research,high-priority"

# C.2.2
create_task \
    "[C.2.2] Design sign vocabulary database schema" \
    "C" \
    "high" \
    "3h" \
    "## Description
Need a database structure to store signs and their animations.

## Acceptance Criteria
- [ ] Schema supports word → sign mapping
- [ ] Handles synonyms and variations
- [ ] Supports medical vocabulary tagging
- [ ] Includes animation metadata
- [ ] Supports fingerspelling letters

## Dependencies
C.2.1

## Output
\`/docs/SIGN-DATABASE-SCHEMA.md\`
\`src/types/sign-vocabulary.ts\`

## Estimate
3 hours" \
    "phase-c,research,high-priority"

# C.3.1
create_task \
    "[C.3.1] Build English-to-ASL text translator service" \
    "C" \
    "high" \
    "12h" \
    "## Description
Convert English sentences to ASL word order and format.

## Acceptance Criteria
- [ ] Handles basic sentence structures
- [ ] Removes articles (a, an, the)
- [ ] Reorders to Topic-Comment structure
- [ ] Marks questions and negations
- [ ] Handles medical vocabulary
- [ ] Fallback to fingerspelling for unknown words

## Dependencies
C.2.1

## Output
\`src/lib/english-to-asl.ts\`

## Estimate
12 hours" \
    "phase-c,build,high-priority"

# C.3.2
create_task \
    "[C.3.2] Build sign vocabulary database with 100+ medical signs" \
    "C" \
    "high" \
    "8h" \
    "## Description
Create the vocabulary database with at least 100 signs relevant to healthcare.

## Acceptance Criteria
- [ ] 100+ sign entries
- [ ] All 26 fingerspelling letters
- [ ] Numbers 0-20
- [ ] 50+ medical terms
- [ ] Common pronouns and question words
- [ ] JSON format, easily extensible

## Dependencies
C.2.2, C.1.3

## Output
\`src/data/sign-vocabulary.json\`

## Estimate
8 hours" \
    "phase-c,build,high-priority"

# C.3.3
create_task \
    "[C.3.3] Set up 3D avatar rendering with React Three Fiber" \
    "C" \
    "high" \
    "8h" \
    "## Description
Set up the 3D rendering pipeline for the signing avatar.

## Acceptance Criteria
- [ ] React Three Fiber installed and configured
- [ ] Basic avatar model loaded
- [ ] Avatar renders in component
- [ ] Performance optimized for real-time
- [ ] Lighting and camera configured

## Dependencies
C.1.2

## Output
\`src/components/ASLAvatar.tsx\`

## Estimate
8 hours" \
    "phase-c,build,high-priority"

# C.3.4
create_task \
    "[C.3.4] Build animation sequencer for sign playback" \
    "C" \
    "high" \
    "10h" \
    "## Description
Orchestrate multiple sign animations with smooth transitions.

## Acceptance Criteria
- [ ] Queues multiple signs
- [ ] Smooth blending between signs
- [ ] Handles fingerspelling sequences
- [ ] Adjustable playback speed
- [ ] Progress callback for UI sync
- [ ] Pause/resume support

## Dependencies
C.3.3

## Output
\`src/lib/animation-sequencer.ts\`

## Estimate
10 hours" \
    "phase-c,build,high-priority"

# C.3.5
create_task \
    "[C.3.5] Build avatar player UI with controls" \
    "C" \
    "high" \
    "6h" \
    "## Description
Patient-facing UI for watching the signing avatar.

## Acceptance Criteria
- [ ] Large, prominent avatar display
- [ ] Progress indicator for sentence
- [ ] Speed control (slower/faster)
- [ ] Replay button
- [ ] Current word/sign highlighted
- [ ] Text transcript sync

## Dependencies
C.3.4

## Output
\`src/components/AvatarPlayer.tsx\`

## Estimate
6 hours" \
    "phase-c,build,high-priority"

# C.3.6
create_task \
    "[C.3.6] Integrate avatar into patient view" \
    "C" \
    "high" \
    "4h" \
    "## Description
Add the avatar to the main patient view, showing doctor's speech as ASL.

## Acceptance Criteria
- [ ] Avatar appears when doctor speaks
- [ ] Position is visible but not blocking
- [ ] Can be minimized/maximized
- [ ] Text transcript still available
- [ ] Smooth transition when new speech arrives

## Dependencies
C.3.5, C.3.1

## Output
Updated \`src/components/CinematicVideoRoom.tsx\`

## Estimate
4 hours" \
    "phase-c,build,high-priority"

# C.3.7
create_task \
    "[C.3.7] Build fingerspelling animation system" \
    "C" \
    "medium" \
    "6h" \
    "## Description
When a word isn't in the vocabulary, fingerspell it letter by letter.

## Acceptance Criteria
- [ ] All 26 letters animated
- [ ] Smooth transitions between letters
- [ ] Appropriate pacing (not too fast)
- [ ] Works integrated with sign sequence

## Dependencies
C.3.3

## Output
\`src/lib/fingerspelling.ts\`

## Estimate
6 hours" \
    "phase-c,build"

# C.4.1
create_task \
    "[C.4.1] Test and optimize avatar rendering performance" \
    "C" \
    "high" \
    "4h" \
    "## Description
Ensure avatar renders smoothly at 60fps on target devices.

## Acceptance Criteria
- [ ] 60fps on desktop Chrome/Firefox/Safari
- [ ] 30fps minimum on mobile
- [ ] No frame drops during animation transitions
- [ ] Memory usage stable over time

## Dependencies
C.3.3

## Estimate
4 hours" \
    "phase-c,testing,high-priority"

# C.4.2
create_task \
    "[C.4.2] Test complete pipeline: Doctor speech → ASL avatar" \
    "C" \
    "high" \
    "4h" \
    "## Description
Test the entire flow from doctor speaking to patient seeing avatar.

## Acceptance Criteria
- [ ] Latency < 2 seconds total
- [ ] Text correctly converted to ASL
- [ ] Avatar plays correct signs
- [ ] Unknown words fingerspelled
- [ ] No crashes or hangs

## Dependencies
C.3.6

## Estimate
4 hours" \
    "phase-c,testing,high-priority"

# C.4.3
create_task \
    "[C.4.3] Conduct user testing with Deaf community members" \
    "C" \
    "high" \
    "8h" \
    "## Description
Get feedback from actual Deaf users on avatar accuracy and usability.

## Acceptance Criteria
- [ ] Test with 3+ Deaf individuals
- [ ] Document comprehension rate
- [ ] Collect qualitative feedback
- [ ] Identify top issues to fix
- [ ] Validate medical signs are accurate

## Dependencies
C.3.6

## Estimate
8 hours (coordination + testing)" \
    "phase-c,testing,high-priority"

# C.4.4
create_task \
    "[C.4.4] Write unit tests for english-to-asl.ts" \
    "C" \
    "high" \
    "4h" \
    "## Description
Test the English → ASL grammar conversion without needing ASL knowledge.

## Acceptance Criteria
- [ ] Test article removal (\"the\", \"a\", \"an\")
- [ ] Test time-word reordering
- [ ] Test question marker addition
- [ ] Test negation handling
- [ ] Test unknown word → fingerspelling fallback

## Why This Works Without Knowing ASL
We test that our RULES are applied correctly, not that the output is correct ASL.

## Dependencies
C.3.1

## Output
\`src/lib/__tests__/english-to-asl.test.ts\`

## Estimate
4 hours" \
    "phase-c,testing,high-priority"

# C.4.5
create_task \
    "[C.4.5] Write unit tests for animation-sequencer.ts" \
    "C" \
    "medium" \
    "3h" \
    "## Description
Test the animation queue and playback logic.

## Acceptance Criteria
- [ ] Test queue management
- [ ] Test playback controls (play, pause, resume)
- [ ] Test speed adjustments
- [ ] Test callback firing
- [ ] Test transition blending

## Dependencies
C.3.4

## Output
\`src/lib/__tests__/animation-sequencer.test.ts\`

## Estimate
3 hours" \
    "phase-c,testing"

# C.4.6
create_task \
    "[C.4.6] Hire Deaf consultant to review sign vocabulary" \
    "C" \
    "high" \
    "4h" \
    "## Description
We CANNOT validate ASL accuracy ourselves. Need a Deaf ASL expert.

## Acceptance Criteria
- [ ] Find qualified Deaf ASL consultant
- [ ] Review all 100+ signs in vocabulary database
- [ ] Document any incorrect or offensive signs
- [ ] Get recommendations for medical vocabulary gaps
- [ ] Budget: \$500-1500

## Where to Find Consultants
- Registry of Interpreters for the Deaf (RID)
- National Association of the Deaf (NAD)
- Gallaudet University
- Deaf-owned consulting firms

## Dependencies
C.3.2

## Assigned To
Caleb

## Estimate
4 hours coordination + consultant time" \
    "phase-c,testing,high-priority"

# C.5.1
create_task \
    "[C.5.1] CODE REVIEW: Avatar Research Complete" \
    "C" \
    "high" \
    "2h" \
    "## Review Checkpoint

## Checklist
- [ ] Text-to-ASL approach selected and documented
- [ ] Avatar technology selected
- [ ] Architecture designed and approved
- [ ] Database schema defined
- [ ] GO/NO-GO: Proceed with build?

## Dependencies
C.1.*, C.2.*

## Assigned To
Caleb" \
    "phase-c,review,high-priority"

# C.5.2
create_task \
    "[C.5.2] CODE REVIEW: Avatar Core Build Complete" \
    "C" \
    "high" \
    "3h" \
    "## Review Checkpoint

## Checklist
- [ ] English-to-ASL translation working
- [ ] Vocabulary database populated
- [ ] 3D avatar renders correctly
- [ ] Animation sequencer works
- [ ] Player UI functional
- [ ] TypeScript compiles clean

## Dependencies
C.3.1-C.3.5

## Assigned To
Caleb" \
    "phase-c,review,high-priority"

# C.5.3
create_task \
    "[C.5.3] CODE REVIEW: Full Avatar Integration" \
    "C" \
    "high" \
    "2h" \
    "## Review Checkpoint

## Checklist
- [ ] Avatar integrated in patient view
- [ ] Fingerspelling working
- [ ] Performance acceptable
- [ ] End-to-end pipeline tested
- [ ] Ready for user testing

## Dependencies
C.3.6, C.3.7, C.4.1, C.4.2

## Assigned To
Caleb" \
    "phase-c,review,high-priority"

echo ""
echo "=========================================="
echo "✅ All issues created!"
echo "=========================================="
echo ""
echo "View your project: https://github.com/users/hello-caleb/projects/4"
echo ""
echo "Total tasks created:"
echo "  Phase A: 18 tasks"
echo "  Phase B: 7 tasks"
echo "  Phase C: 21 tasks"
echo "  Total: 46 tasks"
