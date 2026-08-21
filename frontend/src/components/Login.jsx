import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  FaGoogle, 
  FaEnvelope, 
  FaLock, 
  FaUser, 
  FaSun, 
  FaMoon, 
  FaStickyNote,
  FaCheckCircle,
  FaTimesCircle,
  FaEye,
  FaEyeSlash
} from 'react-icons/fa';

const Login = () => {
  const { login, signup, googleLogin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError('');

    if (name === 'password') {
      setPasswordChecks({
        length: value.length >= 8,
        uppercase: /[A-Z]/.test(value),
        lowercase: /[a-z]/.test(value),
        number: /[0-9]/.test(value),
        special: /[!@#$%^&*_]/.test(value),  // ✅ underscore added
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    let result;
    if (isLogin) {
      result = await login(formData.email, formData.password);
    } else {
      result = await signup(formData.username, formData.email, formData.password);
    }

    if (!result.success) {
      setError(result.error);
    }
    setLoading(false);
  };

  const checkItems = [
    { key: 'length', label: 'At least 8 characters' },
    { key: 'uppercase', label: 'Contains uppercase letter' },
    { key: 'lowercase', label: 'Contains lowercase letter' },
    { key: 'number', label: 'Contains a number' },
    { key: 'special', label: 'Contains special character (!@#$%^&*_)' },  // ✅ updated
  ];

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

        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
            <FaStickyNote className="text-white text-3xl" />
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-800 dark:text-white tracking-tight">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
            {isLogin ? 'Sign in to access your notes' : 'Start organizing your life today'}
          </p>
        </div>

        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-xl mb-4 text-sm border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}

        <button
          onClick={googleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-700 
                     border-2 border-gray-300 dark:border-gray-600 rounded-xl py-3 
                     text-gray-700 dark:text-white font-medium hover:bg-gray-50 
                     dark:hover:bg-gray-600 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <FaGoogle className="text-red-500 text-lg" />
          <span>Continue with Google</span>
        </button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-gray-300 dark:border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium">
              or continue with email
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Username
              </label>
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-base" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required={!isLogin}
                  className="w-full pl-10 pr-3 py-3 border-2 border-gray-400 dark:border-gray-600 
                             rounded-xl bg-white dark:bg-gray-700 shadow-md
                             text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             transition-all duration-200"
                  placeholder="Enter username"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Email
            </label>
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-base" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-3 py-3 border-2 border-gray-400 dark:border-gray-600 
                           rounded-xl bg-white dark:bg-gray-700 shadow-md
                           text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           transition-all duration-200"
                placeholder="Enter email"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-base" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-12 py-3 border-2 border-gray-400 dark:border-gray-600 
                           rounded-xl bg-white dark:bg-gray-700 shadow-md
                           text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           transition-all duration-200"
                placeholder="Enter password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>

            {!isLogin && (
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
            )}
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-base" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className={`w-full pl-10 pr-12 py-3 border-2 rounded-xl bg-white dark:bg-gray-700 shadow-md
                             text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             transition-all duration-200
                             ${formData.confirmPassword && formData.password !== formData.confirmPassword
                               ? 'border-red-500'
                               : formData.confirmPassword && formData.password === formData.confirmPassword
                               ? 'border-green-500'
                               : 'border-gray-400 dark:border-gray-600'
                             }`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition"
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              </div>

              {formData.confirmPassword && (
                <div className="mt-1.5 flex items-center gap-2 text-sm">
                  {formData.password === formData.confirmPassword ? (
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
          )}

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
                Loading...
              </span>
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        <div className="text-center mt-6">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setFormData({ username: '', email: '', password: '', confirmPassword: '' });
              setPasswordChecks({
                length: false,
                uppercase: false,
                lowercase: false,
                number: false,
                special: false,
              });
            }}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 
                       dark:hover:text-blue-300 text-sm font-medium transition-colors duration-200"
          >
            {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;