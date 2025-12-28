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
    return response.blob();
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
