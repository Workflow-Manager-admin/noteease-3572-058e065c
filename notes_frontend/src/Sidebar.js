import React from 'react';
import './Sidebar.css';

// PUBLIC_INTERFACE
/**
 * Sidebar navigation showing notes and 'new note' button
 * @param {Array} notes - list of notes
 * @param {string} selectedNoteId - id of note currently selected
 * @param {function} onSelect - callback to select note
 * @param {function} onCreateNote - callback to add note
 * @param {boolean} syncing - whether syncing to server
 */
export default function Sidebar({ notes, selectedNoteId, onSelect, onCreateNote, syncing }) {
  return (
    <aside className="sidebar">
      <header className="sidebar-header">
        <span className="sidebar-title">NOTES</span>
        <button
          className="sidebar-add-btn"
          onClick={onCreateNote}
          disabled={syncing}
          aria-label="Create a new note"
          title="New note"
        >＋</button>
      </header>
      <nav className="sidebar-list">
        {notes.length === 0 && (
          <span className="sidebar-empty">No notes yet</span>
        )}
        {notes.map((note) => (
          <button
            key={note.id}
            className={`sidebar-note-btn${note.id === selectedNoteId ? ' selected' : ''}`}
            onClick={() => onSelect(note.id)}
            tabIndex={0}
            aria-current={note.id === selectedNoteId ? 'page' : undefined}
          >
            <span className="sidebar-note-title">{note.title || 'Untitled note'}</span>
            <span className="sidebar-note-upd">{note.updated_at ? new Date(note.updated_at).toLocaleString() : ''}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
