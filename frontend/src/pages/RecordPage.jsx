
import { useRef, useState, useCallback } from "react";
import { api } from "../api.js";
import { Mic, Square, Save, Trash2, Volume2, Loader2 } from "lucide-react";

const CHUNK_DURATION_MS = 4000; // flush a chunk to the backend every 4 seconds

export default function RecordPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | recording | processing | saved
  const [transcript, setTranscript] = useState("");
  const [detectedLanguage, setDetectedLanguage] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const processorRef = useRef(null);
  const sourceRef = useRef(null);
  const pcmBufferRef = useRef([]);
  const chunkQueueRef = useRef(Promise.resolve());
  const sessionIdRef = useRef(crypto.randomUUID());
  const cycleTimerRef = useRef(null);
  const keepGoingRef = useRef(false);
  const sampleRateRef = useRef(48000);
  const ttsAudioRef = useRef(null);

  const appendTranscript = useCallback((text) => {
    if (!text) return;
    setTranscript((prev) => (prev ? `${prev} ${text}` : text));
  }, []);

  const sendChunk = useCallback(
    async (blob) => {
      if (!blob || blob.size < 2000) return;
      try {
        const data = await api.transcribeChunk(blob);
        if (data.text) appendTranscript(data.text);
        if (data.language) setDetectedLanguage(data.language);
      } catch (err) {
        console.error("Chunk transcription failed:", err);
        setError(err.message);
      }
    },
    [appendTranscript]
  );

  const encodeWav = (float32Chunks, sampleRate) => {
    const totalLength = float32Chunks.reduce((sum, c) => sum + c.length, 0);
    const merged = new Float32Array(totalLength);
    let offset = 0;
    for (const c of float32Chunks) {
      merged.set(c, offset);
      offset += c.length;
    }

    const buffer = new ArrayBuffer(44 + merged.length * 2);
    const view = new DataView(buffer);
    const writeString = (o, s) => {
      for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i));
    };

    writeString(0, "RIFF");
    view.setUint32(4, 36 + merged.length * 2, true);
    writeString(8, "WAVE");
    writeString(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, "data");
    view.setUint32(40, merged.length * 2, true);

    let idx = 44;
    for (let i = 0; i < merged.length; i++) {
      const s = Math.max(-1, Math.min(1, merged[i]));
      view.setInt16(idx, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      idx += 2;
    }

    return new Blob([buffer], { type: "audio/wav" });
  };

  const flushCycle = useCallback(() => {
    const chunks = pcmBufferRef.current;
    pcmBufferRef.current = [];
    if (chunks.length === 0) return;
    const blob = encodeWav(chunks, sampleRateRef.current);
    chunkQueueRef.current = chunkQueueRef.current.then(() => sendChunk(blob));
  }, [sendChunk]);

  const startRecording = async () => {
    setError("");
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });
    } catch {
      setError("Microphone access is required. Please allow mic access in your browser.");
      return;
    }

    streamRef.current = stream;

    const AudioContextCls = window.AudioContext || window.webkitAudioContext;
    const audioContext = new AudioContextCls();
    audioContextRef.current = audioContext;
    sampleRateRef.current = audioContext.sampleRate;

    const source = audioContext.createMediaStreamSource(stream);
    sourceRef.current = source;

    const bufferSize = 4096;
    const processor = audioContext.createScriptProcessor(bufferSize, 1, 1);
    processorRef.current = processor;

    processor.onaudioprocess = (event) => {
      const channelData = event.inputBuffer.getChannelData(0);
      pcmBufferRef.current.push(new Float32Array(channelData));
    };

    // Route through a silent gain node - some browsers require an active
    // downstream connection to keep a ScriptProcessorNode firing, but we
    // never want mic audio to audibly loop back through the speakers.
    const silentGain = audioContext.createGain();
    silentGain.gain.value = 0;
    source.connect(processor);
    processor.connect(silentGain);
    silentGain.connect(audioContext.destination);

    keepGoingRef.current = true;
    setIsRecording(true);
    setStatus("recording");

    cycleTimerRef.current = setInterval(() => {
      flushCycle();
    }, CHUNK_DURATION_MS);
  };

  const stopRecording = () => {
    setIsRecording(false);
    keepGoingRef.current = false;

    if (cycleTimerRef.current) {
      clearInterval(cycleTimerRef.current);
      cycleTimerRef.current = null;
    }

    flushCycle();

    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setStatus("processing");
    chunkQueueRef.current.then(() => setStatus("idle"));
  };

  const handleClear = () => {
    setTranscript("");
    setDetectedLanguage(null);
    setError("");
    sessionIdRef.current = crypto.randomUUID();
  };

  const handleSave = async () => {
    if (!transcript.trim()) return;
    setSaving(true);
    try {
      await api.createTranscription({
        text: transcript.trim(),
        detectedLanguage: detectedLanguage,
        sessionId: sessionIdRef.current,
      });
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2000);
    } catch (err) {
      setError("Failed to save: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleListen = async () => {
    if (!transcript.trim() || speaking) return;
    setSpeaking(true);
    setError("");
    try {
      const url = await api.synthesizeSpeech(transcript.trim());
      if (ttsAudioRef.current) {
        ttsAudioRef.current.pause();
        URL.revokeObjectURL(ttsAudioRef.current.src);
      }
      const audio = new Audio(url);
      ttsAudioRef.current = audio;
      audio.onended = () => setSpeaking(false);
      audio.onerror = () => setSpeaking(false);
      await audio.play();
    } catch (err) {
      setError("Text-to-speech failed: " + err.message);
      setSpeaking(false);
    }
  };

  const statusConfig = {
    idle: { text: "Ready", className: "status-pill status-idle" },
    recording: { text: "Recording", className: "status-pill status-recording" },
    processing: { text: "Processing", className: "status-pill status-processing" },
    saved: { text: "Saved", className: "status-pill status-saved" },
  }[status];

  return (
    <div className="page">
      <div className="page-header">
        <h1>Real-time Speech to Text</h1>
        <p className="page-subtitle">
          Speak naturally in Hindi, English, or a mix of both. Your speech is
          transcribed in near real time as you talk.
        </p>
      </div>

      <div className="card record-card">
        <div className="record-toolbar">
          <button
            className={`record-btn ${isRecording ? "record-btn--stop" : "record-btn--start"}`}
            onClick={isRecording ? stopRecording : startRecording}
          >
            {isRecording ? <Square size={18} /> : <Mic size={18} />}
            {isRecording ? "Stop Recording" : "Start Recording"}
          </button>
          <span className={statusConfig.className}>
            {status === "recording" && <span className="pulse-dot" />}
            {statusConfig.text}
          </span>
          {detectedLanguage && (
            <span className="lang-chip">Language: {detectedLanguage}</span>
          )}
        </div>

        {error && <p className="error-text">{error}</p>}

        <div className={`transcript-box ${!transcript ? "transcript-box--empty" : ""}`}>
          {transcript || "Your transcription will appear here as you speak…"}
        </div>

        <div className="record-actions">
          <button
            className="btn btn-outline"
            onClick={handleListen}
            disabled={!transcript.trim() || speaking}
          >
            {speaking ? <Loader2 size={16} className="spin" /> : <Volume2 size={16} />}
            {speaking ? "Playing…" : "Listen"}
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={!transcript.trim() || saving}
          >
            <Save size={16} />
            {saving ? "Saving…" : "Save to History"}
          </button>
          <button className="btn btn-ghost" onClick={handleClear} disabled={!transcript}>
            <Trash2 size={16} />
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}