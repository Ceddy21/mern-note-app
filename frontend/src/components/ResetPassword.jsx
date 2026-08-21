import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { FaLock, FaCheckCircle, FaTimesCircle, FaArrowLeft, FaSun, FaMoon, FaEye, FaEyeSlash } from 'react-icons/fa';
import api from '../api';

const ResetPassword = () => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token');
    }
  }, [token]);

  const handlePasswordChange = (value) => {
    setNewPassword(value);
    setPasswordChecks({
      length: value.length >= 8,
      uppercase: /[A-Z]/.test(value),
      lowercase: /[a-z]/.test(value),
      number: /[0-9]/.test(value),
      special: /[!@#$%^&*_]/.test(value),
    });
  };

  const checkItems = [
    { key: 'length', label: 'At least 8 characters' },
    { key: 'uppercase', label: 'Contains uppercase letter' },
    { key: 'lowercase', label: 'Contains lowercase letter' },
    { key: 'number', label: 'Contains a number' },
    { key: 'special', label: 'Contains special character (!@#$%^&*_)' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    if (!token) {
      setError('Invalid reset token');
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/auth/reset-password', {
        token,
        newPassword,
      });
      setMessage(response.data.message);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-purple-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 transition-colors duration-300">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 sm:p-10 border-2 border-gray-300 dark:border-gray-700 relative">

        <button
          onClick={toggleTheme}
          className="absolute top-4 right-4 p-2.5 rounded-full bg-gray-200 dark:bg-gray-700 
                     hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? (
            <FaMoon className="text-gray-700 text-lg" />
          ) : (
            <FaSun className="text-yellow-400 text-lg" />
          )}
        </button>

        <button
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition mb-6"
        >
          <FaArrowLeft size={16} /> Back to Login
        </button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-800 dark:text-white tracking-tight">
            Reset Password
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
            Enter your new password below
          </p>
        </div>

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

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* New Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              New Password
            </label>
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-base" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => handlePasswordChange(e.target.value)}
                required
                className="w-full pl-10 pr-12 py-3 border-2 border-gray-400 dark:border-gray-600 
                           rounded-xl bg-white dark:bg-gray-700 shadow-md
                           text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           transition-all duration-200"
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition"
              >
                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>

            <div className="mt-3 space-y-1.5 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 border border-gray-200 dark:border-gray-700">
              {checkItems.map((item) => (
                <div key={item.key} className="flex items-center gap-2 text-sm">
                  {passwordChecks[item.key] ? (
                    <FaCheckCircle className="text-green-500 text-base" />
                  ) : (
                    <FaTimesCircle className="text-gray-300 dark:text-gray-600 text-base" />
                  )}
                  <span className={passwordChecks[item.key] 
                    ? 'text-green-600 dark:text-green-400 font-medium' 
                    : 'text-gray-500 dark:text-gray-400'
                  }>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-base" />
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className={`w-full pl-10 pr-12 py-3 border-2 rounded-xl bg-white dark:bg-gray-700 shadow-md
                           text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           transition-all duration-200
                           ${confirmPassword && newPassword !== confirmPassword
                             ? 'border-red-500'
                             : confirmPassword && newPassword === confirmPassword
                             ? 'border-green-500'
                             : 'border-gray-400 dark:border-gray-600'
                           }`}
                placeholder="Confirm your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition"
              >
                {showConfirm ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>

            {confirmPassword && (
              <div className="mt-1.5 flex items-center gap-2 text-sm">
                {newPassword === confirmPassword ? (
                  <>
                    <FaCheckCircle className="text-green-500 text-base" />
                    <span className="text-green-600 dark:text-green-400 font-medium">Passwords match</span>
                  </>
                ) : (
                  <>
                    <FaTimesCircle className="text-red-500 text-base" />
                    <span className="text-red-600 dark:text-red-400 font-medium">Passwords do not match</span>
                  </>
                )}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 
                       text-white font-semibold py-3.5 rounded-xl transition-all duration-200 
                       shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed
                       transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Resetting...
              </span>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;