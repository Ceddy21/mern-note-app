// frontend/src/App.jsx
import React, { useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { FaCheckCircle, FaPlus, FaTrash } from 'react-icons/fa';
import Header from './components/Header';
import NoteList from './components/NoteList';
import NoteEditor from './components/NoteEditor';
import { useNotes } from './hooks/useNotes';

function App() {
  // ── Use the custom hook ──
  const { notes, loading, addNote, editNote, removeNote } = useNotes();

  const [selectedNote, setSelectedNote] = useState(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const openEditor = (note = null) => {
    setSelectedNote(note);
    setIsEditorOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeEditor = () => {
    setIsEditorOpen(false);
    setSelectedNote(null);
    document.body.style.overflow = 'auto';
  };

  // ── Save Note (Create or Update) ──
  const handleSave = async (noteData) => {
    try {
      if (selectedNote?._id) {
        // Edit existing note
        await editNote(selectedNote._id, noteData);
        toast.success(
          <div className="flex items-center gap-2">
            <FaCheckCircle className="text-white" /> Note updated successfully!
          </div>
        );
      } else {
        // Create new note
        await addNote(noteData);
        toast.success(
          <div className="flex items-center gap-2">
            <FaPlus className="text-white" /> Note created successfully!
          </div>
        );
      }
      closeEditor();
    } catch (err) {
      toast.error('Failed to save note');
    }
  };

  // ── Delete Note ──
  const handleDelete = async (id) => {
    try {
      await removeNote(id);
      closeEditor();
      toast.success(
        <div className="flex items-center gap-2">
          <FaTrash className="text-white" /> Note deleted successfully!
        </div>
      );
    } catch (err) {
      toast.error('Failed to delete note');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
          },
          success: {
            style: {
              background: '#10b981',
              color: '#fff',
            },
          },
          error: {
            style: {
              background: '#ef4444',
              color: '#fff',
            },
          },
        }}
      />

      <Header />

      {isEditorOpen ? (
        <NoteEditor
          note={selectedNote}
          onSave={handleSave}
          onDelete={handleDelete}
          onBack={closeEditor}
        />
      ) : (
        <NoteList
          notes={notes}
          onNoteClick={openEditor}
          onAddClick={() => openEditor(null)}
          loading={loading}
        />
      )}
    </div>
  );
}

export default App;