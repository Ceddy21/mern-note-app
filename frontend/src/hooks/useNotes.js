import { useState, useEffect, useCallback } from 'react';
import { getNotes, createNote, updateNote, deleteNote } from '../api';

export const useNotes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotes = useCallback(async () => {
    console.log('fetchNotes called');
    setLoading(true);
    try {
      console.log('Calling getNotes...');
      const response = await getNotes();
      console.log('Response:', response);
      const data = response.data || [];
      console.log('Data:', data);
      setNotes(data);
      setError(null);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to fetch notes');
    } finally {
      console.log('Setting loading to false');
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