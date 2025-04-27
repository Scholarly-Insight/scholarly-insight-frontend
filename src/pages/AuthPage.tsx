import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser, loginUser, signInWithGoogle, resetPassword } from '../services/firebase';

// import { createAccount } from "../actions/loginHandle";
// import { authAccount } from "../actions/loginHandle";

import { FaGoogle } from 'react-icons/fa';

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [isReset, setIsReset] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const handleToggleMode = () => {
    setIsLogin(!isLogin);
    setIsReset(false);
    setError(null);
    setSuccess(null);
  };

  const handleToggleReset = () => {
    setIsReset(!isReset);
    setError(null);
    setSuccess(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    try {
      setLoading(true);
      const userData = await loginUser(email, password);
      
      // Store token and user info in localStorage
      localStorage.setItem('token', userData.token || 'dummy-token-for-demo');
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userName', userData.displayName || email.split('@')[0]);
      
      // Dispatch custom event to notify about auth state change
      window.dispatchEvent(new Event('authStateChanged'));
      
      // Navigate to home page
      navigate('/');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign in';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password || !confirmPassword || !displayName) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const userData = await registerUser(email, password, displayName);
      
      // Store token and user info in localStorage
      localStorage.setItem('token', userData.token || 'dummy-token-for-demo');
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userName', displayName);
      
      // Initialize user settings with defaults
      const defaultSettings = {
        darkMode: false,
        emailNotifications: true,
        openPDFInNewTab: true,
        fullscreenPDFViewer: false,
        defaultSearchEngine: 'both',
        arXivCategories: ['cs.AI', 'cs.CL']
      };
      localStorage.setItem('userSettings', JSON.stringify(defaultSettings));
      
      // Dispatch custom event to notify about auth state change
      window.dispatchEvent(new Event('authStateChanged'));
      
      // Navigate to home page
      navigate('/');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create account';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const userData = await signInWithGoogle();
      
      // Store token and user info in localStorage
      localStorage.setItem('token', userData.token || 'dummy-token-for-demo');
      localStorage.setItem('userEmail', userData.email || '');
      localStorage.setItem('userName', userData.displayName || 'User');
      
      // Dispatch custom event to notify about auth state change
      window.dispatchEvent(new Event('authStateChanged'));
      
      // Navigate to home page
      navigate('/');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign in with Google';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    try {
      setLoading(true);
      await resetPassword(email);
      setSuccess('Password reset email sent. Check your inbox.');
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reset password';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white rounded-xl shadow-scholarly-card p-8">
        <h1 className="text-2xl font-bold text-center mb-6">
          <span className="scholarly-logo-text">Scholarly</span> Insight
        </h1>

        {isReset ? (
          <>
            <h2 className="text-xl font-medium text-center mb-6">Reset Password</h2>

            <form onSubmit={handleResetPassword}>
              <div className="mb-4">
                <label htmlFor="email" className="block text-scholarly-text text-sm font-medium mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 border border-scholarly-borderColor rounded-lg focus:outline-none focus:ring-2 focus:ring-scholarly-primary"
                  placeholder="your@email.com"
                />
              </div>

              {error && (
                <div className="mb-4 text-red-600 text-sm">{error}</div>
              )}

              {success && (
                <div className="mb-4 text-green-600 text-sm">{success}</div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-scholarly-primary text-white py-2 rounded-lg font-medium hover:bg-scholarly-primary/90 transition-colors disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Send Reset Email'}
              </button>

              <button
                type="button"
                onClick={handleToggleReset}
                className="w-full mt-4 text-scholarly-secondaryText text-sm hover:text-scholarly-primary"
              >
                Back to {isLogin ? 'Login' : 'Sign Up'}
              </button>
            </form>
          </>
        ) : (
          <>
            <h2 className="text-xl font-medium text-center mb-6">
              {isLogin ? 'Sign In' : 'Create Account'}
            </h2>

            <form onSubmit={isLogin ? handleLogin : handleRegister}>
              {!isLogin && (
                <div className="mb-4">
                  <label htmlFor="displayName" className="block text-scholarly-text text-sm font-medium mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full p-2 border border-scholarly-borderColor rounded-lg focus:outline-none focus:ring-2 focus:ring-scholarly-primary"
                    placeholder="John Doe"
                  />
                </div>
              )}

              <div className="mb-4">
                <label htmlFor="email" className="block text-scholarly-text text-sm font-medium mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 border border-scholarly-borderColor rounded-lg focus:outline-none focus:ring-2 focus:ring-scholarly-primary"
                  placeholder="your@email.com"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="password" className="block text-scholarly-text text-sm font-medium mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2 border border-scholarly-borderColor rounded-lg focus:outline-none focus:ring-2 focus:ring-scholarly-primary"
                  placeholder="••••••••"
                />
              </div>

              {!isLogin && (
                <div className="mb-4">
                  <label htmlFor="confirmPassword" className="block text-scholarly-text text-sm font-medium mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-2 border border-scholarly-borderColor rounded-lg focus:outline-none focus:ring-2 focus:ring-scholarly-primary"
                    placeholder="••••••••"
                  />
                </div>
              )}

              {error && (
                <div className="mb-4 text-red-600 text-sm">{error}</div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-scholarly-primary text-white py-2 rounded-lg font-medium hover:bg-scholarly-primary/90 transition-colors disabled:opacity-50"
              >
                {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
              </button>

              {isLogin && (
                <button
                  type="button"
                  onClick={handleToggleReset}
                  className="w-full mt-2 text-scholarly-secondaryText text-sm hover:text-scholarly-primary text-center"
                >
                  Forgot password?
                </button>
              )}
            </form>

            <div className="mt-6 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-scholarly-borderColor"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-scholarly-secondaryText">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-scholarly-buttonBg text-scholarly-text py-2 rounded-lg font-medium hover:bg-scholarly-hoverBg transition-colors disabled:opacity-50"
              >
                <FaGoogle className="text-red-500" />
                Google
              </button>
            </div>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={handleToggleMode}
                className="text-scholarly-secondaryText text-sm hover:text-scholarly-primary"
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
