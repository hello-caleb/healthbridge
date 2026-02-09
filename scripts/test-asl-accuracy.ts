#!/usr/bin/env npx tsx
/**
 * ASL Accuracy Test Script
 * 
 * Tests the ASL translation pipeline against ground truth labels.
 * 
 * Usage:
 *   npx tsx scripts/test-asl-accuracy.ts
 *   npm run test:asl-accuracy
 * 
 * Options:
 *   --verbose    Show detailed output for each test
 *   --json       Output results as JSON
 *   --sign NAME  Test only a specific sign
 */

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Types
interface SignTestCase {
    id: string;
    sign: string;
    category: string;
    priority: 'high' | 'medium';
    expected_translation: string;
    alternate_translations: string[];
    video_file: string;
    source: string;
    wlasl_gloss: string;
    notes: string;
}

interface GroundTruth {
    version: string;
    created: string;
    description: string;
    signs: SignTestCase[];
    test_config: {
        accuracy_thresholds: {
            minimum_acceptable: number;
            target: number;
            excellent: number;
        };
        scoring: {
            exact_match: number;
            alternate_match: number;
            partial_match: number;
            no_match: number;
        };
    };
}

interface TestResult {
    id: string;
    sign: string;
    expected: string;
    actual: string | null;
    score: number;
    match_type: 'exact' | 'alternate' | 'partial' | 'none' | 'error' | 'missing_video';
    latency_ms: number;
    error?: string;
}

interface TestReport {
    timestamp: string;
    total_tests: number;
    passed: number;
    failed: number;
    accuracy: number;
    average_latency_ms: number;
    results: TestResult[];
    by_category: Record<string, { accuracy: number; count: number }>;
    by_priority: Record<string, { accuracy: number; count: number }>;
    thresholds: {
        minimum: number;
        target: number;
        excellent: number;
        status: 'below_minimum' | 'acceptable' | 'target' | 'excellent';
    };
}

// Configuration
const TEST_DATA_PATH = path.join(process.cwd(), 'test-data', 'asl-videos');
const GROUND_TRUTH_PATH = path.join(TEST_DATA_PATH, 'ground-truth.json');
const RESULTS_PATH = path.join(TEST_DATA_PATH, 'test-results.json');

// Parse command line arguments
const args = process.argv.slice(2);
const getArg = (name: string) => {
    const index = args.indexOf(name);
    return index !== -1 && index + 1 < args.length ? args[index + 1] : null;
};

const signArg = getArg('--sign');
const verbose = args.includes('--verbose');
const jsonOutput = args.includes('--json'); // Keep jsonOutput as it was not removed by the instruction
const variantArg = getArg('--variant') || 'baseline';
const targetSign = signArg; // Use signArg instead of the problematic signIndex logic

/**
 * Load ground truth data
 */
function loadGroundTruth(): GroundTruth {
    const data = fs.readFileSync(GROUND_TRUTH_PATH, 'utf-8');
    return JSON.parse(data) as GroundTruth;
}

/**
 * Extract frames from video file
 */
async function extractFrames(videoPath: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
        const frames: string[] = [];
        const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
        const ffmpeg = require('fluent-ffmpeg');
        ffmpeg.setFfmpegPath(ffmpegPath);

        // Create temporary directory for frames
        const tempDir = path.join(process.cwd(), 'temp_frames_' + Date.now());
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir);
        }

        ffmpeg(videoPath)
            .fps(10) // Extract 10 frames per second
            .size('480x?') // Resize to 480p width, maintain aspect ratio
            .output(path.join(tempDir, 'frame-%d.jpg'))
            .on('end', async () => {
                try {
                    // Read all generated frame files
                    const files = fs.readdirSync(tempDir)
                        .filter(f => f.endsWith('.jpg'))
                        .sort((a, b) => {
                            // Sort numerically: frame-1.jpg, frame-2.jpg
                            const numA = parseInt(a.match(/(\d+)/)?.[0] || '0');
                            const numB = parseInt(b.match(/(\d+)/)?.[0] || '0');
                            return numA - numB;
                        });

                    // Convert to base64
                    for (const file of files) {
                        const filePath = path.join(tempDir, file);
                        const buffer = fs.readFileSync(filePath);
                        frames.push(buffer.toString('base64'));
                    }

                    // Cleanup
                    fs.rmSync(tempDir, { recursive: true, force: true });
                    resolve(frames);
                } catch (err) {
                    reject(err);
                }
            })
            .on('error', (err: any) => {
                // Cleanup on error
                if (fs.existsSync(tempDir)) {
                    fs.rmSync(tempDir, { recursive: true, force: true });
                }
                reject(err);
            })
            .run();
    });
}

/**
 * Real ASL translation using video file
 */
async function translateSign(videoPath: string): Promise<{ translation: string; latency: number }> {
    const startTime = Date.now();

    // Check if video file exists
    if (!fs.existsSync(videoPath)) {
        throw new Error(`Video file not found: ${videoPath}`);
    }

    try {
        if (verbose) console.log(`  Processing video: ${path.basename(videoPath)}`);

        // 1. Extract frames from video
        const base64Frames = await extractFrames(videoPath);

        if (base64Frames.length === 0) {
            throw new Error('No frames extracted from video');
        }

        if (verbose) console.log(`  Extracted ${base64Frames.length} frames`);

        // 2. Convert to HandFrame format expected by service
        // Note: We don't have landmarks for pre-recorded video unless we run MediaPipe here.
        // The service uses landmarks for adaptive selection. 
        // For testing, we'll create mock HandFrames with just image data.
        // This means adaptive selection based on motion won't work fully, 
        // but Gemin 2.0 Flash is smart enough to handle raw frames.

        // Dynamic import to avoid issues if run outside nextjs context
        // We need to import the service. Since we are running in tsx, we can import directly.
        // However, we need to handle the alias '@/' manually if tsconfig-paths isn't set up for tsx.
        // For this script, we'll try to import relative path.
        const { translateASLFrames, setASLConfig } = await import('../src/lib/asl-translation-service');

        // Mock HandFrames
        const handFrames: any[] = base64Frames.map((data, index) => ({
            timestamp: startTime + (index * 100), // 10fps = 100ms
            imageData: data,
            landmarks: null // We skip landmark detection for now to speed up test
        }));

        // Configure service for testing
        setASLConfig({
            maxFrames: 12,
            verbose: verbose,
            useAdaptiveSelection: false, // vital: disable adaptive since we have no landmarks
            promptVariant: variantArg as any
        });

        // 3. Call Translation Service
        const result = await translateASLFrames(handFrames);

        return {
            translation: result.translation,
            latency: result.latencyMs || (Date.now() - startTime),
        };

    } catch (error) {
        console.error('Translation error:', error);
        throw error;
    }
}

/**
 * Score a translation result against ground truth
 */
function scoreResult(
    actual: string,
    expected: string,
    alternates: string[],
    scoring: GroundTruth['test_config']['scoring']
): { score: number; match_type: TestResult['match_type'] } {
    const normalized = actual.toLowerCase().trim();
    const expectedNorm = expected.toLowerCase().trim();

    // Exact match
    if (normalized === expectedNorm) {
        return { score: scoring.exact_match, match_type: 'exact' };
    }

    // Alternate match
    if (alternates.some(alt => normalized === alt.toLowerCase().trim())) {
        return { score: scoring.alternate_match, match_type: 'alternate' };
    }

    // Partial match (contains expected or alternate)
    if (normalized.includes(expectedNorm) ||
        alternates.some(alt => normalized.includes(alt.toLowerCase().trim()))) {
        return { score: scoring.partial_match, match_type: 'partial' };
    }

    // No match
    return { score: scoring.no_match, match_type: 'none' };
}

/**
 * Run all tests
 */
async function runTests(): Promise<TestReport> {
    console.log('🤟 ASL Accuracy Test Suite');
    console.log('==========================\n');

    const groundTruth = loadGroundTruth();
    const results: TestResult[] = [];
    let totalScore = 0;
    let totalLatency = 0;

    // Load ground truth
    let tests = groundTruth.signs;

    // Filter by sign if specified
    if (targetSign) {
        tests = tests.filter(t => t.sign.toLowerCase() === targetSign.toLowerCase());
        if (tests.length === 0) {
            console.error(`Error: No test cases found for sign "${targetSign}"`);
            process.exit(1);
        }
    }
    console.log(`Running ${tests.length} tests...\n`);

    for (const testCase of tests) {
        const videoPath = path.join(TEST_DATA_PATH, testCase.video_file);

        try {
            // Check if video exists
            if (!fs.existsSync(videoPath)) {
                const result: TestResult = {
                    id: testCase.id,
                    sign: testCase.sign,
                    expected: testCase.expected_translation,
                    actual: null,
                    score: 0,
                    match_type: 'missing_video',
                    latency_ms: 0,
                    error: `Video file not found: ${testCase.video_file}`,
                };
                results.push(result);

                if (verbose) {
                    console.log(`⚠️  ${testCase.sign}: MISSING VIDEO`);
                }
                continue;
            }

            // Run translation
            const { translation, latency } = await translateSign(videoPath);
            totalLatency += latency;

            // Score result
            const { score, match_type } = scoreResult(
                translation,
                testCase.expected_translation,
                testCase.alternate_translations,
                groundTruth.test_config.scoring
            );

            totalScore += score;

            const result: TestResult = {
                id: testCase.id,
                sign: testCase.sign,
                expected: testCase.expected_translation,
                actual: translation,
                score,
                match_type,
                latency_ms: latency,
            };
            results.push(result);

            // Log result
            const icon = score >= 0.8 ? '✅' : score > 0 ? '🟡' : '❌';
            if (verbose) {
                console.log(`${icon} ${testCase.sign}: "${translation}" (${match_type}, ${latency}ms)`);
            } else {
                process.stdout.write(icon);
            }

        } catch (error) {
            const result: TestResult = {
                id: testCase.id,
                sign: testCase.sign,
                expected: testCase.expected_translation,
                actual: null,
                score: 0,
                match_type: 'error',
                latency_ms: 0,
                error: error instanceof Error ? error.message : String(error),
            };
            results.push(result);

            if (verbose) {
                console.log(`❌ ${testCase.sign}: ERROR - ${result.error}`);
            } else {
                process.stdout.write('❌');
            }
        }
    }

    if (!verbose) {
        console.log('\n');
    }

    // Calculate metrics
    const validResults = results.filter(r => r.match_type !== 'missing_video' && r.match_type !== 'error');
    const accuracy = validResults.length > 0
        ? totalScore / validResults.length
        : 0;
    const avgLatency = validResults.length > 0
        ? totalLatency / validResults.length
        : 0;

    // Group by category
    const byCategory: Record<string, { total: number; score: number; count: number }> = {};
    const byPriority: Record<string, { total: number; score: number; count: number }> = {};

    for (const testCase of groundTruth.signs) {
        const result = results.find(r => r.id === testCase.id);
        if (!result || result.match_type === 'missing_video' || result.match_type === 'error') continue;

        // By category
        if (!byCategory[testCase.category]) {
            byCategory[testCase.category] = { total: 0, score: 0, count: 0 };
        }
        byCategory[testCase.category].total++;
        byCategory[testCase.category].score += result.score;
        byCategory[testCase.category].count++;

        // By priority
        if (!byPriority[testCase.priority]) {
            byPriority[testCase.priority] = { total: 0, score: 0, count: 0 };
        }
        byPriority[testCase.priority].total++;
        byPriority[testCase.priority].score += result.score;
        byPriority[testCase.priority].count++;
    }

    // Convert to accuracy percentages
    const categoryAccuracy: Record<string, { accuracy: number; count: number }> = {};
    for (const [cat, data] of Object.entries(byCategory)) {
        categoryAccuracy[cat] = {
            accuracy: data.count > 0 ? data.score / data.count : 0,
            count: data.count,
        };
    }

    const priorityAccuracy: Record<string, { accuracy: number; count: number }> = {};
    for (const [pri, data] of Object.entries(byPriority)) {
        priorityAccuracy[pri] = {
            accuracy: data.count > 0 ? data.score / data.count : 0,
            count: data.count,
        };
    }

    // Determine threshold status
    const thresholds = groundTruth.test_config.accuracy_thresholds;
    let status: TestReport['thresholds']['status'];
    if (accuracy >= thresholds.excellent) {
        status = 'excellent';
    } else if (accuracy >= thresholds.target) {
        status = 'target';
    } else if (accuracy >= thresholds.minimum_acceptable) {
        status = 'acceptable';
    } else {
        status = 'below_minimum';
    }

    const report: TestReport = {
        timestamp: new Date().toISOString(),
        total_tests: tests.length,
        passed: results.filter(r => r.score >= 0.8).length,
        failed: results.filter(r => r.score < 0.8).length,
        accuracy,
        average_latency_ms: avgLatency,
        results,
        by_category: categoryAccuracy,
        by_priority: priorityAccuracy,
        thresholds: {
            minimum: thresholds.minimum_acceptable,
            target: thresholds.target,
            excellent: thresholds.excellent,
            status,
        },
    };

    return report;
}

/**
 * Print report to console
 */
function printReport(report: TestReport): void {
    console.log('📊 Test Results');
    console.log('===============\n');

    console.log(`Total Tests: ${report.total_tests}`);
    console.log(`Passed: ${report.passed}`);
    console.log(`Failed: ${report.failed}`);
    console.log(`Missing Videos: ${report.results.filter(r => r.match_type === 'missing_video').length}`);
    console.log(`Errors: ${report.results.filter(r => r.match_type === 'error').length}`);
    console.log();

    const accuracyPct = (report.accuracy * 100).toFixed(1);
    const statusEmoji = {
        excellent: '🏆',
        target: '🎯',
        acceptable: '✅',
        below_minimum: '⚠️',
    }[report.thresholds.status];

    console.log(`Accuracy: ${accuracyPct}% ${statusEmoji}`);
    console.log(`Status: ${report.thresholds.status.toUpperCase()}`);
    console.log(`Average Latency: ${report.average_latency_ms.toFixed(0)}ms`);
    console.log();

    console.log('Thresholds:');
    console.log(`  Minimum: ${(report.thresholds.minimum * 100).toFixed(0)}%`);
    console.log(`  Target:  ${(report.thresholds.target * 100).toFixed(0)}%`);
    console.log(`  Excellent: ${(report.thresholds.excellent * 100).toFixed(0)}%`);
    console.log();

    if (Object.keys(report.by_category).length > 0) {
        console.log('By Category:');
        for (const [cat, data] of Object.entries(report.by_category)) {
            console.log(`  ${cat}: ${(data.accuracy * 100).toFixed(1)}% (${data.count} tests)`);
        }
        console.log();
    }

    if (Object.keys(report.by_priority).length > 0) {
        console.log('By Priority:');
        for (const [pri, data] of Object.entries(report.by_priority)) {
            console.log(`  ${pri}: ${(data.accuracy * 100).toFixed(1)}% (${data.count} tests)`);
        }
        console.log();
    }

    // Show failures
    const failures = report.results.filter(r => r.score < 0.8 && r.match_type !== 'missing_video');
    if (failures.length > 0) {
        console.log('❌ Failed Tests:');
        for (const f of failures) {
            console.log(`  ${f.sign}: expected "${f.expected}", got "${f.actual}" (${f.match_type})`);
        }
        console.log();
    }
}

/**
 * Main entry point
 */
async function main(): Promise<void> {
    try {
        const report = await runTests();

        // Save results
        fs.writeFileSync(RESULTS_PATH, JSON.stringify(report, null, 2));
        console.log(`Results saved to: ${RESULTS_PATH}\n`);

        if (jsonOutput) {
            console.log(JSON.stringify(report, null, 2));
        } else {
            printReport(report);
        }

        // Exit with error code if below minimum
        if (report.thresholds.status === 'below_minimum') {
            console.log('⚠️  Accuracy is below minimum acceptable threshold!');
            process.exit(1);
        }

    } catch (error) {
        console.error('Fatal error:', error);
        process.exit(1);
    }
}

main();
