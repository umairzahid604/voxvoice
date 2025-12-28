// src/audioProcessor.ts
import * as path from "path";
import * as fs from "fs";
import * as os from "os";
function validateOptions(options) {
  if (options.volume !== void 0) {
    if (options.volume < 0 || options.volume > 2) {
      throw new Error("Volume must be between 0.0 and 2.0");
    }
  }
  if (options.playbackSpeed !== void 0) {
    if (options.playbackSpeed < 0.5 || options.playbackSpeed > 2) {
      throw new Error("Playback speed must be between 0.5 and 2.0");
    }
  }
}
async function processAudio(audioBlob, options) {
  const { volume = 1, playbackSpeed = 1 } = options;
  if (volume === 1 && playbackSpeed === 1) {
    return audioBlob;
  }
  const ffmpegInstaller = await import("@ffmpeg-installer/ffmpeg");
  const ffmpegModule = await import("fluent-ffmpeg");
  const ffmpeg = ffmpegModule.default || ffmpegModule;
  ffmpeg.setFfmpegPath(ffmpegInstaller.path);
  const tempDir = os.tmpdir();
  const inputPath = path.join(tempDir, `voxvoice_input_${Date.now()}.wav`);
  const outputPath = path.join(tempDir, `voxvoice_output_${Date.now()}.wav`);
  try {
    const arrayBuffer = await audioBlob.arrayBuffer();
    fs.writeFileSync(inputPath, Buffer.from(arrayBuffer));
    const filters = [];
    if (volume !== 1) {
      filters.push(`volume=${volume}`);
    }
    if (playbackSpeed !== 1) {
      const clampedSpeed = Math.max(0.5, Math.min(2, playbackSpeed));
      filters.push(`atempo=${clampedSpeed}`);
    }
    await new Promise((resolve, reject) => {
      let command = ffmpeg(inputPath);
      if (filters.length > 0) {
        command = command.audioFilters(filters);
      }
      command.output(outputPath).on("end", () => resolve()).on("error", (err) => reject(err)).run();
    });
    const outputBuffer = fs.readFileSync(outputPath);
    return new Blob([outputBuffer], { type: "audio/wav" });
  } finally {
    if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
  }
}

// src/index.ts
var VoiceClient = class {
  constructor(config) {
    this.baseUrl = config.baseUrl.replace(/\/$/, "");
  }
  /**
   * Check if API is healthy
   */
  async health() {
    const response = await fetch(`${this.baseUrl}/health`);
    if (!response.ok) throw new Error("API health check failed");
    return response.json();
  }
  /**
   * Get list of available voices
   */
  async getVoicesList() {
    const response = await fetch(`${this.baseUrl}/getvoiceslist`);
    if (!response.ok) throw new Error("Failed to get voices list");
    return response.json();
  }
  /**
   * Generate audio from text
   * @returns Audio as Blob
   */
  async generate(options) {
    validateOptions({ volume: options.volume, playbackSpeed: options.playbackSpeed });
    const response = await fetch(`${this.baseUrl}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: options.text,
        voice: options.voice
      })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Generation failed");
    }
    let audioBlob = await response.blob();
    if (options.volume !== void 0 || options.playbackSpeed !== void 0) {
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
  async generateBuffer(options) {
    const blob = await this.generate(options);
    return blob.arrayBuffer();
  }
  /**
   * Generate audio and return as Base64 string
   */
  async generateBase64(options) {
    const blob = await this.generate(options);
    const buffer = await blob.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = "";
    bytes.forEach((byte) => binary += String.fromCharCode(byte));
    return btoa(binary);
  }
  /**
   * Generate audio and return as data URL (for audio elements)
   */
  async generateDataUrl(options) {
    const base64 = await this.generateBase64(options);
    return `data:audio/wav;base64,${base64}`;
  }
};
function createVoiceClient(baseUrl) {
  return new VoiceClient({ baseUrl });
}
var index_default = VoiceClient;
export {
  VoiceClient,
  createVoiceClient,
  index_default as default
};
