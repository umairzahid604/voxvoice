import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

// Types
export interface AudioProcessingOptions {
    volume?: number;        // 0.0 to 2.0, default 1.0
    playbackSpeed?: number; // 0.5 to 2.0, default 1.0
}

/**
 * Validate audio processing options
 */
export function validateOptions(options: AudioProcessingOptions): void {
    if (options.volume !== undefined) {
        if (options.volume < 0 || options.volume > 2) {
            throw new Error('Volume must be between 0.0 and 2.0');
        }
    }
    if (options.playbackSpeed !== undefined) {
        if (options.playbackSpeed < 0.5 || options.playbackSpeed > 2) {
            throw new Error('Playback speed must be between 0.5 and 2.0');
        }
    }
}

/**
 * Process audio using fluent-ffmpeg (Node.js)
 */
export async function processAudio(
    audioBlob: Blob,
    options: AudioProcessingOptions
): Promise<Blob> {
    const { volume = 1.0, playbackSpeed = 1.0 } = options;

    // Skip processing if no changes needed
    if (volume === 1.0 && playbackSpeed === 1.0) {
        return audioBlob;
    }

    // Dynamic imports for Node.js modules
    const ffmpegInstaller = await import('@ffmpeg-installer/ffmpeg');
    const ffmpegModule = await import('fluent-ffmpeg');
    const ffmpeg = ffmpegModule.default || ffmpegModule;

    // Set ffmpeg path
    ffmpeg.setFfmpegPath(ffmpegInstaller.path);

    // Create temp files
    const tempDir = os.tmpdir();
    const inputPath = path.join(tempDir, `voxvoice_input_${Date.now()}.wav`);
    const outputPath = path.join(tempDir, `voxvoice_output_${Date.now()}.wav`);

    try {
        // Write input blob to temp file
        const arrayBuffer = await audioBlob.arrayBuffer();
        fs.writeFileSync(inputPath, Buffer.from(arrayBuffer));

        // Build filter chain
        const filters: string[] = [];
        if (volume !== 1.0) {
            filters.push(`volume=${volume}`);
        }
        if (playbackSpeed !== 1.0) {
            const clampedSpeed = Math.max(0.5, Math.min(2.0, playbackSpeed));
            filters.push(`atempo=${clampedSpeed}`);
        }

        // Process with ffmpeg
        await new Promise<void>((resolve, reject) => {
            let command = ffmpeg(inputPath);

            if (filters.length > 0) {
                command = command.audioFilters(filters);
            }

            command
                .output(outputPath)
                .on('end', () => resolve())
                .on('error', (err: Error) => reject(err))
                .run();
        });

        // Read output file
        const outputBuffer = fs.readFileSync(outputPath);
        return new Blob([outputBuffer], { type: 'audio/wav' });
    } finally {
        // Cleanup temp files
        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
    }
}
