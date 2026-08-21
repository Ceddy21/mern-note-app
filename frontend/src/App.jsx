import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import NoteList from './components/NoteList';
import NoteEditor from './components/NoteEditor';
import Login from './components/Login';
import OAuthRedirect from './components/OAuthRedirect';
import ProtectedRoute from './components/ProtectedRoute';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import VerifyEmail from './components/VerifyEmail';
import Profile from './components/Profile';
import { useNotes } from './hooks/useNotes';

const AppContent = () => {
  const { user, logout } = useAuth();
  const { notes, loading, addNote, editNote, removeNote } = useNotes();
  const [selectedNote, setSelectedNote] = React.useState(null);
  const [isEditorOpen, setIsEditorOpen] = React.useState(false);

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

  const goHome = () => {
    if (isEditorOpen) {
      closeEditor();
    }
  };

  const handleSave = async (noteData) => {
    try {
      if (selectedNote?._id) {
        await editNote(selectedNote._id, noteData);
      } else {
        await addNote(noteData);
      }
      closeEditor();
    } catch (err) {
      console.error('Save error:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await removeNote(id);
      closeEditor();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
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

      <Header user={user} onLogout={logout} onHomeClick={goHome} />

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
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/oauth-redirect" element={<OAuthRedirect />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppContent />
              </ProtectedRoute>
            }
          />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;