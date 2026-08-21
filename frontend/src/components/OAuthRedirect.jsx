import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const OAuthRedirect = () => {
  const navigate = useNavigate();
  const { handleOAuthRedirect } = useAuth();
  const hasHandled = useRef(false);

  useEffect(() => {
    if (hasHandled.current) {
      console.log('Already handled, skipping');
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const error = params.get('error');

    console.log('Full URL:', window.location.href);
    console.log('Token found?', !!token);

    if (error) {
      console.log('Error:', error);
      hasHandled.current = true;
      navigate('/login?error=google_auth_failed');
      return;
    }

    if (token) {
      console.log('Token received, handling...');
      hasHandled.current = true;
      handleOAuthRedirect(token);
    } else {
      if (window.location.pathname === '/oauth-redirect') {
        console.log('No token on oauth-redirect, redirecting to login');
        hasHandled.current = true;
        navigate('/login');
      }
    }
  }, [navigate, handleOAuthRedirect]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Logging you in...</p>
      </div>
    </div>
  );
};

export default OAuthRedirect;