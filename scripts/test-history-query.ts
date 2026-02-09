
import { MOCK_PATIENT_HISTORY } from '../src/data/mock-patient-history';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
    // Dynamically import service after env vars are loaded
    const { queryPatientHistory } = await import('../src/lib/gemini-3-service');

    console.log("Testing Patient History Logic with Gemini 1.5 Pro...");

    const question = "Does the patient have any allergies?";
    console.log(`\nQuestion: ${question}`);
    console.log("Analyzing history...");

    const answer = await queryPatientHistory(question, MOCK_PATIENT_HISTORY);

    console.log("\n--- Answer ---");
    console.log(answer);
    console.log("----------------");

    if (answer && answer.toLowerCase().includes("penicillin")) {
        console.log("\nPASS: Correctly identified Penicillin allergy.");
    } else {
        console.error("\nFAIL: Did not identify expected allergy.");
    }
}

run().catch(console.error);
