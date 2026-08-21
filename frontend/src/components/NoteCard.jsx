import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { FaCheckCircle, FaEdit } from 'react-icons/fa';

const NoteCard = ({ note, onClick }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const formattedDate = new Date(note.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const checkedCount = note.checklist?.filter((item) => item.checked).length || 0;
  const totalItems = note.checklist?.length || 0;

  const backgroundColor = note.color || (isDark ? '#374151' : '#ffffff');
  const getTextColor = () => {
    if (note.color) return '#1f2937';
    return isDark ? '#f3f4f6' : '#1f2937';
  };
  const textColor = getTextColor();
  const isTextDark = textColor === '#1f2937';

  return (
    <div
      onClick={onClick}
      className="rounded-xl p-4 sm:p-5 cursor-pointer transition-all duration-200 
                 hover:scale-105 hover:shadow-xl border-2 border-transparent
                 hover:border-blue-400 dark:hover:border-blue-500"
      style={{
        backgroundColor,
        color: textColor,
        boxShadow: isDark 
          ? '0 4px 20px rgba(0,0,0,0.4)' 
          : '0 4px 20px rgba(0,0,0,0.08)',
        fontFamily: note.font || 'sans-serif',
      }}
    >
      {/* Type Badge */}
      <div className="flex justify-end mb-2">
        {note.type === 'checkbox' ? (
          <span className="text-[10px] sm:text-xs px-2 py-1 rounded-full 
                         bg-blue-500 dark:bg-blue-600 text-white font-medium 
                         flex items-center gap-1 shadow-sm">
            <FaCheckCircle size={10} /> Checklist
          </span>
        ) : (
          <span className="text-[10px] sm:text-xs px-2 py-1 rounded-full 
                         bg-gray-600 dark:bg-gray-700 text-white font-medium 
                         flex items-center gap-1 shadow-sm">
            <FaEdit size={10} /> Text
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className={`text-base sm:text-lg font-bold truncate ${isTextDark ? 'text-gray-800' : ''}`}>
        {note.title || 'Untitled'}
      </h3>

      {/* Subject */}
      {note.subject && (
        <p className={`text-sm mt-1 truncate ${isTextDark ? 'text-gray-700' : 'opacity-70'}`}>
          {note.subject}
        </p>
      )}

      {/* Body Preview */}
      <p className={`text-sm mt-2 line-clamp-2 ${isTextDark ? 'text-gray-600' : 'opacity-80'}`}>
        {note.type === 'checkbox'
          ? `${totalItems} items • ${checkedCount} checked`
          : note.body?.slice(0, 80) + (note.body?.length > 80 ? '...' : '')}
      </p>

      {/* Footer */}
      <div className={`flex items-center justify-between mt-3 pt-2 border-t ${isTextDark ? 'border-gray-300/50' : 'border-gray-300/30'}`}>
        <span className={`text-xs ${isTextDark ? 'text-gray-500' : 'opacity-60'}`}>
          {formattedDate}
        </span>
      </div>
    </div>
  );
};

export default NoteCard;