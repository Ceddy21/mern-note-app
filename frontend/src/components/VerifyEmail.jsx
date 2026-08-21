import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { FaSun, FaMoon, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import api from '../api';

const VerifyEmail = () => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [resendLoading, setResendLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await api.post('/auth/verify-email', { email, code });
      setMessage(response.data.message);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setError('');
    setMessage('');
    try {
      const response = await api.post('/auth/send-verification', { email });
      setMessage(response.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend code');
    } finally {
      setResendLoading(false);
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

        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-800 dark:text-white tracking-tight">
            Verify Your Email
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
            Enter the 6-digit code sent to <br />
            <span className="font-medium text-gray-700 dark:text-gray-300">{email || 'your email'}</span>
          </p>
        </div>

        {message && (
          <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-3 rounded-xl mb-4 text-sm border border-green-200 dark:border-green-800 flex items-center gap-2">
            <FaCheckCircle /> {message}
          </div>
        )}

        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-xl mb-4 text-sm border border-red-200 dark:border-red-800 flex items-center gap-2">
            <FaTimesCircle /> {error}
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Verification Code
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              required
              className="w-full px-3 py-3 border-2 border-gray-400 dark:border-gray-600 
                         rounded-xl bg-white dark:bg-gray-700 shadow-md text-center text-2xl tracking-widest
                         text-gray-800 dark:text-white placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         transition-all duration-200"
              placeholder="Enter code"
              maxLength="6"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 
                       text-white font-semibold py-3.5 rounded-xl transition-all duration-200 
                       shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed
                       transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Didn't receive the code?{' '}
            <button
              onClick={handleResend}
              disabled={resendLoading}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition"
            >
              {resendLoading ? 'Sending...' : 'Resend Code'}
            </button>
          </p>
        </div>

        <div className="text-center mt-4">
          <button
            onClick={() => navigate('/login')}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;