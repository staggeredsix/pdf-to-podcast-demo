// File: src/api/apiService.js
const API_BASE_URL = 'http://localhost:8002';

// Generic fetch function with error handling
async function fetchWithErrorHandling(url, options = {}) {
  const response = await fetch(url, options);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API request failed with status ${response.status}`);
  }
  
  return response.json();
}

// PDF Processing
export async function processFiles(files, params) {
  const formData = new FormData();
  
  // Add main PDF file
  formData.append('target_pdf', files.targetPdf);
  
  // Add context PDFs if they exist
  if (files.contextPdfs) {
    files.contextPdfs.forEach(file => {
      formData.append('context_pdfs', file);
    });
  }
  
  // Add conversion parameters
  formData.append('params', JSON.stringify(params));
  
  return fetchWithErrorHandling(`${API_BASE_URL}/process_pdf`, {
    method: 'POST',
    body: formData,
  });
}

// Job Status
export async function getJobStatus(jobId) {
  return fetchWithErrorHandling(`${API_BASE_URL}/status/${jobId}`);
}

export async function getJobOutput(jobId) {
  return fetchWithErrorHandling(`${API_BASE_URL}/output/${jobId}`);
}

// Saved Podcasts
export async function getSavedPodcasts() {
  return fetchWithErrorHandling(`${API_BASE_URL}/saved_podcasts`);
}

export async function getPodcastMetadata(jobId) {
  return fetchWithErrorHandling(`${API_BASE_URL}/saved_podcast/${jobId}/metadata`);
}

export async function getPodcastAudio(jobId) {
  return fetch(`${API_BASE_URL}/saved_podcast/${jobId}/audio`);
}

export async function getPodcastTranscript(jobId) {
  return fetchWithErrorHandling(`${API_BASE_URL}/saved_podcast/${jobId}/transcript`);
}

export async function deletePodcast(jobId) {
  return fetchWithErrorHandling(`${API_BASE_URL}/saved_podcast/${jobId}`, {
    method: 'DELETE',
  });
}

// WebSocket setup for real-time updates
export function createStatusWebSocket(jobId, onMessage) {
  const wsUrl = `ws://localhost:8002/websocket/status/${jobId}`;
  const socket = new WebSocket(wsUrl);
  
  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    onMessage(data);
  };
  
  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
  
  return socket;
}
