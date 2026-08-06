
import { useState, useEffect } from "react";

export default function EditModal({ transcription, onSave, onCancel }) {
  const [text, setText] = useState(transcription?.text || "");

  useEffect(() => {
    setText(transcription?.text || "");
  }, [transcription]);

  if (!transcription) return null;

  const handleSave = () => {
    const trimmed = text.trim();
    if (!trimmed) {
      alert("Text cannot be empty.");
      return;
    }
    onSave(transcription.id, trimmed);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Edit Transcription</h3>
        <textarea
          rows={5}
          value={text}
          onChange={(e) => setText(e.target.value)}
          autoFocus
        />
        <div className="controls">
          <button className="btn btn-primary" onClick={handleSave}>
            Save
          </button>
          <button className="btn btn-outline" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}