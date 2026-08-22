import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { FaSun, FaMoon, FaCamera, FaArrowLeft, FaEye, FaEyeSlash } from 'react-icons/fa';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, logout, refreshUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // ── States ──
  const [username, setUsername] = useState(user?.username || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [deleteCode, setDeleteCode] = useState('');
  const [deleteStep, setDeleteStep] = useState('request');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [deleteCooldown, setDeleteCooldown] = useState(0);
  const [deleteCooldownActive, setDeleteCooldownActive] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (deleteCooldownActive && deleteCooldown > 0) {
      const timer = setTimeout(() => {
        setDeleteCooldown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (deleteCooldown === 0 && deleteCooldownActive) {
      setDeleteCooldownActive(false);
    }
  }, [deleteCooldown, deleteCooldownActive]);

  // ── Update username ──
  const handleUpdateUsername = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await api.put('/users/profile', { username });
      setMessage(res.data.message);
      await refreshUser();
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  // ── Change password ──
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await api.put('/users/password', { currentPassword, newPassword });
      setMessage(res.data.message);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  // ── Upload avatar ──
  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await api.post('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setAvatar(res.data.avatar);
      setMessage(res.data.message);
      await refreshUser();
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  // ── Delete account ──
  const requestDelete = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await api.post('/users/delete-request');
      setMessage(res.data.message);
      setDeleteStep('confirm');
      setDeleteCooldown(300);
      setDeleteCooldownActive(true);
    } catch (err) {
      const data = err.response?.data || {};
      if (data.remainingSeconds) {
        setDeleteCooldown(data.remainingSeconds);
        setDeleteCooldownActive(true);
        setError(data.message);
      } else {
        setError(data.message || 'Failed to request deletion');
      }
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await api.delete('/users/delete-account', { data: { code: deleteCode } });
      setMessage(res.data.message);
      logout();
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Deletion failed');
    } finally {
      setLoading(false);
    }
  };

  const resetDelete = () => {
    setDeleteStep('request');
    setDeleteCode('');
    setDeleteCooldown(0);
    setDeleteCooldownActive(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pt-16 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">

        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition"
          >
            <FaArrowLeft size={16} /> Back
          </button>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <FaMoon className="text-gray-700 text-lg sm:text-xl" />
            ) : (
              <FaSun className="text-yellow-400 text-lg sm:text-xl" />
            )}
          </button>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800 dark:text-white mb-4 sm:mb-6">
          Profile Settings
        </h1>

        {/* ── Messages ── */}
        {message && (
          <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-3 rounded-xl mb-4 text-sm border border-green-200 dark:border-green-800">
            {message}
          </div>
        )}
        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-xl mb-4 text-sm border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}

        {/* ── Avatar Section ── */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4 sm:p-6 mb-4 sm:mb-6 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
            <div className="relative flex-shrink-0">
              <img
                src={avatar || `https://ui-avatars.com/api/?name=${user?.username || 'User'}&background=3b82f6&color=fff&size=128`}
                alt="Avatar"
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-blue-500 shadow-lg"
              />
              <button
                onClick={() => fileInputRef.current.click()}
                className="absolute bottom-0 right-0 bg-blue-500 text-white p-1.5 sm:p-2 rounded-full hover:bg-blue-600 transition shadow-lg"
              >
                <FaCamera size={14} className="sm:text-base" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarUpload}
                accept="image/*"
                className="hidden"
              />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <p className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white">
                {user?.username}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 break-all">
                {user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* ── Update Username ── */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4 sm:p-6 mb-4 sm:mb-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white mb-3 sm:mb-4">
            Update Username
          </h2>
          <form onSubmit={handleUpdateUsername} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="flex-1 px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="New username"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition disabled:opacity-50 whitespace-nowrap"
            >
              Update Username
            </button>
          </form>
        </div>

        {/* ── Change Password ── */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4 sm:p-6 mb-4 sm:mb-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white mb-3 sm:mb-4">
            Change Password
          </h2>
          <form onSubmit={handleChangePassword} className="space-y-3 sm:space-y-4">
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 pr-12 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="Current password"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition"
              >
                {showCurrentPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>

            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 pr-12 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="New password"
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition"
              >
                {showNewPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>

            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 pr-12 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="Confirm new password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition"
              >
                {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition disabled:opacity-50"
            >
              Change Password
            </button>
          </form>
        </div>

        {/* ── Delete Account ── */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4 sm:p-6 border border-red-200 dark:border-red-800">
          <h2 className="text-lg sm:text-xl font-bold text-red-600 dark:text-red-400 mb-3 sm:mb-4">
            Delete Account
          </h2>

          {deleteStep === 'request' ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 flex-1">
                Permanently delete your account and all data. This cannot be undone.
              </p>
              <button
                onClick={requestDelete}
                disabled={loading}
                className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition disabled:opacity-50 whitespace-nowrap w-full sm:w-auto"
              >
                Request Deletion
              </button>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                A verification code was sent to your email. Enter it below to confirm deletion.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={deleteCode}
                  onChange={(e) => setDeleteCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="flex-1 px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-center text-lg tracking-widest focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                  placeholder="Enter 6-digit code"
                  maxLength="6"
                />
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <button
                    onClick={confirmDelete}
                    disabled={loading}
                    className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition disabled:opacity-50"
                  >
                    Confirm Delete
                  </button>
                  <button
                    onClick={resetDelete}
                    className="px-6 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-white rounded-xl font-semibold transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>

              {/* Resend Code with cooldown */}
              <div className="text-center mt-2">
                <button
                  onClick={requestDelete}
                  disabled={deleteCooldownActive}
                  className={`text-sm font-medium transition ${deleteCooldownActive ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed' : 'text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300'}`}
                >
                  {deleteCooldownActive ? `Resend in ${Math.floor(deleteCooldown/60)}:${(deleteCooldown%60).toString().padStart(2,'0')}` : 'Resend Code'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Loading Overlay ── */}
        {loading && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-2xl flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-700 dark:text-gray-300 font-medium">Processing...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;