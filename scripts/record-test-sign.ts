#!/usr/bin/env npx tsx

/**
 * Record Test Sign Script
 * 
 * Records a video clip from the webcam for ASL testing.
 * Uses ffmpeg to capture video.
 * 
 * Usage:
 *   npm run record-test-sign -- --sign pain
 */

import * as fs from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';

const args = process.argv.slice(2);
const signIndex = args.indexOf('--sign');
const signName = signIndex !== -1 ? args[signIndex + 1] : null;

if (!signName) {
    console.error('❌ Error: Please specify a sign name with --sign');
    console.error('Example: npm run record-test-sign -- --sign pain');
    process.exit(1);
}

// Configuration
const DURATION_SECONDS = 3;
const OUTPUT_DIR = path.join(process.cwd(), 'test-data', 'asl-videos');
const COUNTDOWN_SECONDS = 3;

async function main() {
    // Ensure output directory exists
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // Find next variant number
    const existingFiles = fs.readdirSync(OUTPUT_DIR)
        .filter(f => f.startsWith(`${signName}_`) && f.endsWith('.mp4'));

    let nextVariant = 1;
    if (existingFiles.length > 0) {
        const variants = existingFiles.map(f => {
            const match = f.match(/_(\d+)\.mp4/);
            return match ? parseInt(match[1]) : 0;
        });
        nextVariant = Math.max(...variants) + 1;
    }

    const filename = `${signName}_${String(nextVariant).padStart(2, '0')}.mp4`;
    const outputPath = path.join(OUTPUT_DIR, filename);

    console.log(`\n📹 ASL Recorder - Sign: "${signName}"`);
    console.log('----------------------------------------');
    console.log(`Output: ${filename}`);
    console.log(`Duration: ${DURATION_SECONDS} seconds`);
    console.log('\nGet ready! Recording starts in:');

    // Countdown
    for (let i = COUNTDOWN_SECONDS; i > 0; i--) {
        process.stdout.write(`${i}... `);
        await new Promise(r => setTimeout(r, 1000));
    }
    console.log('GO! 🎬\n');

    // Detect OS for ffmpeg command
    const platform = process.platform;
    let command = 'ffmpeg';
    let cmdArgs: string[] = [];

    if (platform === 'darwin') { // macOS
        // Use AVFoundation. We assume "FaceTime HD Camera" or default index '0'
        // Using 'default' often works for video
        cmdArgs = [
            '-f', 'avfoundation',
            '-framerate', '30',
            '-video_size', '1280x720',
            '-i', 'default', // Try default camera
            '-t', String(DURATION_SECONDS),
            '-y', // Overwrite if exists
            outputPath
        ];
    } else if (platform === 'win32') { // Windows
        cmdArgs = [
            '-f', 'dshow',
            '-i', 'video=Integrated Camera', // This name varies! simplified guess
            '-t', String(DURATION_SECONDS),
            '-y',
            outputPath
        ];
    } else { // Linux
        cmdArgs = [
            '-f', 'v4l2',
            '-framerate', '25',
            '-video_size', '640x480',
            '-i', '/dev/video0',
            '-t', String(DURATION_SECONDS),
            '-y',
            outputPath
        ];
    }

    console.log(`Executing: ffmpeg ${cmdArgs.join(' ')}`);

    const ffmpeg = spawn(command, cmdArgs);

    ffmpeg.stderr.on('data', (data) => {
        // ffmpeg outputs progress to stderr
        // console.log(data.toString()); 
    });

    ffmpeg.on('close', (code) => {
        if (code === 0) {
            console.log('\n✅ Recording generated!');
            console.log(`Path: ${outputPath}`);
            console.log('\nTo test this sign:');
            console.log(`npm run test:asl-accuracy -- --sign ${signName}`);

            // Add to package.json scripts? No, it's already there or implied.
        } else {
            console.error(`\n❌ Recording failed with code ${code}`);
            console.error('You may need to allow Terminal/VSCode access to the Camera.');
            console.error('If on macOS, check System Settings > Privacy & Security > Camera.');

            // Fallback instruction
            console.log('\nAlternative: Record a video manually and save it as:');
            console.log(outputPath);
        }
    });

    ffmpeg.on('error', (err) => {
        console.error('Failed to start ffmpeg:', err);
        console.error('Is ffmpeg installed? (brew install ffmpeg)');
    });
}

main();
