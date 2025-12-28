import { processAudio, validateOptions, AudioProcessingOptions } from './audioProcessor';

// Types
export interface VoiceListResponse {
    voices: string[];
    default: string;
    total: number;
}

export interface GenerateOptions {
    text: string;
    voice?: string;
    volume?: number;        // 0.0 to 2.0, default 1.0
    playbackSpeed?: number; // 0.5 to 2.0, default 1.0
}

export interface VoiceClientConfig {
    baseUrl: string;
}

// Voice API Client Class
export class VoiceClient {
    private baseUrl: string;

    constructor(config: VoiceClientConfig) {
        this.baseUrl = config.baseUrl.replace(/\/$/, ''); // Remove trailing slash
    }

    /**
     * Check if API is healthy
     */
    async health(): Promise<{ status: string }> {
        const response = await fetch(`${this.baseUrl}/health`);
        if (!response.ok) throw new Error('API health check failed');
        return response.json();
    }

    /**
     * Get list of available voices
     */
    async getVoicesList(): Promise<VoiceListResponse> {
        const response = await fetch(`${this.baseUrl}/getvoiceslist`);
        if (!response.ok) throw new Error('Failed to get voices list');
        return response.json();
    }

    /**
     * Generate audio from text
     * @returns Audio as Blob
     */
    async generate(options: GenerateOptions): Promise<Blob> {
        // Validate audio processing options
        validateOptions({ volume: options.volume, playbackSpeed: options.playbackSpeed });

        const response = await fetch(`${this.baseUrl}/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: options.text,
                voice: options.voice
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Generation failed');
        }

        let audioBlob = await response.blob();

        // Apply audio processing if volume or playbackSpeed specified
        if (options.volume !== undefined || options.playbackSpeed !== undefined) {
            audioBlob = await processAudio(audioBlob, {
                volume: options.volume,
                playbackSpeed: options.playbackSpeed
            });
        }

        return audioBlob;
    }

    /**
     * Generate audio and return as ArrayBuffer
     */
    async generateBuffer(options: GenerateOptions): Promise<ArrayBuffer> {
        const blob = await this.generate(options);
        return blob.arrayBuffer();
    }

    /**
     * Generate audio and return as Base64 string
     */
    async generateBase64(options: GenerateOptions): Promise<string> {
        const blob = await this.generate(options);
        const buffer = await blob.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        let binary = '';
        bytes.forEach(byte => binary += String.fromCharCode(byte));
        return btoa(binary);
    }

    /**
     * Generate audio and return as data URL (for audio elements)
     */
    async generateDataUrl(options: GenerateOptions): Promise<string> {
        const base64 = await this.generateBase64(options);
        return `data:audio/wav;base64,${base64}`;
    }
}

// Factory function for quick initialization
export function createVoiceClient(baseUrl: string): VoiceClient {
    return new VoiceClient({ baseUrl });
}

// Default export
export default VoiceClient;
