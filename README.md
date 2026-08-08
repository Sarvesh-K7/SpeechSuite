# SpeechSuite — Real-time Multilingual Speech-to-Text & Text-to-Speech

A full-stack web app that transcribes speech in real time — including
code-mixed Hindi + English — and converts text back into natural-sounding
speech.

Live demo: 

## What it does

- **Record** — speak into the mic in Hindi, English, or a mix of both. Audio
  is captured in the browser, chunked into 4-second segments, and streamed
  to the backend, so the transcript fills in live while you talk.
- **Listen** — hear any transcript read back via text-to-speech.
- **History** — every saved transcription supports full CRUD: search, inline
  edit, delete, and replay as speech.
- **Text to Speech** — a standalone page to convert any typed/pasted text
  into downloadable audio.

## Tech stack

| Layer          | Choice                                   |
|----------------|-------------------------------------------|
| Frontend       | React + Vite                              |
| Backend        | Flask (Python)                            |
| Database       | MySQL + SQLAlchemy                        |
| Speech-to-Text | faster-whisper (self-hosted, open-source) — swappable to ElevenLabs Scribe (cloud) |
| Text-to-Speech | Piper (self-hosted, open-source) — swappable to ElevenLabs TTS (cloud) |
| Realtime audio capture | Web Audio API                     |

STT and TTS providers are switched via a single env var each
(`STT_PROVIDER`, `TTS_PROVIDER`) — no code changes needed to swap between
self-hosted and cloud.

## Architecture

```
Browser mic → 4s chunker (WAV, client-side) → Flask /api/transcribe
    → STT engine (faster-whisper local | ElevenLabs cloud) → text appended to live transcript

Save to History → MySQL → History page (CRUD: search / edit / delete / replay)
```

## Project structure

```
backend/
  __init__.py        # app factory, CORS, DB init
  config.py           # all config read from environment variables
  models.py            # Transcription model
  routes.py            # REST API (STT, TTS, CRUD)
  stt_whisper.py       # faster-whisper provider
  stt_elevenlabs.py    # ElevenLabs STT provider
  tts_piper.py          # Piper TTS provider
  tts_elevenlabs.py     # ElevenLabs TTS provider
  run.py                # entrypoint
  .env.example
frontend/
  src/
    api.js
    App.jsx
    pages/ (RecordPage, HistoryPage, TextToSpeechPage, AboutPage)
    components/ (Navbar, EditModal)
  .env.example
```

## Running locally

### Prerequisites
- Python 3.10+
- Node 18+
- MySQL running locally (or update `DATABASE_URL` to point elsewhere)

### Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# edit .env — set DB_PASSWORD, and ELEVENLABS_API_KEY if using cloud providers

python run.py
```

Backend runs on `http://localhost:5000`. On first run it creates the
`transcriptions` table automatically.

For local/open-source mode (default), no API key is required — Piper voice
models and the Whisper model download automatically on first use.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env   # defaults to http://localhost:5000/api, edit if needed
npm run dev
```

Frontend runs on `http://localhost:5173`.

## Environment variables

See `backend/.env.example` and `frontend/.env.example` for the full list.
Key ones:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` / `DB_*` | MySQL connection |
| `STT_PROVIDER` | `whisper` (default, self-hosted) or `elevenlabs` |
| `TTS_PROVIDER` | `piper` (default, self-hosted) or `elevenlabs` |
| `ELEVENLABS_API_KEY` | only required if using the ElevenLabs provider |
| `CORS_ORIGINS` | allowed frontend origin(s) |

**No secrets are committed to this repo.** Copy the `.env.example` files and
fill in your own values locally / in your deployment platform's env config.

## API reference

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/transcribe` | Transcribe one audio chunk (multipart, field `audio`) |
| POST | `/api/tts` | Synthesize speech from `{ text }` |
| GET | `/api/transcriptions` | List saved transcriptions (paginated, searchable) |
| GET | `/api/transcriptions/:id` | Get one transcription |
| POST | `/api/transcriptions` | Save a new transcription |
| PUT | `/api/transcriptions/:id` | Update transcription text |
| DELETE | `/api/transcriptions/:id` | Delete a transcription |
| GET | `/api/health` | Health check |

## Design notes / trade-offs

- **faster-whisper** for STT: runs fully offline on CPU, handles code-mixed
  Hindi+English reasonably well, no per-request cost or rate limits —
  useful for a real-time chunked workload. Whisper picks one dominant
  language per chunk rather than switching mid-segment, so very short,
  heavily code-mixed chunks may be transcribed in whichever language is
  judged dominant for that chunk.
- **Piper** for TTS: local, fast, no API key, small voice models.
- **ElevenLabs** is wired in as an optional cloud fallback for both STT and
  TTS behind the same config switch, in case higher-fidelity multilingual
  output is preferred over self-hosting.
- **4-second chunking** balances perceived latency (text appears while
  you're still talking) against giving Whisper's VAD enough audio to
  reliably detect speech in a chunk.

## Known limitations / next steps

- Whisper transcribes each chunk independently — no cross-chunk context, so
  accuracy could improve with a sliding-window or streaming-native approach.
- No authentication — history is currently global rather than per-user.
- No automated tests yet.
