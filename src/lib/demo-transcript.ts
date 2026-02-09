/**
 * Demo transcript for HealthBridge hackathon demonstration
 * This simulates a cardiology consultation between Dr. Smith and a patient
 * with medical terms that trigger the jargon detection system.
 * Includes both audio transcription AND ASL input simulation.
 */

export interface DemoLine {
    speaker: 'doctor' | 'patient';
    text: string;
    delay: number; // ms to wait before showing this line
    inputType?: 'audio' | 'asl'; // How the input was received (default: audio)
    medicalTerms?: {
        term: string;
        definition: string;
    }[];
}

export const CARDIOLOGY_DEMO_TRANSCRIPT: DemoLine[] = [
    {
        speaker: 'doctor',
        text: "Good morning! I'm Dr. Smith. I've reviewed your test results from last week. How are you feeling today?",
        delay: 0,
        inputType: 'audio',
    },
    {
        speaker: 'patient',
        text: "Hi Doctor. I've been a bit worried about the results honestly. Still having some chest tightness.",
        delay: 3500,
        inputType: 'asl', // Patient signs their response
    },
    {
        speaker: 'doctor',
        text: "I understand your concern. Let me explain what we found. Your ECG showed some arrhythmia - that's an irregular heartbeat pattern.",
        delay: 4000,
        inputType: 'audio',
        medicalTerms: [
            {
                term: 'ECG',
                definition: 'Electrocardiogram - a test that records the electrical activity of your heart using small sensors attached to your chest',
            },
            {
                term: 'Arrhythmia',
                definition: 'An irregular heartbeat - your heart may beat too fast, too slow, or with an uneven rhythm',
            },
        ],
    },
    {
        speaker: 'patient',
        text: "Irregular heartbeat? Is that serious?",
        delay: 5000,
        inputType: 'asl', // Patient signs their question
    },
    {
        speaker: 'doctor',
        text: "In your case, it's a type called atrial fibrillation, or AFib for short. Your atria - the upper chambers of your heart - are beating irregularly.",
        delay: 3500,
        inputType: 'audio',
        medicalTerms: [
            {
                term: 'Atrial Fibrillation',
                definition: 'A common heart rhythm disorder where the upper heart chambers (atria) beat chaotically and out of sync with the lower chambers',
            },
            {
                term: 'Atria',
                definition: 'The two upper chambers of your heart that receive blood from your body and lungs',
            },
        ],
    },
    {
        speaker: 'doctor',
        text: "The good news is we caught it early. I'm going to prescribe a beta blocker to help control your heart rate and rhythm.",
        delay: 5000,
        inputType: 'audio',
        medicalTerms: [
            {
                term: 'Beta Blocker',
                definition: 'A medication that slows your heart rate and reduces blood pressure by blocking the effects of adrenaline',
            },
        ],
    },
    {
        speaker: 'patient',
        text: "A beta blocker? Will that have side effects?",
        delay: 4000,
        inputType: 'asl', // Patient signs their question
    },
    {
        speaker: 'doctor',
        text: "Some patients experience fatigue or dizziness initially, but these usually improve. We'll also do an echocardiogram to look at your heart's structure and function.",
        delay: 4500,
        inputType: 'audio',
        medicalTerms: [
            {
                term: 'Echocardiogram',
                definition: "An ultrasound test that uses sound waves to create images of your heart, showing how it's pumping blood",
            },
        ],
    },
    {
        speaker: 'patient',
        text: "Is that like an ultrasound for the heart?",
        delay: 3500,
        inputType: 'asl', // Patient signs their question
    },
    {
        speaker: 'doctor',
        text: "Exactly right! It's painless and gives us a clear picture. We need to check your ejection fraction - that measures how well your heart pumps blood with each beat.",
        delay: 4000,
        inputType: 'audio',
        medicalTerms: [
            {
                term: 'Ejection Fraction',
                definition: 'The percentage of blood pumped out of your heart with each beat. Normal is 55-70%. Lower numbers may indicate heart weakness.',
            },
        ],
    },
    {
        speaker: 'doctor',
        text: "Given the AFib, I also want to discuss anticoagulation therapy - blood thinners - to reduce your stroke risk.",
        delay: 4500,
        inputType: 'audio',
        medicalTerms: [
            {
                term: 'Anticoagulation',
                definition: 'Treatment with blood-thinning medications to prevent blood clots from forming',
            },
        ],
    },
    {
        speaker: 'patient',
        text: "Blood thinners? I've heard those can be risky.",
        delay: 3500,
        inputType: 'asl', // Patient signs concern
    },
    {
        speaker: 'doctor',
        text: "With AFib, the benefit usually outweighs the risk. Without treatment, blood can pool in the atria and form clots that could travel to the brain. We'll use your CHA₂DS₂-VASc score to determine your exact risk level.",
        delay: 5500,
        inputType: 'audio',
        medicalTerms: [
            {
                term: 'CHA₂DS₂-VASc Score',
                definition: 'A scoring system doctors use to estimate stroke risk in patients with AFib, based on factors like age, gender, and health history',
            },
        ],
    },
    {
        speaker: 'patient',
        text: "That's a lot to take in. What about lifestyle changes?",
        delay: 4000,
        inputType: 'asl', // Patient signs question
    },
    {
        speaker: 'doctor',
        text: "Great question! Reducing caffeine and alcohol can help. Regular moderate exercise, managing stress, and maintaining a healthy weight all support your cardiovascular health.",
        delay: 4500,
        inputType: 'audio',
        medicalTerms: [
            {
                term: 'Cardiovascular',
                definition: 'Relating to your heart and blood vessels - the system that pumps and circulates blood throughout your body',
            },
        ],
    },
    {
        speaker: 'doctor',
        text: "I'm also referring you to cardiac rehab - a supervised exercise and education program. It's very effective for patients with heart conditions.",
        delay: 4000,
        inputType: 'audio',
        medicalTerms: [
            {
                term: 'Cardiac Rehab',
                definition: 'A medically supervised program combining exercise training, heart-healthy education, and stress reduction to improve heart health',
            },
        ],
    },
    {
        speaker: 'patient',
        text: "That sounds helpful. When should I come back for a follow-up?",
        delay: 3500,
        inputType: 'asl', // Patient signs question
    },
    {
        speaker: 'doctor',
        text: "Let's schedule the echocardiogram for next week and a follow-up appointment in two weeks to review everything. We'll monitor your response to the beta blocker and adjust as needed.",
        delay: 4500,
        inputType: 'audio',
    },
    {
        speaker: 'patient',
        text: "Thank you for explaining everything so clearly, Dr. Smith. I feel much better understanding what's going on.",
        delay: 4000,
        inputType: 'asl', // Patient signs gratitude
    },
    {
        speaker: 'doctor',
        text: "Of course! That's what I'm here for. Remember, AFib is very manageable with the right treatment. Any questions before we wrap up?",
        delay: 4000,
        inputType: 'audio',
    },
];

export function getTotalDemoDuration(): number {
    const lines = CARDIOLOGY_DEMO_TRANSCRIPT;
    const lastLine = lines[lines.length - 1];
    // Total duration is the last line's delay plus some extra time to read it
    return lastLine.delay + 5000;
}
