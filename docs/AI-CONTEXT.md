# HealthBridge Project Context for AI Assistants

**Last Updated:** February 9, 2026

## 1. Project Overview
**HealthBridge** is a real-time medical translation and assistance platform designed to bridge the gap between deaf/hard-of-hearing patients and healthcare providers.

*   **Core Function:** Real-time ASL-to-Text translation using Gemini Vision.
*   **Video Infrastructure:** LiveKit (WebRTC).
*   **AI Engine:** Google Gemini (Multimodal).

## 2. Technology Stack
*   **Framework:** Next.js 14 (App Router)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS (Glassmorphism aesthetics)
*   **AI SDK:** `@google/generative-ai`
*   **Real-time Video:** LiveKit (`@livekit/components-react`)
*   **State Management:** React Hooks + Context

## 3. Key Features & Architecture

### A. ASL Translation Pipeline
*   **Input**: `ASLInput.tsx` captures video frames.
*   **Processing**: `asl-translation-service.ts` sends frames to Gemini 3.
*   **Output**: Streamed text to `CinematicVideoRoom.tsx` (Patient) and `DoctorDashboard.tsx` (Doctor).
*   **Models**: `gemini-3-flash-preview` (Default) / `gemini-3-pro-preview` (Accuracy).

### B. Medical Object Triage (NEW - Gemini 3 Feature)
*   **Goal**: Identify pills, wounds, or devices via camera.
*   **Model**: `gemini-3-flash-preview` (Multimodal).
*   **Component**: `MedicalObjectScanner.tsx`.
*   **Service**: `analyzeMedicalObject` in `gemini-3-service.ts`.
*   **Status**: Implemented and Verified.

### C. Patient History Smart Synthesis (NEW - Gemini 3 Feature)
*   **Goal**: Allow doctors to query patient records using natural language.
*   **Model**: `gemini-3-pro-preview` (Reasoning).
*   **Component**: `PatientHistoryModal.tsx`.
*   **Service**: `queryPatientHistory` in `gemini-3-service.ts`.
*   **Data**: Mock data in `src/data/mock-patient-history.ts`.
*   **Status**: Implemented and Verified.

## 4. Critical File Structure
```
src/
├── app/
│   ├── session/page.tsx       # Patient Video Room
│   └── doctor/page.tsx        # Doctor Dashboard
├── components/
│   ├── CinematicVideoRoom.tsx # Main Patient UI
│   ├── DoctorDashboard.tsx    # Main Doctor UI
│   ├── MedicalObjectScanner.tsx # Triage Feature
│   └── PatientHistoryModal.tsx  # History Query Feature
├── lib/
│   ├── gemini-3-service.ts    # New Gemini 3 features
│   └── asl-translation-service.ts # Core ASL logic
└── data/
    └── mock-patient-history.ts # Test data
```

## 5. Current Status & Next Steps
*   **Completed**:
    *   Core ASL Translation.
    *   Doctor Dashboard with history & alerts.
    *   Medical Object Triage.
    *   Patient History Query.
*   **To Do**:
    *   End-to-end testing of the full flow.
    *   Deployment to Vercel (Production settings).
    *   Recording the demo video.

## 6. Development Commands
*   `npm run dev`: Start local server.
*   `npx tsx scripts/test-medical-object.ts <image>`: Test triage.
*   `npx tsx scripts/test-history-query.ts`: Test history query.
