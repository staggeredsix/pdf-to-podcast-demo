// File: src/api/ttsService.js
const TTS_API_URL = 'http://localhost:8889';

export async function fetchVoices() {
  const response = await fetch(`${TTS_API_URL}/voices`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch voices: ${response.statusText}`);
  }
  
  return response.json();
}
