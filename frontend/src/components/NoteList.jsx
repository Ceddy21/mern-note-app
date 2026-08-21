import React, { useState } from 'react';
import NoteCard from './NoteCard';
import { FaPlus, FaSearch } from 'react-icons/fa';

const NoteList = ({ notes, onNoteClick, onAddClick, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredNotes = notes.filter((note) => {
    const searchLower = searchTerm.toLowerCase().trim();
    if (!searchLower) return true;
    return (
      note.title?.toLowerCase().includes(searchLower) ||
      note.subject?.toLowerCase().includes(searchLower) ||
      note.body?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Search Bar */}
      <div className="relative max-w-xs sm:max-w-md mx-auto mb-6">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search notes..."
          className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
        />
        <FaSearch className="absolute left-3 top-3 text-gray-400" />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm font-medium"
          >
            Clear
          </button>
        )}
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'} found
        {searchTerm && ` matching "${searchTerm}"`}
      </div>

      {/* Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {filteredNotes.map((note) => (
          <NoteCard key={note._id} note={note} onClick={() => onNoteClick(note)} />
        ))}

        {filteredNotes.length === 0 && (
          <div className="col-span-full text-center py-16 opacity-50">
            <FaSearch className="text-6xl mx-auto mb-4 text-gray-400 dark:text-gray-600" />
            <p className="text-lg">
              {notes.length === 0
                ? 'No notes yet. Tap the + button to create one!'
                : `No notes match "${searchTerm}"`}
            </p>
            {notes.length > 0 && searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-4 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>

      <button
        onClick={onAddClick}
        className="fixed bottom-4 sm:bottom-8 right-4 sm:right-8 w-12 h-12 sm:w-14 sm:h-14 
                   bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg 
                   flex items-center justify-center transition-all duration-300 
                   hover:scale-110 hover:shadow-xl z-30"
      >
        <FaPlus className="text-xl sm:text-2xl" />
      </button>
    </div>
  );
};

export default NoteList;