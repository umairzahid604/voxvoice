# voxvoice

TypeScript/JavaScript client for Voice Generation API.

## Installation

```bash
npm install voxvoice
```

## Usage

### Initialize Client

```typescript
import { createVoiceClient } from 'voxvoice';

const client = createVoiceClient('https://your-api-url.ngrok-free.app');
```

### Get Available Voices

```typescript
const voices = await client.getVoicesList();
console.log(voices);
// { voices: ['fireship'], default: 'fireship', total: 1 }
```

### Generate Audio

```typescript
// With default voice
const audioBlob = await client.generate({ text: 'Hello world' });

// With specific voice
const audioBlob = await client.generate({ 
  text: 'Hello world',
  voice: 'fireship' 
});
```

### Different Output Formats

```typescript
// As Blob (default)
const blob = await client.generate({ text: 'Hello' });

// As ArrayBuffer
const buffer = await client.generateBuffer({ text: 'Hello' });

// As Base64
const base64 = await client.generateBase64({ text: 'Hello' });

// As Data URL (for <audio> elements)
const dataUrl = await client.generateDataUrl({ text: 'Hello' });
```

### Browser Example (Play Audio)

```typescript
const client = createVoiceClient('https://your-api-url');

const dataUrl = await client.generateDataUrl({ text: 'Hello!' });
const audio = new Audio(dataUrl);
audio.play();
```

### Node.js Example (Save File)

```typescript
import { createVoiceClient } from 'voxvoice';
import { writeFileSync } from 'fs';

const client = createVoiceClient('https://your-api-url');
const buffer = await client.generateBuffer({ text: 'Hello!' });
writeFileSync('output.wav', Buffer.from(buffer));
```

## API Reference

| Method | Returns | Description |
|--------|---------|-------------|
| `health()` | `{ status: string }` | Check API health |
| `getVoicesList()` | `VoiceListResponse` | Get available voices |
| `generate(options)` | `Blob` | Generate audio as Blob |
| `generateBuffer(options)` | `ArrayBuffer` | Generate as ArrayBuffer |
| `generateBase64(options)` | `string` | Generate as Base64 |
| `generateDataUrl(options)` | `string` | Generate as data URL |

## License

MIT
