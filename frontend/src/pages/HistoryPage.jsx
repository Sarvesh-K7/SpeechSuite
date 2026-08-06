// import { useState, useEffect, useCallback, useRef } from "react";
// import { api } from "../api.js";
// import EditModal from "../components/EditModal.jsx";
// import { Search, Pencil, Trash2, Volume2, Loader2 } from "lucide-react";

// export default function HistoryPage() {
//   const [items, setItems] = useState([]);
//   const [page, setPage] = useState(1);
//   const [pages, setPages] = useState(1);
//   const [search, setSearch] = useState("");
//   const [searchInput, setSearchInput] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [editing, setEditing] = useState(null);
//   const [speakingId, setSpeakingId] = useState(null);

//   const ttsAudioRef = useRef(null);

//   const loadHistory = useCallback(async (targetPage = 1, searchTerm = "") => {
//     setLoading(true);
//     try {
//       const data = await api.listTranscriptions({ page: targetPage, perPage: 10, search: searchTerm });
//       setItems(data.items || []);
//       setPage(data.page || 1);
//       setPages(data.pages || 1);
//     } catch (err) {
//       console.error("Failed to load history:", err);
//       setItems([]);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     loadHistory(1, "");
//   }, [loadHistory]);

//   const handleSearch = () => {
//     setSearch(searchInput.trim());
//     loadHistory(1, searchInput.trim());
//   };

//   const handleDelete = async (id) => {
//     if (!confirm("Delete this transcription? This cannot be undone.")) return;
//     try {
//       await api.deleteTranscription(id);
//       loadHistory(page, search);
//     } catch (err) {
//       alert("Failed to delete: " + err.message);
//     }
//   };

//   const handleEditSave = async (id, newText) => {
//     try {
//       await api.updateTranscription(id, { text: newText });
//       setEditing(null);
//       loadHistory(page, search);
//     } catch (err) {
//       alert("Failed to save changes: " + err.message);
//     }
//   };

//   const handleListen = async (item) => {
//     if (speakingId) return;
//     setSpeakingId(item.id);
//     try {
//       const url = await api.synthesizeSpeech(item.text);
//       if (ttsAudioRef.current) {
//         ttsAudioRef.current.pause();
//         URL.revokeObjectURL(ttsAudioRef.current.src);
//       }
//       const audio = new Audio(url);
//       ttsAudioRef.current = audio;
//       audio.onended = () => setSpeakingId(null);
//       audio.onerror = () => setSpeakingId(null);
//       await audio.play();
//     } catch (err) {
//       alert("Text-to-speech failed: " + err.message);
//       setSpeakingId(null);
//     }
//   };

//   const formatDate = (isoStr) =>
//     isoStr
//       ? new Date(isoStr).toLocaleString(undefined, {
//           dateStyle: "medium",
//           timeStyle: "short",
//         })
//       : "-";

//   return (
//     <div className="page">
//       <div className="page-header">
//         <h1>Transcription History</h1>
//         <p className="page-subtitle">Browse, search, edit, or delete your saved transcriptions.</p>
//       </div>

//       <div className="card">
//         <div className="search-bar">
//           <Search size={16} className="search-icon" />
//           <input
//             type="text"
//             className="search-input"
//             placeholder="Search transcriptions…"
//             value={searchInput}
//             onChange={(e) => setSearchInput(e.target.value)}
//             onKeyDown={(e) => e.key === "Enter" && handleSearch()}
//           />
//           <button className="btn btn-outline" onClick={handleSearch}>
//             Search
//           </button>
//         </div>

//         {loading ? (
//           <div className="empty-state">Loading…</div>
//         ) : items.length === 0 ? (
//           <div className="empty-state">No transcriptions found.</div>
//         ) : (
//           <div className="history-list">
//             {items.map((item) => (
//               <div className="history-row" key={item.id}>
//                 <div className="history-row-main">
//                   <p className="history-text">{item.text}</p>
//                   <div className="history-meta">
//                     {item.detected_language && (
//                       <span className="lang-chip lang-chip--small">{item.detected_language}</span>
//                     )}
//                     <span className="history-date">{formatDate(item.created_at)}</span>
//                   </div>
//                 </div>
//                 <div className="history-row-actions">
//                   <button
//                     className="icon-btn"
//                     title="Listen"
//                     onClick={() => handleListen(item)}
//                     disabled={speakingId !== null}
//                   >
//                     {speakingId === item.id ? (
//                       <Loader2 size={16} className="spin" />
//                     ) : (
//                       <Volume2 size={16} />
//                     )}
//                   </button>
//                   <button className="icon-btn" title="Edit" onClick={() => setEditing(item)}>
//                     <Pencil size={16} />
//                   </button>
//                   <button
//                     className="icon-btn icon-btn--danger"
//                     title="Delete"
//                     onClick={() => handleDelete(item.id)}
//                   >
//                     <Trash2 size={16} />
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}

//         {pages > 1 && (
//           <div className="pagination">
//             {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
//               <button
//                 key={p}
//                 className={`page-btn ${p === page ? "active" : ""}`}
//                 onClick={() => loadHistory(p, search)}
//               >
//                 {p}
//               </button>
//             ))}
//           </div>
//         )}
//       </div>

//       <EditModal transcription={editing} onSave={handleEditSave} onCancel={() => setEditing(null)} />
//     </div>
//   );
// }








import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "../api.js";
import EditModal from "../components/EditModal.jsx";
import { Search, Pencil, Trash2, Volume2, Loader2 } from "lucide-react";

export default function HistoryPage() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [speakingId, setSpeakingId] = useState(null);

  const ttsAudioRef = useRef(null);

  const loadHistory = useCallback(async (targetPage = 1, searchTerm = "") => {
    setLoading(true);
    try {
      const data = await api.listTranscriptions({ page: targetPage, perPage: 10, search: searchTerm });
      setItems(data.items || []);
      setPage(data.page || 1);
      setPages(data.pages || 1);
    } catch (err) {
      console.error("Failed to load history:", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory(1, "");
  }, [loadHistory]);

  const handleSearch = () => {
    setSearch(searchInput.trim());
    loadHistory(1, searchInput.trim());
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this transcription? This cannot be undone.")) return;
    try {
      await api.deleteTranscription(id);
      loadHistory(page, search);
    } catch (err) {
      alert("Failed to delete: " + err.message);
    }
  };

  const handleEditSave = async (id, newText) => {
    try {
      await api.updateTranscription(id, { text: newText });
      setEditing(null);
      loadHistory(page, search);
    } catch (err) {
      alert("Failed to save changes: " + err.message);
    }
  };

  const handleListen = async (item) => {
    if (speakingId) return;
    setSpeakingId(item.id);
    try {
      const url = await api.synthesizeSpeech(item.text);
      if (ttsAudioRef.current) {
        ttsAudioRef.current.pause();
        URL.revokeObjectURL(ttsAudioRef.current.src);
      }
      const audio = new Audio(url);
      ttsAudioRef.current = audio;
      audio.onended = () => setSpeakingId(null);
      audio.onerror = () => setSpeakingId(null);
      await audio.play();
    } catch (err) {
      alert("Text-to-speech failed: " + err.message);
      setSpeakingId(null);
    }
  };

  const formatDate = (isoStr) =>
    isoStr
      ? new Date(isoStr).toLocaleString(undefined, {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : "-";

  return (
    <div className="page">
      <div className="page-header">
        <h1>Transcription History</h1>
        <p className="page-subtitle">Browse, search, edit, or delete your saved transcriptions.</p>
      </div>

      <div className="card">
        <div className="search-bar">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search transcriptions…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button className="btn btn-outline" onClick={handleSearch}>
            Search
          </button>
        </div>

        {loading ? (
          <div className="empty-state">Loading…</div>
        ) : items.length === 0 ? (
          <div className="empty-state">No transcriptions found.</div>
        ) : (
          <div className="history-list">
            {items.map((item) => (
              <div className="history-row" key={item.id}>
                <div className="history-row-main">
                  <p className="history-text">{item.text}</p>
                  <div className="history-meta">
                    {item.detected_language && (
                      <span className="lang-chip lang-chip--small">{item.detected_language}</span>
                    )}
                    <span className="history-date">{formatDate(item.created_at)}</span>
                  </div>
                </div>
                <div className="history-row-actions">
                  <button
                    className="icon-btn"
                    title="Listen"
                    onClick={() => handleListen(item)}
                    disabled={speakingId !== null}
                  >
                    {speakingId === item.id ? (
                      <Loader2 size={16} className="spin" />
                    ) : (
                      <Volume2 size={16} />
                    )}
                  </button>
                  <button className="icon-btn" title="Edit" onClick={() => setEditing(item)}>
                    <Pencil size={16} />
                  </button>
                  <button
                    className="icon-btn icon-btn--danger"
                    title="Delete"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {pages > 1 && (
          <div className="pagination">
            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                className={`page-btn ${p === page ? "active" : ""}`}
                onClick={() => loadHistory(p, search)}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      <EditModal transcription={editing} onSave={handleEditSave} onCancel={() => setEditing(null)} />
    </div>
  );
}