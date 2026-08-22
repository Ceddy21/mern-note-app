import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const OAuthRedirect = () => {
  const navigate = useNavigate();
  const { handleOAuthRedirect } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const error = params.get('error');

    if (token || error) {
      window.history.replaceState({}, document.title, '/');
    }

    console.log('OAuthRedirect - Token:', token ? 'Found' : 'Not found');
    console.log('OAuthRedirect - Error:', error || 'None');

    if (error) {
      console.log('Error from Google:', error);
      navigate('/login?error=google_auth_failed');
      return;
    }

    if (token) {
      console.log('✅ Token received, calling handleOAuthRedirect');
      handleOAuthRedirect(token);
    } else {
      console.log('⚠️ No token found, redirecting to login');
      navigate('/login');
    }
  }, [navigate, handleOAuthRedirect]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-purple-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 transition-colors duration-300">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-300 font-medium">Logging you in...</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Please wait a moment</p>
      </div>
    </div>
  );
};

export default OAuthRedirect;