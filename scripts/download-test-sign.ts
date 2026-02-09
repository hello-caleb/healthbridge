#!/usr/bin/env npx tsx

/**
 * Download Test Sign Script
 * 
 * Downloads a video from YouTube and trims it for ASL testing.
 * Uses youtube-dl-exec (wrapper for yt-dlp) for downloading and trimming.
 * 
 * Usage:
 *   npm run download-test-sign -- --url <youtube-url> --sign <sign-name> [--start <seconds>] [--duration <seconds>]
 * 
 * Example:
 *   npm run download-test-sign -- --url "https://youtu.be/..." --sign pain --start 32 --duration 3
 */

import * as fs from 'fs';
import * as path from 'path';

// Parse args
const args = process.argv.slice(2);
const getArg = (name: string) => {
    const index = args.indexOf(name);
    return index !== -1 && index + 1 < args.length ? args[index + 1] : null;
};

const url = getArg('--url');
const signName = getArg('--sign');
const startStr = getArg('--start');
const durationStr = getArg('--duration') || '3'; // Default 3 seconds

if (!url || !signName) {
    console.error('❌ Usage: npm run download-test-sign -- --url <url> --sign <name> [--start <seconds>]');
    process.exit(1);
}

const startTime = startStr ? parseFloat(startStr) : 0;
const duration = parseFloat(durationStr);
const OUTPUT_DIR = path.join(process.cwd(), 'test-data', 'asl-videos');

async function main() {
    try {
        // Ensure output directory exists
        if (!fs.existsSync(OUTPUT_DIR)) {
            fs.mkdirSync(OUTPUT_DIR, { recursive: true });
        }

        // Determine output filename
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

        console.log(`\n📥 Downloading from YouTube: ${url}`);
        console.log(`Testing Sign: "${signName}"`);
        if (startTime > 0) console.log(`Trimming: Start at ${startTime}s, Duration ${duration}s`);

        // Use youtube-dl-exec's binary directly
        const ytDlpPath = path.resolve(process.cwd(), 'node_modules', 'youtube-dl-exec', 'bin', 'yt-dlp');
        const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;

        // Simpler approach: Download with yt-dlp using --download-sections
        // format: "*START-END"
        const section = `*${startTime}-${startTime + duration}`;

        console.log(`Running yt-dlp from: ${ytDlpPath}`);
        console.log(`Using ffmpeg from: ${ffmpegPath}`);

        // Use child_process.spawn directly to handle spaces in paths correctly
        const { spawn } = require('child_process');

        const ytArgs = [
            url,
            '--output', outputPath,
            '--ffmpeg-location', ffmpegPath,
            '--format', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
            '--download-sections', section,
            '--force-overwrites',
            '--no-check-certificates'
        ];

        await new Promise((resolve, reject) => {
            const child = spawn(ytDlpPath, ytArgs, {
                stdio: 'inherit'
            });

            child.on('close', (code: number) => {
                if (code === 0) resolve(code);
                else reject(new Error(`yt-dlp exited with code ${code}`));
            });

            child.on('error', (err: any) => {
                reject(err);
            });
        });

        console.log(`\n🎉 Success! Video saved to: ${outputPath}`);
        console.log(`\nTo test this sign:`);
        console.log(`npm run test:asl-accuracy -- --sign ${signName} --verbose`);

    } catch (error) {
        console.error('❌ Error:', error);
        console.error('Ensure python3 is installed on your system (required for yt-dlp).');
        process.exit(1);
    }
}

main();
