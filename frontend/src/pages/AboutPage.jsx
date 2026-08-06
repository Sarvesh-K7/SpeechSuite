import {
  Mic,
  Server,
  Database,
  Volume2,
  Cpu,
  GitBranch,
  Layers,
  History,
  ArrowRight,
  ArrowDown,
  Sparkles,
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="page-wide">
      <div className="about-hero">
        <h1>How SpeechSuite works</h1>
        <p>
          A real-time, multilingual speech-to-text and text-to-speech
          application built on a fully self-hostable open-source stack, with
          cloud providers available as a drop-in swap.
        </p>
      </div>

      <div className="about-nav">
        <a href="#usage">Using the app</a>
        <a href="#architecture">Architecture</a>
        <a href="#stack">Tech stack</a>
        <a href="#decisions">Why these tools</a>
        <a href="#api">API reference</a>
      </div>

      {/* ---------------- Usage ---------------- */}
      <section className="about-section" id="usage">
        <div className="card">
          <div className="about-section-title">
            <span className="icon-badge">
              <Sparkles size={18} />
            </span>
            <h2>Using the app</h2>
          </div>

          <div className="step-list">
            <div className="step-item">
              <span className="step-number">1</span>
              <div className="step-content">
                <h4>Record — speak in Hindi, English, or a mix of both</h4>
                <p>
                  Go to the <strong>Record</strong> page and press Start
                  Recording. Your microphone audio is captured directly in
                  the browser and streamed to the backend in 4-second chunks,
                  so the transcript fills in as you talk instead of waiting
                  until you stop.
                </p>
              </div>
            </div>

            <div className="step-item">
              <span className="step-number">2</span>
              <div className="step-content">
                <h4>Review, listen, and save</h4>
                <p>
                  Once you're done, use <strong>Listen</strong> to hear the
                  transcript read back via text-to-speech, or{" "}
                  <strong>Save to History</strong> to persist it to the
                  database along with the detected language.
                </p>
              </div>
            </div>

            <div className="step-item">
              <span className="step-number">3</span>
              <div className="step-content">
                <h4>Manage saved transcriptions</h4>
                <p>
                  The <strong>History</strong> page lists every saved
                  transcription with full CRUD support — search, edit text
                  inline, delete, or play any entry back as speech.
                </p>
              </div>
            </div>

            <div className="step-item">
              <span className="step-number">4</span>
              <div className="step-content">
                <h4>Standalone text-to-speech</h4>
                <p>
                  The <strong>Text to Speech</strong> page converts any typed
                  or pasted text into spoken audio you can play back or
                  download, independent of the recording flow.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Architecture ---------------- */}
      <section className="about-section" id="architecture">
        <div className="card">
          <div className="about-section-title">
            <span className="icon-badge">
              <Layers size={18} />
            </span>
            <h2>Architecture</h2>
          </div>

          <p className="subtitle" style={{ marginBottom: 20 }}>
            Real-time transcription flow: the browser records, chunks, and
            streams audio; the backend transcribes and persists it.
          </p>

          <div className="arch-flow">
            <div className="arch-node">
              <span className="arch-icon">
                <Mic size={18} />
              </span>
              <strong>Browser mic</strong>
              <span>Web Audio API captures raw PCM</span>
            </div>
            <div className="arch-arrow">
              <ArrowRight size={18} />
            </div>
            <div className="arch-node">
              <span className="arch-icon">
                <Cpu size={18} />
              </span>
              <strong>4s chunker</strong>
              <span>PCM buffered &amp; encoded to WAV client-side</span>
            </div>
            <div className="arch-arrow">
              <ArrowRight size={18} />
            </div>
            <div className="arch-node">
              <span className="arch-icon">
                <Server size={18} />
              </span>
              <strong>Flask API</strong>
              <span>/api/transcribe receives each chunk</span>
            </div>
            <div className="arch-arrow">
              <ArrowRight size={18} />
            </div>
            <div className="arch-node arch-node--accent">
              <span className="arch-icon">
                <Volume2 size={18} />
              </span>
              <strong>STT engine</strong>
              <span>faster-whisper (local) or ElevenLabs (cloud)</span>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "center", margin: "4px 0" }}>
            <ArrowDown size={18} color="var(--text-faint)" />
          </div>

          <div className="arch-flow">
            <div className="arch-node">
              <strong>Text appended</strong>
              <span>Transcript builds live in the UI as chunks return</span>
            </div>
            <div className="arch-arrow">
              <ArrowRight size={18} />
            </div>
            <div className="arch-node">
              <span className="arch-icon">
                <Database size={18} />
              </span>
              <strong>MySQL</strong>
              <span>Saved explicitly via Save to History</span>
            </div>
            <div className="arch-arrow">
              <ArrowRight size={18} />
            </div>
            <div className="arch-node">
              <span className="arch-icon">
                <History size={18} />
              </span>
              <strong>History page</strong>
              <span>Full CRUD — search, edit, delete, replay</span>
            </div>
          </div>

          <p className="subtitle" style={{ marginTop: 24, marginBottom: 12 }}>
            The backend never picks a provider by hardcoding it — every STT
            and TTS call is routed through a single config switch:
          </p>

          <div className="provider-flow">
            <div className="provider-branch">
              <div className="provider-branch-label">Self-hosted (default)</div>
              <code>STT_PROVIDER=whisper</code>
              <code>TTS_PROVIDER=piper</code>
              <p>
                Runs entirely on your own server. No API key, no per-request
                cost, no external network dependency once models are cached.
              </p>
            </div>
            <div className="provider-switch-center">
              <GitBranch size={20} />
              one env var
            </div>
            <div className="provider-branch">
              <div className="provider-branch-label">Cloud (optional)</div>
              <code>STT_PROVIDER=elevenlabs</code>
              <code>TTS_PROVIDER=elevenlabs</code>
              <p>
                Swaps to ElevenLabs' hosted Scribe (STT) and multilingual TTS
                models — no code changes, just config.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Tech stack ---------------- */}
      <section className="about-section" id="stack">
        <div className="card">
          <div className="about-section-title">
            <span className="icon-badge">
              <Cpu size={18} />
            </span>
            <h2>Tech stack</h2>
          </div>

          <div className="tech-grid">
            <div className="tech-item">
              <span className="tech-item-label">Frontend</span>
              <span className="tech-item-value">React + Vite</span>
            </div>
            <div className="tech-item">
              <span className="tech-item-label">Backend</span>
              <span className="tech-item-value">Flask (Python)</span>
            </div>
            <div className="tech-item">
              <span className="tech-item-label">Database</span>
              <span className="tech-item-value">MySQL + SQLAlchemy</span>
            </div>
            <div className="tech-item">
              <span className="tech-item-label">Speech-to-text</span>
              <span className="tech-item-value">faster-whisper</span>
            </div>
            <div className="tech-item">
              <span className="tech-item-label">Text-to-speech</span>
              <span className="tech-item-value">Piper</span>
            </div>
            <div className="tech-item">
              <span className="tech-item-label">Realtime capture</span>
              <span className="tech-item-value">Web Audio API</span>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Decisions ---------------- */}
      <section className="about-section" id="decisions">
        <div className="card">
          <div className="about-section-title">
            <span className="icon-badge">
              <GitBranch size={18} />
            </span>
            <h2>Why these tools</h2>
          </div>

          <div className="decision-grid">
            <div className="decision-card">
              <div className="decision-card-header">
                <strong>faster-whisper for STT</strong>
                <span className="pill-tag pill-tag--oss">Open source</span>
              </div>
              <p>
                A CTranslate2 reimplementation of OpenAI Whisper. Runs fully
                offline on CPU, handles code-mixed Hindi+English speech
                reasonably well, and has zero per-request cost or rate
                limits — important for a real-time chunked workload.
              </p>
            </div>

            <div className="decision-card">
              <div className="decision-card-header">
                <strong>Piper for TTS</strong>
                <span className="pill-tag pill-tag--oss">Open source</span>
              </div>
              <p>
                A fast, local neural TTS engine with no external calls. Voice
                models are small (~60MB), synthesis is near-instant on CPU,
                and it needs no API key — matching the assignment's
                preference for open-source TTS.
              </p>
            </div>

            <div className="decision-card">
              <div className="decision-card-header">
                <strong>ElevenLabs as fallback</strong>
                <span className="pill-tag pill-tag--api">Cloud API</span>
              </div>
              <p>
                Both STT and TTS support an ElevenLabs backend behind the
                same config switch, in case higher-fidelity multilingual
                voices or hosted transcription are preferred over
                self-hosting.
              </p>
            </div>

            <div className="decision-card">
              <div className="decision-card-header">
                <strong>4-second chunking</strong>
                <span className="pill-tag pill-tag--oss">Design choice</span>
              </div>
              <p>
                Balances perceived latency against transcription accuracy —
                short enough that text appears while you're still speaking,
                long enough for Whisper's voice-activity detection to
                reliably find speech in the chunk.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- API reference ---------------- */}
      <section className="about-section" id="api">
        <div className="card">
          <div className="about-section-title">
            <span className="icon-badge">
              <Server size={18} />
            </span>
            <h2>API reference</h2>
          </div>

          <table className="endpoint-table">
            <thead>
              <tr>
                <th>Method</th>
                <th>Endpoint</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><span className="method-badge method-post">POST</span></td>
                <td><code>/api/transcribe</code></td>
                <td>Transcribes one audio chunk (multipart form, field "audio")</td>
              </tr>
              <tr>
                <td><span className="method-badge method-post">POST</span></td>
                <td><code>/api/tts</code></td>
                <td>Synthesizes speech from JSON <code>{"{ text }"}</code></td>
              </tr>
              <tr>
                <td><span className="method-badge method-get">GET</span></td>
                <td><code>/api/transcriptions</code></td>
                <td>Lists saved transcriptions (paginated, searchable)</td>
              </tr>
              <tr>
                <td><span className="method-badge method-get">GET</span></td>
                <td><code>/api/transcriptions/:id</code></td>
                <td>Fetches a single transcription</td>
              </tr>
              <tr>
                <td><span className="method-badge method-post">POST</span></td>
                <td><code>/api/transcriptions</code></td>
                <td>Saves a new transcription</td>
              </tr>
              <tr>
                <td><span className="method-badge method-put">PUT</span></td>
                <td><code>/api/transcriptions/:id</code></td>
                <td>Updates transcription text</td>
              </tr>
              <tr>
                <td><span className="method-badge method-delete">DELETE</span></td>
                <td><code>/api/transcriptions/:id</code></td>
                <td>Deletes a transcription</td>
              </tr>
              <tr>
                <td><span className="method-badge method-get">GET</span></td>
                <td><code>/api/health</code></td>
                <td>Health check</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}