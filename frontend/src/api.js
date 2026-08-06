
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }
  return data;
}

export const api = {
  // STT
  transcribeChunk: async (audioBlob) => {
    const formData = new FormData();
    formData.append("audio", audioBlob, "chunk.wav");
    const res = await fetch(`${API_BASE_URL}/transcribe`, {
      method: "POST",
      body: formData,
    });
    return handleResponse(res);
  },

  // CRUD
  listTranscriptions: async ({ page = 1, perPage = 10, search = "" } = {}) => {
    const params = new URLSearchParams({ page, per_page: perPage });
    if (search) params.append("search", search);
    const res = await fetch(`${API_BASE_URL}/transcriptions?${params.toString()}`);
    return handleResponse(res);
  },

  getTranscription: async (id) => {
    const res = await fetch(`${API_BASE_URL}/transcriptions/${id}`);
    return handleResponse(res);
  },

  createTranscription: async ({ text, detectedLanguage, sessionId }) => {
    const res = await fetch(`${API_BASE_URL}/transcriptions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        detected_language: detectedLanguage,
        session_id: sessionId,
      }),
    });
    return handleResponse(res);
  },

  updateTranscription: async (id, { text }) => {
    const res = await fetch(`${API_BASE_URL}/transcriptions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    return handleResponse(res);
  },

  deleteTranscription: async (id) => {
    const res = await fetch(`${API_BASE_URL}/transcriptions/${id}`, {
      method: "DELETE",
    });
    return handleResponse(res);
  },

  // TTS
  synthesizeSpeech: async (text) => {
    const res = await fetch(`${API_BASE_URL}/tts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || `TTS request failed with status ${res.status}`);
    }
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  },
};