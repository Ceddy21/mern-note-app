import React from 'react';
import { FaExclamationTriangle, FaTimes } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className={`rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl
                      ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <FaExclamationTriangle className="text-yellow-500 text-2xl" />
            <h2 className="text-xl font-bold">{title || 'Confirm'}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            <FaTimes />
          </button>
        </div>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {message || 'Are you sure you want to proceed?'}
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 
                       hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 
                       text-white transition font-semibold"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;