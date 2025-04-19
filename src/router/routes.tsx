import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

// Import components directly to avoid dynamic import issues
import Layout from '../components/layout/Layout';
import Home from '../pages/Home';
import ArticlePage from '../pages/ArticlePage';
import SearchResults from '../pages/SearchResults';
import AuthPage from '../pages/AuthPage';
import ProfilePage from '../pages/ProfilePage';
import FavoritesPage from '../pages/FavoritesPage';
import ReadingHistoryPage from '../pages/ReadingHistoryPage';
import AlertsPage from '../pages/AlertsPage';
import SettingsPage from '../pages/SettingsPage';
import NotFoundPage from '../pages/NotFoundPage';

// Auth-protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // Check if user is authenticated by looking for a token in localStorage
  const isAuthenticated = localStorage.getItem('token') !== null;

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

// Define routes
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />
      },
      {
        path: 'article/:articleId',
        element: <ArticlePage />
      },
      {
        path: 'search',
        element: <SearchResults />
      },
      {
        path: 'auth',
        element: <AuthPage />
      },
      {
        path: 'profile',
        element: <ProtectedRoute><ProfilePage /></ProtectedRoute>
      },
      {
        path: 'favorites',
        element: <ProtectedRoute><FavoritesPage /></ProtectedRoute>
      },
      {
        path: 'history',
        element: <ProtectedRoute><ReadingHistoryPage /></ProtectedRoute>
      },
      {
        path: 'alerts',
        element: <ProtectedRoute><AlertsPage /></ProtectedRoute>
      },
      {
        path: 'settings',
        element: <ProtectedRoute><SettingsPage /></ProtectedRoute>
      },
      {
        path: '*',
        element: <NotFoundPage />
      }
    ],
  },
]);
