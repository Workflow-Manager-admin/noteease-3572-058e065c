import React, { useEffect, useState } from 'react';
import './App.css';
import Sidebar from './Sidebar';
import NoteEditor from './NoteEditor';
import { createClient } from '@supabase/supabase-js';

// --- Supabase configuration ---
const SUPABASE_URL = 'https://qgmcdylmdodofjpuuklq.supabase.co';
const SUPABASE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnbWNkeWxtZG9kb2ZqcHV1a2xxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExNjkzMzAsImV4cCI6MjA2Njc0NTMzMH0.Q3dbZtBZOZXwPL73kF1TR-asuum7vAcBMqbo-ihaN7k';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Note table name in Supabase
const NOTES_TABLE = 'notes';

/**
 * PUBLIC_INTERFACE
 * The main SPA for the notes application.
 * Features:
 * - Create, view, edit, and delete notes via Supabase backend
 * - Sidebar for notes navigation
 * - Minimalistic, light UI with palette:
 *    accent: #fbc02d, primary: #1976d2, secondary: #424242
 */
function App() {
  const [notes, setNotes] = useState([]);
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState('');
  const [theme] = useState('light'); // Always light, but logic retained for expansion

  // Fetch notes from Supabase on load
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    fetchNotes();
    // eslint-disable-next-line
  }, []);

  // PUBLIC_INTERFACE
  async function fetchNotes() {
    setLoading(true);
    setError('');
    const { data, error } = await supabase
      .from(NOTES_TABLE)
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      setError('Failed to load notes');
      setLoading(false);
    } else {
      setNotes(data || []);
      // Set first note as selected if none
      if (!selectedNoteId && (data || []).length > 0) {
        setSelectedNoteId(data[0].id);
      }
      setLoading(false);
    }
  }

  // PUBLIC_INTERFACE
  async function createNote() {
    setSyncing(true);
    setError('');
    const { data, error } = await supabase
      .from(NOTES_TABLE)
      .insert([{ title: 'Untitled note', content: '' }])
      .select()
      .single();

    if (error) {
      setError('Could not create note.');
    } else {
      setNotes((prev) => [data, ...prev]);
      setSelectedNoteId(data.id);
    }
    setSyncing(false);
  }

  // PUBLIC_INTERFACE
  async function updateNote(id, title, content) {
    setSyncing(true);
    setError('');
    const { data, error: upError } = await supabase
      .from(NOTES_TABLE)
      .update({ title, content, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (upError) {
      setError('Could not update note.');
    } else {
      // Update note in state
      setNotes((prev) =>
        prev.map((note) => (note.id === id ? { ...note, title, content, updated_at: data.updated_at } : note))
      );
    }
    setSyncing(false);
  }

  // PUBLIC_INTERFACE
  async function deleteNote(id) {
    setSyncing(true);
    setError('');
    const { error } = await supabase
      .from(NOTES_TABLE)
      .delete()
      .eq('id', id);

    if (error) {
      setError('Could not delete note.');
    } else {
      setNotes((prev) => prev.filter((note) => note.id !== id));
      // Reset selection
      if (selectedNoteId === id) {
        setSelectedNoteId(
          notes.length > 1
            ? notes.find((note) => note.id !== id)?.id || null
            : null
        );
      }
    }
    setSyncing(false);
  }

  const selectedNote = notes.find((note) => note.id === selectedNoteId) || null;

  // --- UI ---
  return (
    <div className="notes-root" data-theme={theme}>
      <Sidebar
        notes={notes}
        selectedNoteId={selectedNoteId}
        onSelect={setSelectedNoteId}
        onCreateNote={createNote}
        syncing={syncing}
      />
      <main className="notes-main">
        <header className="notes-main-header">
          <h1 className="app-title">NoteEase</h1>
          <div className="brand-bar" />
        </header>
        <section className="notes-main-content">
          {loading ? (
            <div className="msg-muted">Loading notes...</div>
          ) : selectedNote ? (
            <NoteEditor
              note={selectedNote}
              onSave={updateNote}
              onDelete={deleteNote}
              syncing={syncing}
            />
          ) : (
            <div className="msg-empty">No note selected.<br />Create a note or select one from the sidebar.</div>
          )}
          {error && <div className="error-bar">{error}</div>}
        </section>
      </main>
    </div>
  );
}

export default App;
