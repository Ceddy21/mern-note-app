// src/App.jsx
import React, { useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { FaCheckCircle, FaPlus, FaTrash } from 'react-icons/fa';
import Header from './components/Header';
import NoteList from './components/NoteList';
import NoteEditor from './components/NoteEditor';

function App() {
  const [notes, setNotes] = useState([
    {
      _id: '1',
      title: 'Welcome to your notes!',
      subject: 'Getting started',
      body: 'This is your first note. Click on it to edit. You can also change colors and fonts!',
      type: 'text',
      color: '#dbeafe',
      font: 'sans-serif',
      createdAt: new Date().toISOString(),
    },
    {
      _id: '2',
      title: 'Shopping List',
      subject: 'Groceries',
      body: 'Milk, Eggs, Bread, Butter',
      type: 'checkbox',
      checklist: [
        { text: 'Milk', checked: true },
        { text: 'Eggs', checked: false },
        { text: 'Bread', checked: true },
        { text: 'Butter', checked: false },
      ],
      color: '#d1fae5',
      font: 'sans-serif',
      createdAt: new Date().toISOString(),
    },
  ]);

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

  // ── Save Note (Create or Update) with Toast ──
  const handleSave = (noteData) => {
    if (selectedNote?._id) {
      // Edit existing note
      setNotes((prev) =>
        prev.map((n) =>
          n._id === selectedNote._id
            ? { ...n, ...noteData, updatedAt: new Date().toISOString() }
            : n
        )
      );
      toast.success(
        <div className="flex items-center gap-2">
          <FaCheckCircle className="text-white" /> Note updated successfully!
        </div>
      );
    } else {
      // Create new note
      const newNote = {
        _id: Date.now().toString(),
        ...noteData,
        createdAt: new Date().toISOString(),
      };
      setNotes((prev) => [newNote, ...prev]);
      toast.success(
        <div className="flex items-center gap-2">
          <FaPlus className="text-white" /> Note created successfully!
        </div>
      );
    }
    closeEditor();
  };

  // ── Delete Note with Toast ──
  const handleDelete = (id) => {
    setNotes((prev) => prev.filter((note) => note._id !== id));
    closeEditor();
    toast.success(
      <div className="flex items-center gap-2">
        <FaTrash className="text-white" /> Note deleted successfully!
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* ── Toast Notifications Container ── */}
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
          loading={false}
        />
      )}
    </div>
  );
}

export default App;