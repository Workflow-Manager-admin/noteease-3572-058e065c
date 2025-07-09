import React, { useState, useEffect } from 'react';
import './NoteEditor.css';

// PUBLIC_INTERFACE
/**
 * Note content editor for updating/deleting
 * @param {object} note - Current selected note {id, title, content}
 * @param {function} onSave - function(id, title, content)
 * @param {function} onDelete - function(id)
 * @param {boolean} syncing - is server syncing in progress
 */
export default function NoteEditor({ note, onSave, onDelete, syncing }) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [dirty, setDirty] = useState(false);

  // Reset editor when note changes
  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
    setDirty(false);
  }, [note.id, note.title, note.content]);

  const handleSave = () => {
    if (dirty && title.trim().length > 0) {
      onSave(note.id, title, content);
      setDirty(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm('Delete this note?')) {
      onDelete(note.id);
    }
  };

  return (
    <div className="editor-root">
      <input
        className="editor-title"
        value={title}
        placeholder="Untitled note"
        maxLength={100}
        onChange={e => { setTitle(e.target.value); setDirty(true); }}
        disabled={syncing}
      />
      <textarea
        className="editor-content"
        value={content}
        placeholder="Write something..."
        onChange={e => { setContent(e.target.value); setDirty(true); }}
        disabled={syncing}
        rows={12}
      />
      <div className="editor-actions">
        <button
          className="editor-save-btn"
          disabled={syncing || !dirty || title.trim().length === 0}
          onClick={handleSave}
        >Save</button>
        <button
          className="editor-del-btn"
          disabled={syncing}
          onClick={handleDelete}
        >Delete</button>
      </div>
      <div className="editor-meta">
        <span>
          Last modified:&nbsp;
          {note.updated_at ? new Date(note.updated_at).toLocaleString() : 'unknown'}
        </span>
      </div>
    </div>
  );
}
