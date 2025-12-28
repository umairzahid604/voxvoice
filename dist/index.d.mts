interface VoiceListResponse {
    voices: string[];
    default: string;
    total: number;
}
interface GenerateOptions {
    text: string;
    voice?: string;
    volume?: number;
    playbackSpeed?: number;
}
interface VoiceClientConfig {
    baseUrl: string;
}
declare class VoiceClient {
    private baseUrl;
    constructor(config: VoiceClientConfig);
    /**
     * Check if API is healthy
     */
    health(): Promise<{
        status: string;
    }>;
    /**
     * Get list of available voices
     */
    getVoicesList(): Promise<VoiceListResponse>;
    /**
     * Generate audio from text
     * @returns Audio as Blob
     */
    generate(options: GenerateOptions): Promise<Blob>;
    /**
     * Generate audio and return as ArrayBuffer
     */
    generateBuffer(options: GenerateOptions): Promise<ArrayBuffer>;
    /**
     * Generate audio and return as Base64 string
     */
    generateBase64(options: GenerateOptions): Promise<string>;
    /**
     * Generate audio and return as data URL (for audio elements)
     */
    generateDataUrl(options: GenerateOptions): Promise<string>;
}
declare function createVoiceClient(baseUrl: string): VoiceClient;

export { type GenerateOptions, VoiceClient, type VoiceClientConfig, type VoiceListResponse, createVoiceClient, VoiceClient as default };
