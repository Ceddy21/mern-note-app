// frontend/src/hooks/useNotes.js
import { useState, useEffect, useCallback } from 'react';
import { getNotes, createNote, updateNote, deleteNote } from '../api';

export const useNotes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotes = useCallback(async () => {
    console.log('1️⃣ fetchNotes called');
    setLoading(true);
    try {
      console.log('2️⃣ Calling getNotes...');
      const response = await getNotes();
      console.log('3️⃣ Response:', response);
      // Ensure we always set an array
      const data = response.data || [];
      console.log('4️⃣ Data:', data);
      setNotes(data);
      setError(null);
    } catch (err) {
      console.error('❌ Error:', err);
      setError('Failed to fetch notes');
      // In case of error, still set loading false
    } finally {
      console.log('5️⃣ Setting loading to false');
      setLoading(false);
    }
  }, []);

  const addNote = async (noteData) => {
    try {
      const response = await createNote(noteData);
      setNotes((prev) => [response.data, ...prev]);
      return response.data;
    } catch (err) {
      setError('Failed to create note');
      console.error(err);
      throw err;
    }
  };

  const editNote = async (id, noteData) => {
    try {
      const response = await updateNote(id, noteData);
      setNotes((prev) =>
        prev.map((note) => (note._id === id ? response.data : note))
      );
      return response.data;
    } catch (err) {
      setError('Failed to update note');
      console.error(err);
      throw err;
    }
  };

  const removeNote = async (id) => {
    try {
      await deleteNote(id);
      setNotes((prev) => prev.filter((note) => note._id !== id));
    } catch (err) {
      setError('Failed to delete note');
      console.error(err);
      throw err;
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  return { notes, loading, error, fetchNotes, addNote, editNote, removeNote };
};