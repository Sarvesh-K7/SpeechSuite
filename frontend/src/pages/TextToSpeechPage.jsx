
// import { useState, useRef } from "react";
// import { api } from "../api.js";
// import { Volume2, Loader2, Download } from "lucide-react";

// const MAX_CHARS = 2000;

// export default function TextToSpeechPage() {
//   const [text, setText] = useState("");
//   const [speaking, setSpeaking] = useState(false);
//   const [error, setError] = useState("");
//   const [audioUrl, setAudioUrl] = useState(null);

//   const audioRef = useRef(null);

//   const handleGenerate = async () => {
//     const trimmed = text.trim();
//     if (!trimmed) return;
//     setSpeaking(true);
//     setError("");
//     try {
//       const url = await api.synthesizeSpeech(trimmed);
//       if (audioUrl) URL.revokeObjectURL(audioUrl);
//       setAudioUrl(url);
//       setTimeout(() => {
//         audioRef.current?.play().catch(() => {});
//       }, 50);
//     } catch (err) {
//       setError("Text-to-speech failed: " + err.message);
//     } finally {
//       setSpeaking(false);
//     }
//   };

//   return (
//     <div className="page">
//       <div className="page-header">
//         <h1>Text to Speech</h1>
//         <p className="page-subtitle">
//           Type or paste any text and convert it into natural-sounding speech.
//         </p>
//       </div>

//       <div className="card">
//         <textarea
//           className="tts-textarea"
//           rows={8}
//           placeholder="Type something to hear it spoken aloud…"
//           value={text}
//           maxLength={MAX_CHARS}
//           onChange={(e) => setText(e.target.value)}
//         />
//         <div className="tts-footer">
//           <span className="char-count">
//             {text.length} / {MAX_CHARS}
//           </span>
//           <button
//             className="btn btn-primary"
//             onClick={handleGenerate}
//             disabled={!text.trim() || speaking}
//           >
//             {speaking ? <Loader2 size={16} className="spin" /> : <Volume2 size={16} />}
//             {speaking ? "Generating…" : "Generate Speech"}
//           </button>
//         </div>

//         {error && <p className="error-text">{error}</p>}

//         {audioUrl && (
//           <div className="tts-player">
//             <audio ref={audioRef} controls src={audioUrl} style={{ width: "100%" }} />
            
//              <a className="btn btn-outline btn-small download-link"
//               href={audioUrl}
//               download="speech.wav"
//             >
//               <Download size={14} />
//               Download Audio
//             </a>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }








import { useState, useRef } from "react";
import { api } from "../api.js";
import { Volume2, Loader2, Download } from "lucide-react";

const MAX_CHARS = 2000;

export default function TextToSpeechPage() {
  const [text, setText] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const [error, setError] = useState("");
  const [audioUrl, setAudioUrl] = useState(null);

  const audioRef = useRef(null);

  const handleGenerate = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setSpeaking(true);
    setError("");
    try {
      const url = await api.synthesizeSpeech(trimmed);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      setAudioUrl(url);
      setTimeout(() => {
        audioRef.current?.play().catch(() => {});
      }, 50);
    } catch (err) {
      setError("Text-to-speech failed: " + err.message);
    } finally {
      setSpeaking(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Text to Speech</h1>
        <p className="page-subtitle">
          Type or paste any text and convert it into natural-sounding speech.
        </p>
      </div>

      <div className="card">
        <textarea
          className="tts-textarea"
          rows={8}
          placeholder="Type something to hear it spoken aloud…"
          value={text}
          maxLength={MAX_CHARS}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="tts-footer">
          <span className="char-count">
            {text.length} / {MAX_CHARS}
          </span>
          <button
            className="btn btn-primary"
            onClick={handleGenerate}
            disabled={!text.trim() || speaking}
          >
            {speaking ? <Loader2 size={16} className="spin" /> : <Volume2 size={16} />}
            {speaking ? "Generating…" : "Generate Speech"}
          </button>
        </div>

        {error && <p className="error-text">{error}</p>}

        {audioUrl && (
          <div className="tts-player">
            <audio ref={audioRef} controls src={audioUrl} style={{ width: "100%" }} />
            <a
              className="btn btn-outline btn-small download-link"
              href={audioUrl}
              download="speech.wav"
            >
              <Download size={14} />
              Download Audio
            </a>
          </div>
        )}
      </div>
    </div>
  );
}