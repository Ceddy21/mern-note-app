// frontend/src/components/Header.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { FaStickyNote, FaSun, FaMoon, FaSignOutAlt, FaUser } from 'react-icons/fa';

const Header = ({ user, onLogout, onHomeClick }) => {
  const { theme, toggleTheme } = useTheme();
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();
  const appName = process.env.REACT_APP_APP_NAME || 'App Name';

  const handleToggle = () => {
    setIsAnimating(true);
    toggleTheme();
    setTimeout(() => setIsAnimating(false), 600);
  };

  const handleHomeClick = () => {
    if (onHomeClick) {
      onHomeClick();
    }
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 shadow-md transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <div
            onClick={handleHomeClick}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer select-none"
          >
            <FaStickyNote className="text-2xl sm:text-3xl text-blue-500 dark:text-blue-400" />
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-white tracking-tight">
              {appName}
            </h1>
          </div>

          {/* Right side unchanged */}
          <div className="flex items-center gap-3 sm:gap-4">
            {user && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="w-8 h-8 rounded-full border-2 border-blue-400"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                    <FaUser size={14} />
                  </div>
                )}
                <span className="hidden sm:inline">{user.username}</span>
              </div>
            )}

            <button
              onClick={onLogout}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              aria-label="Logout"
            >
              <FaSignOutAlt className="text-gray-600 dark:text-gray-300" />
            </button>

            <button
              onClick={handleToggle}
              className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full 
                         bg-gray-200 dark:bg-gray-700 
                         flex items-center justify-center 
                         transition-all duration-300 
                         hover:scale-110 hover:shadow-lg
                         focus:outline-none focus:ring-2 focus:ring-blue-400"
              aria-label="Toggle theme"
            >
              <div className={`absolute inset-0 flex items-center justify-center 
                              ${isAnimating ? 'animate-spinIcon' : ''}`}>
                {theme === 'light' ? (
                  <FaMoon className="text-gray-700 text-base sm:text-xl" />
                ) : (
                  <FaSun className="text-yellow-400 text-base sm:text-xl" />
                )}
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;