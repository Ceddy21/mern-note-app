import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { FaSun, FaMoon, FaSignOutAlt, FaUser } from 'react-icons/fa';
import ConfirmModal from './ConfirmModal';

const Header = ({ user, onLogout, onHomeClick }) => {
  const { theme, toggleTheme } = useTheme();
  const [isAnimating, setIsAnimating] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navigate = useNavigate();

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

  const LOGO_URL = 'https://res.cloudinary.com/sqlrnnth/image/upload/v1787311243/Nota_logo_nobg.png';
  const logoFilter = theme === 'dark' ? 'brightness(0) invert(1)' : 'none';

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    onLogout();
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 shadow-md transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">

            <div
              onClick={handleHomeClick}
              className="flex items-center cursor-pointer select-none"
            >
              {!logoError ? (
                <img
                  src={LOGO_URL}
                  alt="Nota Logo"
                  className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain transition-all duration-300"
                  style={{ filter: logoFilter }}
                  onError={() => setLogoError(true)}
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl text-white font-bold text-3xl sm:text-4xl">
                  N
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              {user && (
                <div
                  onClick={() => navigate('/profile')}
                  className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer hover:opacity-80 transition"
                  aria-label="Go to profile"
                >
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
                onClick={handleLogoutClick}
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

      {/* ── Logout Confirmation Modal ── */}
      <ConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={confirmLogout}
        title="Logout?"
        message="Are you sure you want to sign out? You'll need to log in again to access your notes."
      />
    </>
  );
};

export default Header;