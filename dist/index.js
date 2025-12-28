"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  VoiceClient: () => VoiceClient,
  createVoiceClient: () => createVoiceClient,
  default: () => index_default
});
module.exports = __toCommonJS(index_exports);
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  VoiceClient,
  createVoiceClient
});
